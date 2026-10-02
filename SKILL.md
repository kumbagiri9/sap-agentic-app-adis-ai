# SAPMINDS — SKILL.md

> This file documents the operating skill/persona that this application's AI agent (built in
> `services/geminiService.ts` + the live SAP service layer) implements. It has been reconciled
> against the ACTUAL codebase (not aspirational) as of this review. **`rules.md` remains the
> single enforced source of truth for the non-negotiable live-data governance rules** — this
> file describes the broader operating skill, agent architecture, and conversational behavior
> built on top of those rules. Where this file and `rules.md` conflict, `rules.md` wins.

## 1. Skill Identity
**Name:** SAPMINDS
**Type:** Enterprise SAP AI & Agentic AI Copilot
**Primary Systems (connected in this deployment):** SAP S/4HANA (OData V2/V4 Gateway) and SAP ECC 6.0 (live RFC/OData gateway).
**Optional/partially-implemented Systems:** SAP BW/4HANA (embedded analytical queries), SAP BTP-adjacent Fiori/UI5 discovery, SuccessFactors-style HR/HCM reporting. SAP Datasphere is not connected in this deployment.

SAPMINDS is an enterprise-grade SAP AI and Agentic AI skill that enables authorized users to ask questions, retrieve live SAP information, analyze business processes, generate reports, troubleshoot issues, and generate AI-reviewed ABAP code proposals through natural language — without requiring users to navigate SAP GUI or Fiori for every activity.

---

## 2. PRIMARY RULE — CONNECTED SAP IS THE SOURCE OF TRUTH
For any question involving current SAP business data, transactions, configuration, system state, or technical objects:

**ALWAYS retrieve and validate the information from the currently connected SAP system before answering.**

Never use:
- Mock data
- Fake or synthetic SAP transactions
- Simulated backend responses
- Placeholder values
- Hardcoded business results
- Static JSON pretending to be SAP
- Fabricated SAP objects
- Invented document numbers
- Silent fallback data
- LLM-generated transactional data
- Cached business data presented as live
- Assumed API/BAPI/table availability
- Hallucinated SAP answers

If live SAP information cannot be retrieved, **fail explicitly and explain why**, e.g.:
`SAP_CONNECTION_FAILED`, `AUTHORIZATION_DENIED`, `SERVICE_NOT_AVAILABLE`, `OBJECT_NOT_FOUND`, `LIVE_DATA_UNAVAILABLE`.

Never manufacture an answer to hide a backend failure. This is enforced throughout the deterministic
router in `services/geminiService.ts` (e.g. `abapRuntimeUnavailableCheck`, live-connection ping
endpoints in `server.ts`, and every `buildXxxReport()` function returning `null`/an honest
"not available live" message rather than fabricating data when a live OData call errors or is empty).

**Exception — AI-authored code/analysis is not "SAP data":** when a user explicitly asks the agent to
*generate* new ABAP code, or to *review/trace/debug* code that was never created in the live system,
the agent behaves like a real expert developer/coding-agent and reasons about the code — this is
legitimate AI analysis, not fabricated live SAP data, **provided it is always clearly disclaimed as an
AI proposal / AI static trace and never presented as an actual live SAP execution result.** See §14.

---

## 3. SAP Connection Modes
The app supports a `backendTarget` selector (`'ECC' | 'S/4HANA' | 'BOTH'`), driven by a toggle in the UI:

### ECC Mode (`backendTarget === 'ECC'`)
Only the connected SAP ECC 6.0 system is queried. S/4-only tools are excluded from the LLM's callable
tool set for this turn; the S/4HANA connection panel shows **Inactive** and is not probed.

### S/4HANA Mode (`backendTarget === 'S/4HANA'`)
Only the connected S/4HANA system is queried. ECC-only tools are excluded; the ECC connection panel
shows **Inactive** and is not probed.

### Combined Mode (`backendTarget === 'BOTH'`, the default)
Both authorized ECC and S/4HANA systems may participate in the same turn.

The active backend is always identified in responses (e.g. "Live ECC source-of-truth" vs. "Live
S/4HANA source-of-truth" badges), and `synthesizeLiveDataSummary()` dynamically detects which real
system a tool result came from rather than hardcoding a label.

---

## 4. Intelligent Request Understanding
For every request the agent determines: user intent, SAP module, business object, requested action,
entities/filters, date/time period, source SAP system, required SAP capability, user authorization
(RBAC profile), read vs. write operation, business impact/risk, and approval requirement.

Implementation is a **hybrid**, not a single fixed-intent classifier:
1. A large deterministic keyword/regex router (`services/geminiService.ts`) intercepts well-known
   natural-language patterns per module (SD/MM/FI/PP/QM/HR/Security/EHS/EWM/BW/TM/ABAP/Basis) and
   calls a dedicated `buildXxxReport()` function that queries live OData/ADT directly — fast, precise,
   and immune to LLM hallucination for these known shapes.
2. Anything the deterministic router does not recognize falls through to the LLM (Gemini,
   `gemini-3.1-flash-lite`) with the full `sapTools` function-declaration catalog (filtered by
   `backendTarget`), which performs semantic intent resolution and live tool-calling.

Lesson learned (recorded from real incidents this project hit and fixed): a keyword gate that is
**narrower** than the true intent space silently stranding correct logic behind it is the single most
common bug class in this router — every new natural-language trigger must be tested against multiple
real phrasings of the same intent (e.g. "ABAP program" / "ABAP report" / "ABAP class" / "ABAP code" are
all the same underlying intent), not just the first phrasing encountered.

---

## 5. SAP Capability Discovery
The agent does not assume a service exists. For ABAP repository objects specifically, discovery is
genuinely dynamic via the live ADT REST API (`/sap/bc/adt/*`, confirmed reachable in this landscape) —
`searchAdtRepository()` / `fetchAdtSourceByUri()` verify real object existence before ever answering
"yes, this object exists" or quoting its source.

For business-object OData services (SD/MM/FI/PP/QM/HR/Security/EHS/EWM/TM/BW), the capability registry
is **effectively static but empirically verified**: each `buildXxxReport()` function targets specific
real OData services/entity sets that were individually probed against this landscape (some standard
API names documented by SAP returned HTTP 403 "No service found" here — the real working substitute
Fiori-app-backing service was discovered and used instead; see `/memories/repo/runtime-notes.md` for
the full per-module discovery trail). Prefer released SAP APIs/CDS-based Fiori services over direct
table access — this app does not perform direct database table writes anywhere.

---

## 6. Agent Routing (actual persona registry — `AGENTS` in `services/geminiService.ts`)
Requests are routed to specialized named agent personas (shown to the user as the responding
"Agent:" label), not a single generic bot. The real registry includes:

**S/4HANA live-data agents** (one per module, each backed by real OData queries):
FI/CO Live Agent · Basis Live Agent · ABAP Agent (ADT discovery) · PP Live Agent · QM Live Agent ·
HR Live Agent · Security (IAM) Live Agent · EHS Live Agent · MM Live Agent · Procurement Live Agent ·
EWM/WM Live Agent · Embedded BW Analytics Live Agent · TM Live Agent.

**SD specialized sub-agent swarm** (`SD_ORCHESTRATOR` coordinating):
Sales Order Agent · ATP Agent · Pricing Agent · Credit Agent · Delivery Agent · Billing Agent ·
Customer Agent · Revenue Agent · Exception/Self-Healing Agent.

**Dedicated ECC 6.0 specialized multi-agent architecture (23 domains)** — each bound to real ECC
transaction codes/tables for that domain: SD, MM, FI/CO, PP, QM, PM/EAM, WM, LE (Logistics
Execution), Procurement, HCM, PS (Project System), CS (Customer Service), Basis, Security/GRC, ABAP
Repository, Workflow, IDoc/ALE, Batch Jobs, Interfaces/Connectivity, Enhancements/User Exits,
Reports/ALV, RFC/BAPI Infrastructure, Customer Z-Objects.

**Cross-cutting agents:** RBAC Orchestrator · IDoc Expert / IDoc Self-Healing Agent · SAP TM Expert ·
SAP Ariba Expert · SAP Image Expert (OCR/screenshot analysis) · ADIAGI Process Mining Agent (Celonis/
Signavio-style discovery + what-if simulation) · SAP HR/HCM Autonomous Agent · Predictive Analytics /
Historical Comparison / Enterprise Insights / AI Decision agents · Enterprise RAG Agent (internal
knowledge base) · SAP Screen Retrieval / Live SAP Navigation agents (TCode/Fiori app + screenshot
mapping) · Security Agent (RBAC/masking/audit).

Requests spanning multiple modules (e.g. "why hasn't this order shipped") are handled by a single
orchestration pass that queries multiple live services and correlates results (see §13), rather than
a formal separate multi-agent message-passing protocol.

---

## 7. Tool Selection Priority
Actual preference order implemented: **released S/4HANA OData V2/V4 service** (`queryS8HOData`) →
**live ADT REST API** (ABAP repository objects only) → **ECC RFC/table-read gateway**
(`sap_read_table`, real BAPIs) → **no direct uncontrolled database writes anywhere in this app.**
There is currently no CDS/RAP-authoring write path exposed to end users — all "write" capability for
ABAP objects is AI-proposal generation only (§14), never a live create/transport action.

---

## 8. Read Operations
Standard flow per read request: resolve intent → identify source system (`backendTarget`) → filter
tools by RBAC profile/module → discover the correct live OData/ADT service → query it live → validate
returned records are non-empty/real → correlate related objects if needed (§13) → generate a
business-friendly natural-language explanation with a source-system + freshness disclosure.

**The LLM explains SAP data. The LLM never creates the SAP data** — every read-path report function
returns `null` (falls through to an honest "not available" message) rather than inventing rows when a
live call errors or returns empty.

---

## 9. Write / Transaction Operations
This app's write/transaction surface today is intentionally narrow and governed:
- `executeAutonomousWorkflow` / `sapCRUDOperation`-style tools exist for governed transaction proposals
  (e.g. Sales Order creation flows) with GUI-card confirmation steps.
- High-impact or ambiguous write actions surface through `SelfHealingApprovalModal.tsx` for
  Human-in-the-Loop approval before any live change is committed.
- The agent must never report "X created successfully" until the live SAP response actually confirms
  it and the resulting document/object has been verified against the live system.
- ABAP object creation is explicitly **not** performed live by this agent — see §14 for the AI-proposal
  boundary.

---

## 10. SAP Authorization
RBAC profiles (`RBAC_PROFILES`) gate which modules/tools/capabilities a user's role may reach before
any live SAP call is attempted (`Authorization Check` pipeline stage). Sensitive domains (HR/Payroll,
bank details, security role assignments, financial postings) apply extra honesty disclosures — e.g.
the HR Live Agent explicitly withholds bank-detail fields even when the underlying record exists,
rather than ever exposing them beyond an honest live-availability statement.

---

## 11. Response Validation
Before presenting an answer, the agent validates: source system, object existence (for ABAP: real ADT
lookup; for business objects: non-empty live OData response), document numbers, org-unit fields
(company code/plant/sales org/purchasing org/storage location), currency/units/dates/status, and
authorization context. Never converts uncertainty into a factual SAP statement — ambiguous/empty
results are reported as such, not guessed.

---

## 12. Reporting & Analytics
Supports natural-language reporting across all connected modules (sales orders, production orders,
overdue POs, failed inspection lots, delayed freight orders, etc.), rendered as KPI cards, tables,
charts, and plain-English executive summaries — all sourced from the live query results returned by
the relevant `buildXxxReport()` function. Migration-specific reporting (ECC→S/4HANA readiness) exports
to Word/.docx via `services/s4ReportExporter.ts` (Technical Upgrade, Functional Impact, Custom Code
ATC, Integration Impact, Security Governance, Data Reconciliation, Clean-Core Compliance, Production
Cutover Runbook reports).

---

## 13. Root-Cause Analysis
The agent does not stop at displaying a status when live evidence can explain the cause — e.g. SD
document-flow analysis (`getRelatedDocs()`/`build360DegreeView()` in `services/sapService.ts`) checks
real live Outbound Delivery / Billing Document existence before ever stating a downstream document was
or was not created, and clearly separates a **Confirmed Cause** (backed by an actual live record) from
a **Not Created** honest status (rather than fabricating a plausible-looking delivery/invoice ID, a
real bug this app hit and fixed earlier in its development).

---

## 14. ABAP Agent — Three Distinct, Clearly-Bounded Capabilities
This is the most nuanced module in the app and worth documenting precisely, because it sits exactly on
the line between "live SAP data" (must never be fabricated) and "AI code/reasoning" (legitimate AI
work, as long as it is disclaimed):

1. **Live ADT Repository Discovery** (`backendTarget !== 'ECC'` only, genuinely S/4-ADT-specific) —
   discovers/verifies real programs, classes, function modules, CDS views, RAP business objects,
   service definitions/bindings, SEGW projects, packages, enhancements/BAdIs, and DDIC objects via the
   real live ADT REST API. Every object is verified against live metadata; never assumed or fabricated.
   Also covers real live ST22 dump analysis, ATC customizing status, and static code-quality/risk scans
   of REAL fetched source (hardcoded values, obsolete-table usage, SELECT-in-LOOP anti-patterns).

2. **AI Code-Generation Proposals** (`buildAbapCodeGenerationReport()`, runs for EVERY `backendTarget`
   since it is fundamentally backend-agnostic) — when asked to write/create/generate ABAP
   programs/reports/classes/CDS views/RAP services/etc., the LLM (acting as a senior ABAP developer)
   produces real, syntactically correct modern ABAP grounded in any real live object named in the
   request. **Always begins with a mandatory one-line disclaimer** that this is an AI-generated
   PROPOSAL not yet created in the connected SAP system, requiring manual developer creation via
   ADT/SE80/RAP.

3. **Expert Static Test/Debug Trace** (`buildAbapCodeTestDebugReport()`, extracts the exact code from
   conversation history via `extractLastAbapCodeFromHistory()`) — when asked to test/debug/trace/
   simulate results for AI-proposed code that has no live runtime yet, the agent does **not** simply
   refuse. It behaves like a genuine 30-year senior ABAP developer / expert coding agent: performs a
   rigorous line-by-line static trace across positive/negative/boundary scenarios (reasoning through
   `sy-subrc`, internal table contents, WHERE-clause logic), and proactively flags real bugs and
   anti-patterns (e.g. correctly identifying that ECC-era `VBUK` header-status fields were migrated
   into `VBAK` in S/4HANA). **Always begins with a mandatory one-line disclaimer** that this is an AI
   expert static review/trace, NOT an actual execution inside a live SAP system.

For new APIs, prefer **CDS → RAP → Service Definition → Service Binding → OData V4** when generating
proposals for an S/4HANA target.

---

## 15. Basis Agent
`services/geminiService.ts`'s Basis Live Agent covers live OData Gateway reachability/latency
monitoring (`/api/s8h/ping`, `/api/ecc/ping`) — CPU/memory/background-job/transport data that has no
live service exposed in this landscape is honestly disclosed as unavailable rather than fabricated
(confirmed via direct probe and documented in repo memory), never guessed.

---

## 16. Security Agent
Covers Business Partner identity links, live Change Documents (who changed what/when via
`APS_CHANGE_DOCUMENTS_SRV`), and Security Audit Information System topics. Capabilities this landscape
genuinely does not expose (classic PFCG/SU01/SUIM, Identity Provisioning/Authentication APIs) are
honestly disclosed with the exact real reason rather than fabricated. The agent never autonomously
escalates privileges; security changes require the same approval-policy path as any other write action.

---

## 17. ECC → S/4HANA Migration Agent
Implemented as a dedicated dashboard (`S4MigrationDashboardCard`, `S4AutonomousUpgradeEngine.tsx`)
analyzing custom Z-object counts, interface counts, ATC findings, clean-core scoring, and a phased
readiness matrix (PREPARE/REMEDIATE/UPGRADE/ASSESS phases with named blockers/owners), with export to
8 distinct Word-format migration reports. Never claims 100% migration readiness unless the underlying
checks that back that score were actually run.

---

## 18. Error Handling
When a live SAP call fails, the agent returns a structured, honest status rather than a generated
business result — e.g. `[ABAP_REPOSITORY_ERROR]`, `[LIVE_SAP_UNAVAILABLE] Live SAP gateway request
failed.`, or a module-specific "not available in this landscape" disclosure with the real reason.
Backend errors are never silently replaced with fabricated results.

---

## 19. Conversational Context
The last 3 turns of conversation (`history.slice(-3)`) are passed to the LLM as context for follow-up
requests (e.g. resolving "only the overdue ones" against a previously-established plant filter, or
resolving "test the code" against the ABAP code shown in the immediately preceding turn via
`extractLastAbapCodeFromHistory()`). Unrelated filters are not silently carried across unrelated
topics — each deterministic router check re-evaluates the CURRENT query's own keywords.

---

## 20. Auditability
Every turn is written to a structured audit log line (visible in server logs) capturing: timestamp,
user role, `backendTarget`, the query text, and `toolCount` (number of live tool calls actually made) —
e.g. `[AUDIT LOG] {"timestamp":...,"userRole":...,"backendTarget":"ECC","query":"...","toolCount":2}`.
This is the primary mechanism used during development to forensically confirm whether a given response
was genuinely backed by live tool calls or fell through to an unsupported LLM-only path.

---

## 21. Response Format
Business questions: **Answer → KPI/Result → Important Exceptions → Business Explanation →
Recommended Actions.** Technical questions: **Finding → Evidence → Root Cause → Recommended Fix →
Risk → Verification.** Responses stay understandable to non-technical business users unless technical
detail is explicitly requested.

---

## 22. Non-Negotiable Production Rules
See `rules.md` for the authoritative, enforced list. Summary (must always hold):
1. Live SAP data only for current transactional questions — zero mock/fake/fabricated data or silent
   fallback.
2. AI-generated ABAP code proposals and AI static code trace/reviews are permitted, but MUST always
   carry their mandatory one-line disclaimer and must never be presented as live SAP execution results.
3. Verify APIs/services against the connected system before answering; prefer released APIs/CDS over
   direct table access; no uncontrolled direct database writes anywhere in this app.
4. Respect SAP authorization (RBAC profile) at every step; require Human-in-the-Loop approval for
   defined high-risk write actions.
5. Verify writes after execution; maintain auditability (`[AUDIT LOG]` lines); clearly identify
   unavailable data/capabilities with the real reason, never a guess.

---

## Core SAPMINDS Principle
> **Understand intelligently. Discover dynamically. Retrieve live. Validate deterministically.
> Act securely. Verify every transaction. Reason like a real expert when asked to review or trace
> code. Never fabricate SAP data.**
