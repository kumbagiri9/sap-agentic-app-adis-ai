# Read-only live RFC access to the S/4HANA system (S8H) through the configured SAProuter, reusing the
# proven SAP GUI Automation COM logic of sap_ecc_rfc_bridge.py. Only allow-listed read function modules run.
import json
import os
import sys
import time

import pythoncom

READ_ONLY_FUNCTIONS = {"ENQUEUE_READ"}


def configure_s4_environment():
    router = os.environ.get("SAP_S8H_SAPROUTER", "")
    host = os.environ.get("SAP_S8H_HANA_HOST", "")
    if not router or not host or not os.environ.get("SAP_S8H_USER") or not os.environ.get("SAP_S8H_PWD"):
        raise RuntimeError("S/4HANA RFC connection is not configured (SAP_S8H_SAPROUTER, SAP_S8H_HANA_HOST, SAP_S8H_USER, SAP_S8H_PWD)")
    os.environ["SAP_ECC_HOST"] = f"{router}/S/3299/H/{host}"
    os.environ["SAP_ECC_INSTANCE_NO"] = os.environ.get("SAP_S8H_INSTANCE", "00")
    os.environ["SAP_ECC_SYSID"] = os.environ.get("SAP_S8H_HANA_SYSTEMID", "S8H")
    os.environ["SAP_ECC_CLIENT"] = os.environ.get("SAP_S8H_CLIENT", "100")
    os.environ["SAP_ECC_USER"] = os.environ["SAP_S8H_USER"]
    os.environ["SAP_ECC_PASSWORD"] = os.environ["SAP_S8H_PWD"]


def main():
    pythoncom.CoInitialize()
    try:
        time.sleep(0.2)
        request = json.loads(sys.stdin.read())
        if request.get("functionName") not in READ_ONLY_FUNCTIONS:
            raise RuntimeError(f"Function module '{request.get('functionName')}' is not allowed on the read-only S/4HANA RFC bridge")
        configure_s4_environment()
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import sap_ecc_rfc_bridge
        result = sap_ecc_rfc_bridge.execute_function(request)
        print(json.dumps({"ok": True, "result": result}, default=str))
    except Exception as error:
        print(json.dumps({"ok": False, "error": str(error)}))
        sys.exit(1)
    finally:
        pythoncom.CoUninitialize()


if __name__ == "__main__":
    main()
