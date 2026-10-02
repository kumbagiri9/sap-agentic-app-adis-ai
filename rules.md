# SAP System & Data Integration Governance Rules (`rules.md`)

## Core Directives & Mandates

### 1. No Mock Data
- **Strict Prohibition**: Fabrication of mock data, dummy JSON objects, or placeholder records is strictly prohibited across all services and components.
- **Live Integration**: All data presented to users must originate directly from live system integrations, OData services, SAP RFCs, or real-time database queries in live SAP S/4HANA (e.g. Client 100).

### 2. No Fallbacks to Synthetic Data
- **Explicit Error & Empty Handling**: If a live system query, API call, or transaction lookup yields empty results, timeouts, or errors, the application must directly report the authentic live response or empty state.
- **No Invisible Fabrication**: The application must **never** silently fall back to synthetic, hardcoded, or pre-canned records upon API failure or missing parameters.

### 3. No Synthetic Data Generation
- Do not generate fake transaction histories, artificial telemetry, simulated document flows, or dummy master data records.
- All document relationship trees, line items, and financial postings must accurately reflect live S/4HANA (e.g., Client 100) business objects and master records.

### 4. No Hardcoded Values
- Avoid hardcoding document status codes, monetary amounts, line item quantities, header attributes, or transaction timestamps.
- Always perform dynamic parsing and fetching from live OData/REST/RFC responses.

### 5. Always Pull Live Data & Live Transactions Across All Functional Modules
- **Sales & Distribution (SD)**: Always query live Sales Orders (`A_SalesOrder`), Inquiries, Quotations, Outbound Deliveries (`A_OutbDeliveryHeader`), and Billing Documents (`A_BillingDocument`) from live S/4HANA OData services.
- **Materials Management & Procurement (MM)**: Query live Purchase Orders (`A_PurchaseOrder`), Requisitions (`A_PurchaseRequisition`), Goods Receipts, Stock Balances (`A_MaterialStock`), and Material Master records.
- **Production Planning (PP)**: Extract live Production Orders, Process Orders, Planned Orders, Work Centers, and MRP Run outputs.
- **Financial Accounting & Controlling (FI/CO)**: Pull live Journal Entries (`A_JournalEntry`), G/L Accounts (`A_OperationalAcctDoc`), Cost Centers, Internal Orders, and ACDOCA Universal Ledger entries directly from live database queries.
- **Extended Warehouse Management (EWM)**: Query live Warehouse Tasks, Inbound/Outbound Delivery Orders, Storage Bins, and Transfer Orders from live EWM services.
- **Master Data Governance (MDG) & Business Partner**: Fetch live Business Partners (`A_BusinessPartner`), Customer/Supplier Master records, and Change Requests directly from live MDG endpoints.
- **IDoc & ALE Integration**: Query live EDIDC (Control), EDIDD (Data), and EDIDS (Status) records. Report exact live status codes (50, 64, 62, 51, 53, 03) and authentic backend status text.
- **Quality Management (QM) & Plant Maintenance (PM)**: Retrieve live Inspection Lots, Usage Decisions, Equipment, Maintenance Orders, and Functional Locations.
- **Transportation Management (TM) & SAP Ariba Cloud**: Access live Freight Units, Transportation Orders, Tendering Statuses, and Ariba Spend/Sourcing records.
- **SAP ECC 6.0 Live Gateway**: Execute live RFCs, Dynamic Metadata Discovery (`DD02T`/`DD03L`/`TFDIR`), BAPI Schema inspection (`FUPARAREF`), Universal Table queries (`RFC_READ_TABLE`), and ABAP workbench changes with zero mock data.

---

### 6. SAP ECC 6.0 Execution Rules
1. **READ OPERATIONS**: Query tables directly using `sap_read_table` or execution function modules.
2. **WRITE/TRANSACTION OPERATIONS**: DO NOT edit standard SAP tables directly (e.g., DO NOT update VBAK or BSEG using table writes). MUST identify and execute the appropriate domain BAPI (e.g., BAPI_SALESORDER_CREATEFROMDAT2) to ensure SAP business rules and validations run.
3. **UNKNOWN MODULES**: If asked to perform an action in an unfamiliar module, use `sap_discover_metadata` to find the correct BAPI/table structure first.
4. **ABAP / USER EXITS**: Before editing standard includes or user exits, always call `sap_read_abap_code` to verify surrounding logic.
5. **DELETIONS & INTEGRITY**: Under no circumstances attempt to delete, truncate, or purge records. Preserve all existing business logic, features, functions, and GUI without disruption. No mock, simulation, or fallback data—always pull 100% live data.

---

## Pre-Implementation Mandate

> **CRITICAL**: Before implementing any process, service logic, API endpoint, or data processing routine, you **MUST** review `rules.md` and verify that all proposed implementation logic adheres strictly to these live-data governance principles.

