# Agent Guidelines & Development Mandates

## Pre-Implementation Requirement
- Before implementing any process, feature, API route, or service method, **ALWAYS read and comply with `rules.md`** located at the root of the project (`/rules.md`).

## Core Execution Rules
1. **No Mock Data**: Do not hardcode or generate mock, dummy, or synthetic data.
2. **No Fallbacks**: Never fall back to fabricated data when live queries fail or return empty results.
3. **No Synthetic Data**: Do not generate simulated transactions or placeholder objects.
4. **No Hardcoded Values**: Always dynamically retrieve values, document states, and transaction details from live system APIs and OData endpoints.
5. **Live Data Mandate Across All Functional Modules**:
   - Always pull live transactions, live S/4HANA records, and real-time backend data across all modules (SD, MM, PP, FI, CO, EWM, MDG, IDoc/ALE, QM, PM, TM, Ariba, Basis/Security).
   - Report authentic live backend statuses, error messages, and transaction states directly from S/4HANA.

