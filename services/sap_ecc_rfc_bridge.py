import json
import os
import sys
import time

import pythoncom
import win32com.client
import win32com.client.dynamic


def com_create(prog_id):
    # Always use pure dynamic dispatch for these legacy SAP GUI OCX controls. win32com.client.Dispatch
    # consults/auto-generates a gencache wrapper on first use, and that generation has already been
    # proven buggy here (it misclassified the zero-arg Call method as a property). Dynamic dispatch
    # never touches gencache, so it can't inherit that or similar member-mapping bugs.
    return win32com.client.dynamic.Dispatch(prog_id)


def set_row_value(row, column, value):
    row._oleobj_.Invoke(5, 0, pythoncom.DISPATCH_PROPERTYPUT, 0, column, value)


def table_value(table, row, column):
    return table._oleobj_.Invoke(23, 0, pythoncom.DISPATCH_PROPERTYGET, 1, row, column)


def call_function(function):
    # win32com's gencache can misclassify this zero-arg method as a property (returning
    # the bool directly), which then breaks callers doing function.Call(). Invoking the
    # documented dispid (6) directly with DISPATCH_METHOD sidesteps that misclassification.
    return bool(function._oleobj_.Invoke(6, 0, pythoncom.DISPATCH_METHOD, 1))


def with_com_retry(action, attempts=10):
    # The SAP GUI OCX controls finish internal init asynchronously; a fresh process can
    # transiently raise DISP_E_MEMBERNOTFOUND on any COM call, not just the first one.
    last_error = None
    for attempt in range(attempts):
        try:
            return action()
        except pythoncom.com_error as error:
            last_error = error
            pythoncom.PumpWaitingMessages()
            time.sleep(min(0.25 * (attempt + 1), 1.5))
    raise last_error


def connect(request):
    logon_control = com_create("SAP.LogonControl.1")
    connection = with_com_retry(logon_control.NewConnection)

    def configure_and_logon():
        connection.System = os.environ.get("SAP_ECC_SYSID", "ECC")
        connection.ApplicationServer = os.environ["SAP_ECC_HOST"]
        connection.SystemNumber = int(os.environ.get("SAP_ECC_INSTANCE_NO", "85"))
        connection.Client = request.get("client") or os.environ["SAP_ECC_CLIENT"]
        connection.User = os.environ["SAP_ECC_USER"]
        connection.Password = os.environ["SAP_ECC_PASSWORD"]
        connection.Language = os.environ.get("SAP_ECC_LANGUAGE", "EN")
        return connection.Logon(0, True)

    with_com_retry(configure_and_logon)

    if connection.IsConnected != 1:
        status = int(connection.IsConnected)
        raise RuntimeError(f"ECC RFC logon failed with SAP connection status {status}")

    return connection


def new_functions_control(connection):
    # Creating/binding SAP.Functions.Unicode can transiently raise DISP_E_MEMBERNOTFOUND
    # right after the OCX is instantiated in a fresh process; retry the whole bind step.
    def bind():
        functions = com_create("SAP.Functions.Unicode")
        functions._oleobj_.Invoke(
            4, 0, pythoncom.DISPATCH_PROPERTYPUTREF, 0, connection._oleobj_
        )
        return functions

    return with_com_retry(bind)


def read_table(request):
    connection = connect(request)

    try:
        functions = new_functions_control(connection)
        function = with_com_retry(lambda: functions.Add("RFC_READ_TABLE"))
        if function is None:
            raise RuntimeError("ECC did not expose RFC_READ_TABLE to the configured user")

        function.Exports("QUERY_TABLE").Value = request["table"]
        function.Exports("DELIMITER").Value = "\x1f"
        function.Exports("ROWCOUNT").Value = int(request["rowCount"])
        function.Exports("ROWSKIPS").Value = int(request["rowSkip"])

        with_com_retry(lambda: function.Tables("FIELDS"))
        fields_table = function.Tables("FIELDS")
        for field_name in request.get("fields", []):
            row = fields_table.AppendRow()
            set_row_value(row, "FIELDNAME", field_name)

        options_table = function.Tables("OPTIONS")
        for option in request.get("options", []):
            row = options_table.AppendRow()
            set_row_value(row, "TEXT", option)

        if not with_com_retry(lambda: call_function(function)):
            detail = function.Exception or f"return code {function.ReturnCode}"
            raise RuntimeError(f"RFC_READ_TABLE failed: {detail}")

        metadata = []
        for row in range(1, fields_table.RowCount + 1):
            metadata.append({
                "fieldName": str(table_value(fields_table, row, "FIELDNAME")).strip(),
                "offset": int(table_value(fields_table, row, "OFFSET") or 0),
                "length": int(table_value(fields_table, row, "LENGTH") or 0),
                "type": str(table_value(fields_table, row, "TYPE")).strip(),
                "fieldText": str(table_value(fields_table, row, "FIELDTEXT")).strip(),
            })

        data_table = function.Tables("DATA")
        rows = []
        field_names = [field["fieldName"] for field in metadata]
        for row in range(1, data_table.RowCount + 1):
            values = str(table_value(data_table, row, "WA")).split("\x1f")
            rows.append({name: values[index].strip() if index < len(values) else ""
                         for index, name in enumerate(field_names)})

        return {"rows": rows, "fields": metadata}
    finally:
        connection.Logoff()


def execute_function(request):
    # Generic live RFC/BAPI executor. Caller must explicitly name which import/export
    # parameters and tables to use — we never enumerate an unknown parameter collection,
    # since only the named-lookup form (Exports("NAME")/Tables("NAME")) has been verified
    # to work against this SAP GUI Automation stack.
    connection = connect(request)
    try:
        functions = new_functions_control(connection)
        functions.RetrieveDescription = True
        function_name = request["functionName"]
        function = with_com_retry(lambda: functions.Add(function_name))
        if function is None:
            raise RuntimeError(f"ECC did not expose function module '{function_name}' to the configured user")

        for name, value in request.get("importParams", {}).items():
            function.Exports(name).Value = value

        for table_name, table_rows in request.get("tableParams", {}).items():
            table = function.Tables(table_name)
            for row_values in table_rows:
                row = table.AppendRow()
                for column, value in row_values.items():
                    set_row_value(row, column, value)

        if not call_function(function):
            detail = function.Exception or f"return code {function.ReturnCode}"
            raise RuntimeError(f"{function_name} failed: {detail}")

        exportParams = {}
        for name in request.get("exportParamNames", []):
            exportParams[name] = function.Imports(name).Value

        outputTables = {}
        for table_name in request.get("outputTableNames", []):
            table = function.Tables(table_name)
            column_names = [table.ColumnName(i) for i in range(1, table.ColumnCount + 1)]
            rows = []
            for row in range(1, table.RowCount + 1):
                rows.append({col: table_value(table, row, col) for col in column_names})
            outputTables[table_name] = rows

        return {"exportParams": exportParams, "outputTables": outputTables}
    finally:
        connection.Logoff()


def main():
    # Explicit CoInitialize (instead of relying on pywin32's implicit first-use init) plus a
    # short settle delay before any SAP OCX call — the intermittent DISP_E_MEMBERNOTFOUND has
    # been observed even with dynamic dispatch and 6 retries, pointing to a genuine COM/DCOM
    # apartment-activation race in a brand-new process rather than a gencache mapping bug alone.
    pythoncom.CoInitialize()
    try:
        time.sleep(0.2)
        request = json.loads(sys.stdin.read())
        action = request.get("action", "read_table")
        result = execute_function(request) if action == "execute_function" else read_table(request)
        print(json.dumps({"ok": True, "result": result}))
    except Exception as error:
        print(json.dumps({"ok": False, "error": str(error)}))
        sys.exit(1)
    finally:
        pythoncom.CoUninitialize()


if __name__ == "__main__":
    main()
