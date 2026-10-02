import { FicoExecutiveQuestionAnswer } from '../types';

export const ALL_FICO_EXECUTIVE_QUESTIONS: FicoExecutiveQuestionAnswer[] = [
  // ==========================================
  // GROUP 1: GENERAL FINANCE (FI) [Q1 - Q10]
  // ==========================================
  {
    questionId: 'Q1',
    questionText: "Show today's financial summary.",
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'BKPF', 'BSEG', 'GLT0'],
    summaryAnswer: "Today's financial activity shows $245,000 in net revenue postings across Leading Ledger 0L, with $118,000 in AP vendor postings and $185,000 in customer AR clearings. Total working capital stands at $3.12M with net profit margin holding steady at 20.7%.",
    keyInsights: [
      "ACDOCA Universal Journal zero-balance consistency verified across all postings.",
      "Cash collections hit $185,000 today with 0 payment posting exceptions.",
      "AP liabilities increased by $118,000 with 3-way match validation passed."
    ],
    financialMetrics: [
      { label: "Today's Revenue", value: '$245,000', status: 'positive' },
      { label: "Today's Expenses", value: '$118,000', status: 'neutral' },
      { label: "Net Cash Inflow", value: '+$67,000', status: 'positive' },
      { label: 'Working Capital', value: '$3.12M', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Customer Receivables Inflow', value: '$185,000', variance: '+12.5%', detail: 'Doc Type DR / Clearings' },
      { category: 'Vendor Payables Outflow', value: '$118,000', variance: '-4.2%', detail: 'Doc Type KR / Invoices' },
      { category: 'G/L Accruals & Adjustments', value: '$22,000', variance: '0.0%', detail: 'Doc Type SA / G/L' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Financial Cockpit KPI Report', tcode: 'S_ALR_87012284', description: 'View full real-time G/L trial balance and financial statement hierarchy in S/4HANA.' },
      { actionName: 'Verify ACDOCA Ledger Status', tcode: 'FAGLB03', description: 'Display G/L account balances for Leading Ledger 0L and Parallel Ledger 2L.' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'What is our current cash position?',
    category: 'General Finance',
    sapSourceTables: ['FEBKO', 'FEBEP', 'BSIK', 'BSID', 'ACDOCA'],
    summaryAnswer: 'Total liquid cash and bank balances across all company code 1710 bank accounts total $4,820,000. Short-term 30-day projected net cash inflow is +$1,650,000, bringing estimated month-end cash liquidity to $6.47M.',
    keyInsights: [
      'Operating Bank Account (Citi USD) balance: $3,250,000.',
      'Payroll & Clearing Bank Account (JPMorgan USD) balance: $1,120,000.',
      'Euro Foreign Currency Reserve Account (Deutsche Bank EUR) balance: €415,000 ($450,000 equivalent).',
      'Zero unallocated electronic bank statement (CAMT.053) items pending reconciliation.'
    ],
    financialMetrics: [
      { label: 'Total Liquid Cash', value: '$4,820,000', status: 'positive' },
      { label: 'Operating Account (USD)', value: '$3,250,000', status: 'positive' },
      { label: '30-Day Net Cash Flow', value: '+$1,650,000', status: 'positive' },
      { label: 'Unreconciled Bank Items', value: '0 Items', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Citi Commercial USD Operating', value: '$3,250,000', variance: 'Liquid Cash', detail: 'House Bank CITI1 / Acct 100129' },
      { category: 'JPMorgan USD Payroll Clearing', value: '$1,120,000', variance: 'Liquid Cash', detail: 'House Bank JPM1 / Acct 200481' },
      { category: 'Deutsche Bank EUR Treasury', value: '$450,000', variance: 'Foreign Currency', detail: 'House Bank DB01 / Acct 300992' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Cash Position Analysis', tcode: 'FF63 / FF7A', description: 'Run SAP Cash Management cash position and liquidity forecast by house bank.' },
      { actionName: 'Process Electronic Bank Statement', tcode: 'FF_5', description: 'Import and auto-reconcile MT940 / CAMT.053 bank statement feeds.' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: "Show today's revenue by company code.",
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'A_BillingDocument', 'BKPF', 'CE11000'],
    summaryAnswer: "Total gross revenue generated today across all active company codes is $245,000. Company Code 1710 (US High-Tech) contributed $180,000 (73.5%), Company Code 1010 (DE Industrial) contributed $45,000 (18.4%), and Company Code 1720 (UK Services) contributed $20,000 (8.1%).",
    keyInsights: [
      'Company Code 1710 revenue driven by 2 major High-Tech Enterprise Hardware sales orders.',
      'Intercompany revenue postings between 1710 and 1720 eliminated automatically in CO-PA.',
      'Revenue recognition complies 100% with IFRS 15 / ASC 606 standards.'
    ],
    financialMetrics: [
      { label: 'Total Daily Revenue', value: '$245,000', status: 'positive' },
      { label: 'CC 1710 (US Hardware)', value: '$180,000', status: 'positive' },
      { label: 'CC 1010 (DE Industrial)', value: '$45,000', status: 'positive' },
      { label: 'CC 1720 (UK Services)', value: '$20,000', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Company Code 1710 (US Corp)', value: '$180,000', variance: '73.5% Share', detail: 'Billing Docs 900812, 900813' },
      { category: 'Company Code 1010 (DE Plant)', value: '$45,000', variance: '18.4% Share', detail: 'Billing Doc 900814 (€41,280)' },
      { category: 'Company Code 1720 (UK Consulting)', value: '$20,000', variance: '8.1% Share', detail: 'Billing Doc 900815 (£15,800)' }
    ],
    recommendedSapActions: [
      { actionName: 'Run CO-PA Sales Profitability Report', tcode: 'KE30 / VF05', description: 'Analyze profitability segment breakdown by company code and customer.' },
      { actionName: 'Review Intercompany Elimination', tcode: 'CX51 / FAGL_FC_TRANS', description: 'Verify intercompany revenue balance matching and elimination.' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: "What are today's expenses?",
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'BSEG', 'COSS', 'COSP'],
    summaryAnswer: "Total operating expenses recorded today across all cost centers equal $118,000. Primary expense drivers include Raw Material Component Purchasing ($68,000), R&D Subcontracted Engineering ($32,000), Logistics Air Freight Freight Surcharges ($12,000), and Facility Utilities ($6,000).",
    keyInsights: [
      'All $118,000 expenses allocated directly to valid S/4HANA Cost Centers.',
      '$68,000 raw material expense passed 3-way PO invoice verification in MIRO.',
      'No unbudgeted emergency expense authorizations required today.'
    ],
    financialMetrics: [
      { label: "Today's Total OPEX", value: '$118,000', status: 'neutral' },
      { label: 'Material Components', value: '$68,000', status: 'neutral' },
      { label: 'R&D Subcontracting', value: '$32,000', status: 'neutral' },
      { label: 'Logistics Freight', value: '$12,000', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Material Cost COGS (GL 51000000)', value: '$68,000', variance: 'Plant 1710', detail: 'Semiconductor Wafer Input' },
      { category: 'R&D Engineering (GL 61000100)', value: '$32,000', variance: 'CC-1002', detail: 'External Subcontractor Billing' },
      { category: 'Logistics Air Freight (GL 63000500)', value: '$12,000', variance: 'CC-1005', detail: 'Expedited Asia-Pacific Freight' },
      { category: 'Utilities & Facilities (GL 63000000)', value: '$6,000', variance: 'CC-1001', detail: 'Data Center Power Consumption' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Cost Center Line Items', tcode: 'KSB1', description: 'Review line-item postings for cost centers CC-1001 through CC-1005.' },
      { actionName: 'Run Actual vs Plan Variance Analysis', tcode: 'S_ALR_87013611', description: 'Analyze period budget variances across operating cost centers.' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: "Compare this month's revenue with last month.",
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'GLT0', 'CE11000', 'VF05'],
    summaryAnswer: "Month-to-date revenue for March 2026 stands at $4,320,000, representing a +$140,000 (+3.35%) increase compared to February 2026 ($4,180,000). Growth was driven primarily by a 14% surge in Cloud SaaS subscription renewals.",
    keyInsights: [
      'Cloud Services & SaaS (BU-200) revenue grew from $1.62M to $1.85M (+14.2%).',
      'Hardware Enterprise Sales (BU-100) remained stable at $2.10M (-0.95%).',
      'Professional Services (BU-300) held steady at $370,000.',
      'Gross profit margin decreased slightly from 54.2% to 52.8% due to raw material cost inflation.'
    ],
    financialMetrics: [
      { label: 'March MTD Revenue', value: '$4,320,000', status: 'positive' },
      { label: 'February Revenue', value: '$4,180,000', status: 'positive' },
      { label: 'MoM Revenue Growth', value: '+$140,000 (+3.35%)', status: 'positive' },
      { label: 'Top Growth Category', value: 'Cloud SaaS (+14.2%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'High-Tech Hardware (BU-100)', value: '$2,100,000', variance: '-0.95%', detail: 'Feb: $2,120,000 | Mar: $2,100,000' },
      { category: 'Cloud SaaS Solutions (BU-200)', value: '$1,850,000', variance: '+14.20%', detail: 'Feb: $1,620,000 | Mar: $1,850,000' },
      { category: 'Professional Services (BU-300)', value: '$370,000', variance: '-1.07%', detail: 'Feb: $374,000 | Mar: $370,000' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Executive Sales Analysis', tcode: 'MCSI / KE30', description: 'Drill down into product family revenue trends and customer contribution.' },
      { actionName: 'Export CO-PA Profitability Matrix', tcode: 'KE24', description: 'Extract line-item profit margin details for executive forecasting.' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show profit and loss for this month.',
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'FAGL_BS03', 'GLT0'],
    summaryAnswer: "March 2026 P&L shows Total Gross Revenue of $4,320,000, Cost of Goods Sold (COGS) of $2,038,000 (Gross Margin 52.8%), Total Operating Expenses (OPEX) of $1,387,000, yielding Net Operating Income of $895,000 (20.7% Net Margin).",
    keyInsights: [
      "Gross Revenue: $4,320,000 (+3.35% MoM).",
      "Gross Profit: $2,282,000 (52.8% Gross Margin).",
      "OPEX Total: $1,387,000 (R&D $520k, SG&A $610k, Logistics $257k).",
      "Net Profit: $895,000 (Exceeds baseline budget target of $870,000)."
    ],
    financialMetrics: [
      { label: 'Gross Revenue', value: '$4,320,000', status: 'positive' },
      { label: 'Gross Profit Margin', value: '52.8%', status: 'positive' },
      { label: 'Total OPEX', value: '$1,387,000', status: 'neutral' },
      { label: 'Net Profit', value: '$895,000 (20.7%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Gross Product Sales Revenue', value: '$4,320,000', variance: '+3.35%', detail: 'GL Account 41100000' },
      { category: 'Cost of Goods Sold (COGS)', value: '-$2,038,000', variance: '+5.10%', detail: 'GL Account 51000000' },
      { category: 'Research & Development OPEX', value: '-$520,000', variance: '+12.08%', detail: 'Cost Center CC-1002' },
      { category: 'Sales, General & Admin OPEX', value: '-$610,000', variance: '-1.20%', detail: 'Cost Center CC-1001 / CC-1003' },
      { category: 'Logistics & Distribution OPEX', value: '-$257,000', variance: '+4.30%', detail: 'Cost Center CC-1005' }
    ],
    recommendedSapActions: [
      { actionName: 'Generate Financial Statement Version', tcode: 'F.01 / FAGL_BS03', description: 'Run official SAP Income Statement hierarchy for Company Code 1710.' },
      { actionName: 'Execute Period-End Accruals', tcode: 'FBS1 / ACACTREE', description: 'Post required month-end revenue and expense accruals.' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Display the balance sheet as of today.',
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'FAGL_BS03', 'GLT0', 'BSID', 'BSIK'],
    summaryAnswer: 'Total Assets stand at $18,450,000 (Current Assets $9,820,000, Fixed Assets $8,630,000). Total Liabilities stand at $6,120,000 (AP Trade Payables $2,180,000, Short-term Debt $3,940,000). Total Shareholder Equity stands at $12,330,000 (Assets = Liabilities + Equity verified).',
    keyInsights: [
      'Current Assets include $4.82M Cash, $3.12M Receivables, and $1.88M Inventory.',
      'Working Capital ratio is a healthy 1.60x ($9.82M Current Assets vs $6.12M Liabilities).',
      'Zero balance sheet discrepancies between Leading Ledger 0L and IFRS Ledger 2L.'
    ],
    financialMetrics: [
      { label: 'Total Assets', value: '$18,450,000', status: 'positive' },
      { label: 'Total Liabilities', value: '$6,120,000', status: 'positive' },
      { label: 'Shareholder Equity', value: '$12,330,000', status: 'positive' },
      { label: 'Current Ratio', value: '1.60x', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Cash & Cash Equivalents', value: '$4,820,000', variance: '26.1% Assets', detail: 'G/L 10000000 - 10099999' },
      { category: 'Accounts Receivable Domestic', value: '$3,120,000', variance: '16.9% Assets', detail: 'G/L 11000000 (Subledger BSID)' },
      { category: 'Raw Materials & FG Inventory', value: '$1,880,000', variance: '10.2% Assets', detail: 'G/L 12000000 (MM Valuation)' },
      { category: 'Property, Plant & Equipment', value: '$8,630,000', variance: '46.8% Assets', detail: 'Asset Accounting (AA/ACDOCA)' },
      { category: 'Accounts Payable Trade', value: '$2,180,000', variance: '11.8% Liabilities', detail: 'G/L 21100000 (Subledger BSIK)' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Full Balance Sheet Report', tcode: 'FAGLB03 / F.01', description: 'Display complete Balance Sheet according to US GAAP / IFRS structure.' },
      { actionName: 'Verify Asset History Sheet', tcode: 'S_ALR_87011990', description: 'Validate fixed asset capitalization and depreciation postings in Asset Accounting.' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'What are our biggest operating expenses?',
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'COSS', 'COSP', 'KSB1'],
    summaryAnswer: 'The top 3 operating expenses are R&D External Subcontracting ($520,000 / 37.5% of OPEX), Sales & Marketing Payroll ($410,000 / 29.6% of OPEX), and IT Infrastructure & Cloud Computing ($210,000 / 15.1% of OPEX).',
    keyInsights: [
      'R&D Subcontracting experienced a +$145,000 budget overrun due to IoT Edge project acceleration.',
      'Sales Payroll aligns 100% with headcount plan.',
      'IT Cloud Computing includes a +$26,000 temporary simulation compute burst in SAP BTP.'
    ],
    financialMetrics: [
      { label: 'Top OPEX Driver', value: '$520,000 (R&D Subcontracting)', status: 'warning' },
      { label: '2nd OPEX Driver', value: '$410,000 (Sales Payroll)', status: 'neutral' },
      { label: '3rd OPEX Driver', value: '$210,000 (IT Cloud Infra)', status: 'neutral' },
      { label: 'Combined Top 3 Share', value: '82.2% of Total OPEX', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'R&D Subcontracted Engineering', value: '$520,000', variance: '+12.1%', detail: 'GL 61000100 | CC-1002' },
      { category: 'Sales & Marketing Personnel Payroll', value: '$410,000', variance: '0.0%', detail: 'GL 60000000 | CC-1003' },
      { category: 'IT Infrastructure & BTP Cloud', value: '$210,000', variance: '+14.1%', detail: 'GL 65000000 | CC-1001' },
      { category: 'Facilities & Building Utilities', value: '$135,000', variance: '+2.1%', detail: 'GL 63000000 | CC-1001' },
      { category: 'Logistics Air Freight Surcharges', value: '$112,000', variance: '+18.4%', detail: 'GL 63000500 | CC-1005' }
    ],
    recommendedSapActions: [
      { actionName: 'Run OPEX Cost Center Analysis', tcode: 'S_ALR_87013611', description: 'Analyze line-item costs across all corporate and operational cost centers.' },
      { actionName: 'Audit R&D Purchase Orders', tcode: 'ME23N', description: 'Review outstanding R&D subcontracting purchase order commitments.' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Which GL accounts had unusual activity today?',
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'BKPF', 'BSEG'],
    summaryAnswer: 'AI Anomaly Detection identified 2 G/L accounts with statistical volume spikes: G/L 63000500 (Freight Expenses) with a +$18,200 unplanned debit posting, and G/L 65000000 (IT Cloud Compute) with a +$26,000 out-of-pattern adjustment.',
    keyInsights: [
      'G/L 63000500: Expedited air freight charge posted without prior PO commitment.',
      'G/L 65000000: BTP cloud burst invoice posted at 02:14 AM.',
      'Both postings were validated for mathematical balance in ACDOCA Universal Journal.'
    ],
    financialMetrics: [
      { label: 'Flagged G/L Accounts', value: '2 Accounts', status: 'warning' },
      { label: 'Freight Expense Spike', value: '+$18,200', status: 'warning' },
      { label: 'IT Cloud Spike', value: '+$26,000', status: 'warning' },
      { label: 'Unbalanced Postings', value: '0 Items', status: 'positive' }
    ],
    breakdownData: [
      { category: 'GL 63000500 (Inbound Freight)', value: '$18,200', variance: 'Z-Score 3.8', detail: 'Doc #10002014 | Expedited Air Freight' },
      { category: 'GL 65000000 (IT Infrastructure)', value: '$26,000', variance: 'Z-Score 3.2', detail: 'Doc #10002029 | BTP Cloud Compute Burst' }
    ],
    recommendedSapActions: [
      { actionName: 'Display G/L Document Line Items', tcode: 'FAGLL03', description: 'Inspect individual line items and posting text for G/L 63000500 and 65000000.' },
      { actionName: 'Review Off-Hours Document Approval', tcode: 'FB03', description: 'Inspect header details and attachment list for Document #10002029.' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Show all financial postings made today.',
    category: 'General Finance',
    sapSourceTables: ['ACDOCA', 'BKPF', 'BSEG'],
    summaryAnswer: 'A total of 142 financial journal documents were posted today across Company Code 1710, generating 384 ACDOCA line items. Total Debit Volume: $1,420,000 | Total Credit Volume: $1,420,000 (Zero ledger discrepancy).',
    keyInsights: [
      'Document Type SA (G/L Postings): 82 documents ($620,000).',
      'Document Type DR (Customer Invoices): 38 documents ($480,000).',
      'Document Type KR (Vendor Invoices): 22 documents ($320,000).',
      '100% of postings passed automated validation checks in SAP S/4HANA.'
    ],
    financialMetrics: [
      { label: 'Total Posted Documents', value: '142 Documents', status: 'positive' },
      { label: 'ACDOCA Line Items', value: '384 Items', status: 'positive' },
      { label: 'Total Volume Posted', value: '$1,420,000', status: 'positive' },
      { label: 'Discrepancy Amount', value: '$0.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'G/L General Journal (SA)', value: '82 Docs', variance: '$620,000 Volume', detail: 'Standard G/L Accruals & Adjustments' },
      { category: 'Customer Invoices (DR)', value: '38 Docs', variance: '$480,000 Volume', detail: 'SD Billing Invoices Posted to AR' },
      { category: 'Vendor Invoices (KR)', value: '22 Docs', variance: '$320,000 Volume', detail: 'MM MIRO Vendor Invoices Posted to AP' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Daily Journal Entry Audit Log', tcode: 'S_ALR_87012293', description: 'Generate comprehensive list of all accounting documents posted today.' },
      { actionName: 'Verify Document Compact Journal', tcode: 'S_ALR_87012287', description: 'Review sequential accounting document numbers and user IDs.' }
    ]
  },

  // ==========================================
  // GROUP 2: ACCOUNTS PAYABLE (AP) [Q11 - Q20]
  // ==========================================
  {
    questionId: 'Q11',
    questionText: 'Show overdue vendor invoices.',
    category: 'Accounts Payable',
    sapSourceTables: ['BSIK', 'LFA1', 'BSAK', 'REGUP'],
    summaryAnswer: 'There are currently 8 overdue vendor invoices totaling $382,500. The largest overdue item is Invoice #INV-8821 from Silicon Foundry AG ($182,000, 24 days overdue).',
    keyInsights: [
      'Silicon Foundry AG ($182,000 overdue): Blocked due to quantity variance in Goods Receipt 50000019.',
      'Asia Tech Supply ($112,000 overdue): Awaiting price tolerance override in MIRO.',
      '6 minor vendor invoices ($88,500 total): Scheduled for release in upcoming Friday payment run.'
    ],
    financialMetrics: [
      { label: 'Overdue Vendor Payables', value: '$382,500', status: 'negative' },
      { label: 'Overdue Invoices Count', value: '8 Invoices', status: 'warning' },
      { label: 'Largest Overdue Item', value: '$182,000 (Silicon Foundry)', status: 'negative' },
      { label: 'Average Days Overdue', value: '18.4 Days', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Silicon Foundry AG (VEND-3001)', value: '$182,000', variance: '24 Days Overdue', detail: 'Inv #INV-8821 | GR Quantity Discrepancy' },
      { category: 'Asia Tech Supply Co (VEND-3005)', value: '$112,000', variance: '16 Days Overdue', detail: 'Inv #INV-9012 | Price Tolerance Block' },
      { category: 'Precision Tooling Corp (VEND-3012)', value: '$45,000', variance: '12 Days Overdue', detail: 'Inv #INV-7718 | Awaiting Approval' },
      { category: '5 Other Direct Suppliers', value: '$43,500', variance: '1-10 Days Overdue', detail: 'Scheduled for F110 Batch Payment' }
    ],
    recommendedSapActions: [
      { actionName: 'Display AP Overdue Items', tcode: 'FBL1N', description: 'Display vendor open line items filtered by net due date.' },
      { actionName: 'Release Blocked Invoices', tcode: 'MRBR', description: 'Review and release blocked supplier invoices for payment.' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which vendor payments are due today?',
    category: 'Accounts Payable',
    sapSourceTables: ['BSIK', 'REGUP', 'LFA1'],
    summaryAnswer: 'A total of 14 vendor invoices totaling $482,000 reach their net due date today. Executing today’s F110 payment proposal will capture $9,640 in 2.0% early payment cash discounts.',
    keyInsights: [
      'All 14 invoices verified with 3-way match (PO + GR + IR).',
      'Total available cash discount capture: $9,640.',
      'Sufficient cash balance available in Citi USD Operating account ($3.25M).'
    ],
    financialMetrics: [
      { label: 'Due Today Total Amount', value: '$482,000', status: 'neutral' },
      { label: 'Invoices Due Today', value: '14 Invoices', status: 'neutral' },
      { label: 'Early Cash Discount', value: '+$9,640 (2.0%)', status: 'positive' },
      { label: 'Payment Method', value: 'ACH / SEPA Direct', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Global Logistics GmbH', value: '$180,000', variance: 'Net Due Today', detail: '2% Discount Capture ($3,600)' },
      { category: 'Ariba Supplier Settlement', value: '$152,000', variance: 'Net Due Today', detail: '2% Discount Capture ($3,040)' },
      { category: 'Microchip Components Ltd', value: '$95,000', variance: 'Net Due Today', detail: '2% Discount Capture ($1,900)' },
      { category: '11 Other Direct Vendors', value: '$55,000', variance: 'Net Due Today', detail: 'Standard Term Clearings ($1,100)' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Automated Payment Run', tcode: 'F110', description: 'Create and execute automatic payment run for invoices due today.' },
      { actionName: 'Review Payment Proposal', tcode: 'FBZ1 / REGUP', description: 'Inspect individual payments and discount allocations in proposal.' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Display blocked invoices awaiting approval.',
    category: 'Accounts Payable',
    sapSourceTables: ['RBKP', 'RSEG', 'BSIK'],
    summaryAnswer: 'There are currently 12 supplier invoices totaling $348,200 blocked for payment in SAP S/4HANA due to price variances (5 items), quantity variances (4 items), or manual inspection holds (3 items).',
    keyInsights: [
      'Price Variances ($162,000 total): Unit price exceeds PO price threshold by >3%.',
      'Quantity Variances ($118,000 total): Invoice quantity exceeds Goods Receipt quantity.',
      'Manual Holds ($68,200 total): Pending buyer quality release in MM.'
    ],
    financialMetrics: [
      { label: 'Total Blocked Invoices', value: '12 Invoices', status: 'warning' },
      { label: 'Total Blocked Amount', value: '$348,200', status: 'warning' },
      { label: 'Price Variance Blocks', value: '5 Invoices ($162k)', status: 'warning' },
      { label: 'Quantity Variance Blocks', value: '4 Invoices ($118k)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Price Variance Block (RSEG)', value: '$162,000', variance: '5 Invoices', detail: 'Unit Price > PO Target' },
      { category: 'Quantity Variance Block (RSEG)', value: '$118,000', variance: '4 Invoices', detail: 'IR Quantity > GR Quantity' },
      { category: 'Manual Quality Hold (RBKP)', value: '$68,200', variance: '3 Invoices', detail: 'Pending QM Usage Decision' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute MRBR Invoice Release', tcode: 'MRBR', description: 'List and release blocked invoices individually or automatically.' },
      { actionName: 'Inspect PO Purchase Order History', tcode: 'ME23N', description: 'Compare invoice line items against PO and Goods Receipt records.' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Why is invoice 5100001234 blocked?',
    category: 'Accounts Payable',
    sapSourceTables: ['RBKP', 'RSEG', 'EKBE', 'EKPO'],
    summaryAnswer: 'Invoice 5100001234 ($182,000 from Silicon Foundry AG) is blocked due to a Price Variance on Line Item 10: Invoiced price of $182.00/unit exceeds Purchase Order #4500001092 agreed rate of $165.00/unit (+10.3% price variance exceeding the 3.0% SAP tolerance parameter).',
    keyInsights: [
      'Vendor Invoice Amount: $182,000 (1,000 units @ $182.00).',
      'PO Rate: $165,000 (1,000 units @ $165.00). Price Delta: +$17,000.',
      'SAP Blocking Reason: RSEG-SPGRP (Price Variance Block active).',
      'Action required: Buyer approval or vendor credit memo requested.'
    ],
    financialMetrics: [
      { label: 'Invoice Number', value: '5100001234', status: 'neutral' },
      { label: 'Invoiced Amount', value: '$182,000', status: 'neutral' },
      { label: 'PO Rate Target', value: '$165,000', status: 'neutral' },
      { label: 'Price Variance Delta', value: '+$17,000 (+10.3%)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Invoiced Rate (RSEG)', value: '$182.00 / Unit', variance: '1,000 Units', detail: 'Supplier Invoice 5100001234' },
      { category: 'PO Agreed Rate (EKPO)', value: '$165.00 / Unit', variance: '1,000 Units', detail: 'Purchase Order 4500001092' },
      { category: 'Excess Charge Delta', value: '+$17.00 / Unit', variance: '+$17,000 Total', detail: 'Exceeds SPRO Tolerance T169P' }
    ],
    recommendedSapActions: [
      { actionName: 'Release Invoice Override', tcode: 'MRBR', description: 'Force release invoice block with buyer authorization.' },
      { actionName: 'Request Vendor Credit Memo', tcode: 'MIRO', description: 'Post vendor credit memo for $17,000 price discrepancy.' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show vendor aging analysis.',
    category: 'Accounts Payable',
    sapSourceTables: ['BSIK', 'LFA1', 'BSAK'],
    summaryAnswer: 'Total outstanding Accounts Payable liabilities stand at $2,180,000. Aging distribution: 1-30 Days Current: $1,420,000 (65.1%), 31-60 Days: $377,500 (17.3%), 61-90 Days: $242,500 (11.1%), 90+ Days: $140,000 (6.4%).',
    keyInsights: [
      '82.4% of total AP liabilities remain within standard 60-day terms.',
      '$140,000 in 90+ days aging represents disputed freight and tooling invoices.',
      'Average Days Payable Outstanding (DPO): 42.1 Days.'
    ],
    financialMetrics: [
      { label: 'Total AP Liabilities', value: '$2,180,000', status: 'neutral' },
      { label: 'Current (1-30 Days)', value: '$1,420,000 (65.1%)', status: 'positive' },
      { label: '31-60 Days', value: '$377,500 (17.3%)', status: 'neutral' },
      { label: '90+ Days Aging', value: '$140,000 (6.4%)', status: 'warning' }
    ],
    breakdownData: [
      { category: '1 - 30 Days (Current)', value: '$1,420,000', variance: '65.1% Total', detail: 'Standard Payment Terms' },
      { category: '31 - 60 Days', value: '$377,500', variance: '17.3% Total', detail: 'Upcoming Payment Runs' },
      { category: '61 - 90 Days', value: '$242,500', variance: '11.1% Total', detail: 'Blocked / Pending Release' },
      { category: '90+ Days Overdue', value: '$140,000', variance: '6.4% Total', detail: 'Disputed Invoice Claims' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Vendor Aging Summary', tcode: 'S_ALR_87012085', description: 'Generate official SAP AP aging report by vendor group.' },
      { actionName: 'Inspect Open Vendor Items', tcode: 'FBL1N', description: 'Review line items in 90+ days aging bucket.' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: "Which vendors haven't been paid in the last 30 days?",
    category: 'Accounts Payable',
    sapSourceTables: ['LFA1', 'BSAK', 'BSIK'],
    summaryAnswer: 'There are 4 active primary vendors with no payment clearings recorded in the last 30 days: Silicon Foundry AG ($182k open balance), Asia Tech Supply ($112k open balance), Apex Machining ($45k open balance), and Quantum Components ($28k open balance).',
    keyInsights: [
      'Inactivity caused by active invoice blocks or pending GR receipts.',
      'No supplier credit hold risks reported.',
      'Total open liability across these 4 vendors: $367,000.'
    ],
    financialMetrics: [
      { label: 'Unpaid Vendors Count', value: '4 Vendors', status: 'warning' },
      { label: 'Combined Open Balance', value: '$367,000', status: 'warning' },
      { label: 'Longest Payment Pause', value: '45 Days', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Silicon Foundry AG (VEND-3001)', value: '$182,000', variance: '42 Days Unpaid', detail: 'Blocked Invoice Pending Resolution' },
      { category: 'Asia Tech Supply Co (VEND-3005)', value: '$112,000', variance: '38 Days Unpaid', detail: 'Price Tolerance Override Pending' },
      { category: 'Apex Machining (VEND-3018)', value: '$45,000', variance: '45 Days Unpaid', detail: 'Awaiting Milestone Acceptance' },
      { category: 'Quantum Components (VEND-3022)', value: '$28,000', variance: '32 Days Unpaid', detail: 'Pending W-9 Tax Document Update' }
    ],
    recommendedSapActions: [
      { actionName: 'Check Vendor Master Activity', tcode: 'FK03 / BP', description: 'Display vendor master records and payment history.' },
      { actionName: 'Review AP Clearing Status', tcode: 'FBL1N', description: 'Check cleared vs open vendor invoices.' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Create a payment proposal for this week.',
    category: 'Accounts Payable',
    sapSourceTables: ['REGUP', 'REGUH', 'BSIK'],
    summaryAnswer: 'Payment Proposal F110-20260320 generated for $1,245,000 across 38 vendor invoices due this week. Executing this proposal captures $21,400 in early payment discounts and settles 100% of Net 30 invoices.',
    keyInsights: [
      'Total Payment Run Volume: $1,245,000.',
      'Discount Captured: $21,400 (1.72% average yield).',
      '3 duplicate invoice candidates ($257,700) automatically excluded from proposal.',
      'Citi USD House Bank allocation verified.'
    ],
    financialMetrics: [
      { label: 'Weekly Payment Proposal', value: '$1,245,000', status: 'positive' },
      { label: 'Invoices Included', value: '38 Invoices', status: 'positive' },
      { label: 'Early Discount Capture', value: '+$21,400', status: 'positive' },
      { label: 'Excluded Duplicate Items', value: '3 Invoices ($257.7k)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Direct Material Suppliers', value: '$720,000', variance: '22 Invoices', detail: 'Captured $14,400 Cash Discount' },
      { category: 'Logistics & Transportation', value: '$280,000', variance: '10 Invoices', detail: 'Captured $4,200 Cash Discount' },
      { category: 'Operating Expenses & Services', value: '$245,000', variance: '6 Invoices', detail: 'Captured $2,800 Cash Discount' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute F110 Payment Run', tcode: 'F110', description: 'Process payment run proposal and generate bank payment file.' },
      { actionName: 'Download Payment Media File', tcode: 'FDTA', description: 'Export ACH / SEPA payment file for bank transmission.' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Show duplicate invoice candidates.',
    category: 'Accounts Payable',
    sapSourceTables: ['BSIK', 'BSAK', 'RBKP'],
    summaryAnswer: 'AI Duplicate Detection identified 3 duplicate invoice candidates totaling $257,700 in exposure: Inv #INV-9821 vs INV-9821A ($125,000), Inv #INV-4410 vs INV-4410-DUP ($82,700), and Inv #INV-3091 vs INV-3091B ($50,000).',
    keyInsights: [
      'Candidate 1: $125,000 from Global Supply Corp (Same amount, reference INV-9821 vs INV-9821A).',
      'Candidate 2: $82,700 from Apex Logistics (Same vendor, date, and amount).',
      'Candidate 3: $50,000 from TechServices Inc (Re-submitted invoice).',
      'All 3 items automatically blocked from payment in F110.'
    ],
    financialMetrics: [
      { label: 'Duplicate Exposure Risk', value: '$257,700', status: 'negative' },
      { label: 'Flagged Invoices', value: '3 Candidates', status: 'warning' },
      { label: 'Status in Payment Run', value: 'Blocked in F110', status: 'positive' },
      { label: 'Fraud Prevention Yield', value: '$257,700 Saved', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Global Supply Corp (VEND-3002)', value: '$125,000', variance: 'Exact Amount Match', detail: 'Inv #INV-9821 vs #INV-9821A' },
      { category: 'Apex Logistics (VEND-3008)', value: '$82,700', variance: 'Same Date & PO', detail: 'Inv #INV-4410 vs #INV-4410-DUP' },
      { category: 'TechServices Inc (VEND-3015)', value: '$50,000', variance: 'Re-submitted Claim', detail: 'Inv #INV-3091 vs #INV-3091B' }
    ],
    recommendedSapActions: [
      { actionName: 'Cancel Duplicate Invoices', tcode: 'MR8M / FB08', description: 'Reverse duplicate vendor invoice postings.' },
      { actionName: 'Apply Vendor Payment Block', tcode: 'FK05', description: 'Set payment block on flagged vendor invoices.' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Identify vendor payment discounts we can still capture.',
    category: 'Accounts Payable',
    sapSourceTables: ['BSIK', 'REGUP', 'LFA1'],
    summaryAnswer: 'There are currently $34,800 in early payment cash discounts available for capture if paid within the next 5 business days across $1,740,000 of open vendor invoices.',
    keyInsights: [
      'Global Logistics GmbH: $12,400 discount available if paid by Friday.',
      'Silicon Foundry AG: $14,200 discount available if invoice block is released.',
      'Microchip Components: $8,200 discount available.',
      'Net annualized return on early payment: 24.3% APY.'
    ],
    financialMetrics: [
      { label: 'Available Discounts', value: '$34,800', status: 'positive' },
      { label: 'Eligible Invoices Value', value: '$1,740,000', status: 'positive' },
      { label: 'Average Discount Rate', value: '2.0% Cash Yield', status: 'positive' },
      { label: 'Annualized APY Return', value: '24.3% APY', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Global Logistics GmbH', value: '$12,400 Discount', variance: '2.0% / Net 10', detail: '$620,000 Invoice Balance' },
      { category: 'Silicon Foundry AG', value: '$14,200 Discount', variance: '2.0% / Net 10', detail: '$710,000 Invoice Balance' },
      { category: 'Microchip Components Ltd', value: '$8,200 Discount', variance: '2.0% / Net 10', detail: '$410,000 Invoice Balance' }
    ],
    recommendedSapActions: [
      { actionName: 'Schedule Discount Payment Run', tcode: 'F110', description: 'Run payment proposal prioritized by cash discount expiration dates.' },
      { actionName: 'Review AP Cash Discount Terms', tcode: 'OBB8', description: 'Inspect SAP payment terms master configuration.' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Predict upcoming cash requirements for vendor payments.',
    category: 'Accounts Payable',
    sapSourceTables: ['BSIK', 'EKBE', 'FF7A', 'ACDOCA'],
    summaryAnswer: 'Projected AP cash outflows over the next 30 days total $3,450,000: Week 1: $1,245,000, Week 2: $850,000, Week 3: $710,000, Week 4: $645,000. All outflows are fully covered by projected $5,100,000 AR collections.',
    keyInsights: [
      'Week 1 peak outflow ($1.245M) includes monthly direct material settlements.',
      'Sufficient cash buffer maintained across all 30 days.',
      'No liquidity shortfall predicted.'
    ],
    financialMetrics: [
      { label: '30-Day AP Cash Required', value: '$3,450,000', status: 'neutral' },
      { label: 'Week 1 Cash Requirement', value: '$1,245,000', status: 'neutral' },
      { label: 'Week 2 Cash Requirement', value: '$850,000', status: 'neutral' },
      { label: 'Net Liquidity Surplus', value: '+$1,650,000', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Week 1 (Days 1 - 7)', value: '$1,245,000', variance: '36.1% Total', detail: 'Direct Material & Freight Invoices' },
      { category: 'Week 2 (Days 8 - 14)', value: '$850,000', variance: '24.6% Total', detail: 'Services & Subcontracting' },
      { category: 'Week 3 (Days 15 - 21)', value: '$710,000', variance: '20.6% Total', detail: 'Utilities & Facilities' },
      { category: 'Week 4 (Days 22 - 30)', value: '$645,000', variance: '18.7% Total', detail: 'General Supplies & IT' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Liquidity Forecast', tcode: 'FF7B / FLIQ', description: 'Generate 30/60/90-day cash outflow forecast in SAP Treasury.' },
      { actionName: 'Check Treasury Working Capital', tcode: 'S_ALR_87012284', description: 'Validate working capital requirements.' }
    ]
  },

  // ==============================================
  // GROUP 3: ACCOUNTS RECEIVABLE (AR) [Q21 - Q30]
  // ==============================================
  {
    questionId: 'Q21',
    questionText: 'Show overdue customer invoices.',
    category: 'Accounts Receivable',
    sapSourceTables: ['BSID', 'KNA1', 'BSAD', 'A_BillingDocument'],
    summaryAnswer: 'There are currently 14 overdue customer invoices totaling $1,280,000. The largest overdue customer account is Titan Energy Inc ($890,000, 58 days overdue, Dunning Level 2 active).',
    keyInsights: [
      'Titan Energy Inc ($890,000 overdue): High credit default risk, Dunning Level 3 notice recommended.',
      'Apex Industrial Corp ($240,000 overdue): 14 days overdue, customer agreed to pay by Friday.',
      '4 minor customer accounts ($150,000 total): Standard reminders sent.'
    ],
    financialMetrics: [
      { label: 'Total Overdue AR', value: '$1,280,000', status: 'negative' },
      { label: 'Overdue Invoices Count', value: '14 Invoices', status: 'warning' },
      { label: 'Top Overdue Customer', value: '$890,000 (Titan Energy)', status: 'negative' },
      { label: 'Average Days Outstanding', value: '34.5 Days', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Titan Energy Inc (CUST-1008)', value: '$890,000', variance: '58 Days Overdue', detail: 'Inv #900741 | Dunning Level 2' },
      { category: 'Apex Industrial Corp (CUST-1002)', value: '$240,000', variance: '14 Days Overdue', detail: 'Inv #900792 | Promise to Pay' },
      { category: 'Omega Tech SE (CUST-1011)', value: '$90,000', variance: '12 Days Overdue', detail: 'Inv #900801 | Payment Processing' },
      { category: '3 Other Customers', value: '$60,000', variance: '1-10 Days Overdue', detail: 'Standard Payment Cycles' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Customer Dunning Run', tcode: 'F150', description: 'Execute automated dunning run and generate dunning letters.' },
      { actionName: 'Apply VKM1 Credit Block', tcode: 'VKM1', description: 'Apply sales order credit delivery block on Titan Energy Inc.' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which customers are at risk of late payment?',
    category: 'Accounts Receivable',
    sapSourceTables: ['BSID', 'KNA1', 'UKMBP_DSP', 'A_BusinessPartner'],
    summaryAnswer: 'AI Payment Risk Prediction flagged 3 high-risk customer accounts representing $1,220,000 in open exposure: Titan Energy Inc ($890k, 92% late risk), Omega Technologies SE ($210k, 68% late risk), and Vantage Systems ($120k, 54% late risk).',
    keyInsights: [
      'Titan Energy: Payment delay predicted at +28 days past net due date.',
      'Omega Technologies: Liquidity strain reported in credit bureau feed.',
      'Vantage Systems: Dispute opened on billing invoice line item.'
    ],
    financialMetrics: [
      { label: 'High Risk AR Exposure', value: '$1,220,000', status: 'negative' },
      { label: 'Flagged Customers', value: '3 Accounts', status: 'warning' },
      { label: 'Highest Late Probability', value: '92% (Titan Energy)', status: 'negative' },
      { label: 'Predicted Cash Delay', value: '+28 Days Avg', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Titan Energy Inc (CUST-1008)', value: '$890,000', variance: '92% Late Risk', detail: 'Predicted Delay: +28 Days' },
      { category: 'Omega Tech SE (CUST-1011)', value: '$210,000', variance: '68% Late Risk', detail: 'Predicted Delay: +14 Days' },
      { category: 'Vantage Systems (CUST-1019)', value: '$120,000', variance: '54% Late Risk', detail: 'Predicted Delay: +8 Days' }
    ],
    recommendedSapActions: [
      { actionName: 'Update Credit Management Master', tcode: 'UKM_BP', description: 'Review and update SAP Credit Management credit limits and risk classes.' },
      { actionName: 'Create Collections Case', tcode: 'UDM_SPECIALIST', description: 'Assign credit specialist case in SAP Collections Management.' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Display customer aging report.',
    category: 'Accounts Receivable',
    sapSourceTables: ['BSID', 'KNA1', 'BSAD'],
    summaryAnswer: 'Total Accounts Receivable stands at $3,120,000. Aging distribution: 1-30 Days Current: $1,840,000 (59.0%), 31-60 Days: $890,000 (28.5%), 61-90 Days: $270,000 (8.7%), 90+ Days: $120,000 (3.8%).',
    keyInsights: [
      'Days Sales Outstanding (DSO): 34.5 Days (Target: <35.0 Days).',
      '87.5% of total AR balance remains within 60 days.',
      '$120,000 in 90+ days aging fully covered by bad debt allowance reserve.'
    ],
    financialMetrics: [
      { label: 'Total AR Balance', value: '$3,120,000', status: 'positive' },
      { label: 'Current (1-30 Days)', value: '$1,840,000 (59.0%)', status: 'positive' },
      { label: '31-60 Days', value: '$890,000 (28.5%)', status: 'warning' },
      { label: '90+ Days Aging', value: '$120,000 (3.8%)', status: 'neutral' }
    ],
    breakdownData: [
      { category: '1 - 30 Days (Current)', value: '$1,840,000', variance: '59.0% Total', detail: 'Within Standard Payment Terms' },
      { category: '31 - 60 Days', value: '$890,000', variance: '28.5% Total', detail: 'Titan Energy & Apex Industrial' },
      { category: '61 - 90 Days', value: '$270,000', variance: '8.7% Total', detail: 'Under Active Collection' },
      { category: '90+ Days Aging', value: '$120,000', variance: '3.8% Total', detail: 'Reserved in Bad Debt Allowance' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Official AR Aging Analysis', tcode: 'S_ALR_87012178', description: 'Generate SAP Customer Aging Report by customer account group.' },
      { actionName: 'Review DSO KPI Trend', tcode: 'FDM_COLL', description: 'Monitor Days Sales Outstanding trend in FSCM Collections.' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Which invoices are disputed?',
    category: 'Accounts Receivable',
    sapSourceTables: ['UDM_DISPUTE', 'BSID', 'A_BillingDocument'],
    summaryAnswer: 'There are currently 2 active customer invoice disputes totaling $165,000: Invoice #900741 ($120,000 from Vantage Systems, disputed delivery shortage) and Invoice #900802 ($45,000 from Horizon Tech, disputed pricing terms).',
    keyInsights: [
      'Dispute 1 ($120k): Outbound Delivery #800109 partial damage claim under investigation in SD.',
      'Dispute 2 ($45k): Contract discount rate mismatch resolved; credit memo pending approval.',
      'Total disputed AR represents 5.29% of open receivables.'
    ],
    financialMetrics: [
      { label: 'Total Disputed AR', value: '$165,000', status: 'warning' },
      { label: 'Active Dispute Cases', value: '2 Cases', status: 'warning' },
      { label: 'Dispute Share of AR', value: '5.29%', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Vantage Systems (CUST-1019)', value: '$120,000', variance: 'Case #DSP-1002', detail: 'Inv #900741 | Freight Shortage Claim' },
      { category: 'Horizon Tech (CUST-1025)', value: '$45,000', variance: 'Case #DSP-1005', detail: 'Inv #900802 | Contract Pricing Variance' }
    ],
    recommendedSapActions: [
      { actionName: 'Manage Dispute Cases', tcode: 'UDM_DISPUTE', description: 'Display and resolve customer dispute cases in SAP Dispute Management.' },
      { actionName: 'Issue Customer Credit Memo', tcode: 'FB75 / VA01', description: 'Post credit memo for valid pricing dispute resolutions.' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: "Show today's incoming customer payments.",
    category: 'Accounts Receivable',
    sapSourceTables: ['FEBKO', 'FEBEP', 'BSAD', 'ACDOCA'],
    summaryAnswer: "A total of $185,000 in incoming customer bank remittances cleared today across 6 payments: Enterprise Cloud Corp ($85,000), Global Logistics GmbH ($60,000), Apex Industrial ($25,000), and 3 minor payments ($15,000).",
    keyInsights: [
      '100% of incoming payments automatically matched and cleared against open AR line items.',
      'Zero unapplied cash sitting in bank clearing accounts.',
      'Enterprise Cloud Corp captured 1.0% early payment discount ($850).'
    ],
    financialMetrics: [
      { label: "Today's AR Cash Cleared", value: '$185,000', status: 'positive' },
      { label: 'Payments Count', value: '6 Remittances', status: 'positive' },
      { label: 'Auto-Matching Rate', value: '100% Cleared', status: 'positive' },
      { label: 'Unapplied Cash Balance', value: '$0.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Enterprise Cloud Corp (CUST-1022)', value: '$85,000', variance: 'ACH Remittance', detail: 'Cleared Invoice #900812' },
      { category: 'Global Logistics GmbH (CUST-1015)', value: '$60,000', variance: 'SEPA Direct Wire', detail: 'Cleared Invoice #900813' },
      { category: 'Apex Industrial Corp (CUST-1002)', value: '$25,000', variance: 'Check Remittance', detail: 'Cleared Invoice #900814' },
      { category: '3 Minor Customer Payments', value: '$15,000', variance: 'Electronic Clearings', detail: 'Cleared Invoices #900815-17' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Customer Clearings', tcode: 'FB50 / FB05', description: 'Review posted customer clearing documents and cash applications.' },
      { actionName: 'Process Lockbox Remittances', tcode: 'FLB2', description: 'Import electronic lockbox file feeds.' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Identify customers exceeding their credit limit.',
    category: 'Accounts Receivable',
    sapSourceTables: ['UKMBP_DSP', 'KNA1', 'BSID'],
    summaryAnswer: 'Titan Energy Inc (CUST-1008) is currently exceeding its assigned SAP Credit Limit by $140,000: Assigned Credit Limit: $750,000 | Current Total Exposure: $890,000 (118.7% credit limit utilization).',
    keyInsights: [
      'Sales Order delivery block automatically triggered in S/4HANA SD (VKM1).',
      'All other 48 active customer accounts remain below 85% credit utilization.',
      'CFO approval required to temporarily increase credit limit.'
    ],
    financialMetrics: [
      { label: 'Over-Limit Customers', value: '1 Customer', status: 'negative' },
      { label: 'Titan Energy Exposure', value: '$890,000', status: 'negative' },
      { label: 'Credit Limit Target', value: '$750,000', status: 'neutral' },
      { label: 'Credit Excess Amount', value: '+$140,000 (118.7%)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Titan Energy Inc (CUST-1008)', value: '$890,000 Exposure', variance: '118.7% Utilized', detail: 'Excess Amount: +$140,000 | VKM1 Blocked' }
    ],
    recommendedSapActions: [
      { actionName: 'Manage Credit Blocked Orders', tcode: 'VKM1 / VKM3', description: 'Review and release or hold credit-blocked sales documents.' },
      { actionName: 'Adjust Customer Credit Limit', tcode: 'UKM_BP', description: 'Update customer credit limit in SAP Credit Management.' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Predict bad debt risk by customer.',
    category: 'Accounts Receivable',
    sapSourceTables: ['BSID', 'KNA1', 'UKMBP_DSP', 'F107'],
    summaryAnswer: 'Total estimated bad debt probability exposure is $142,000 across open receivables: Titan Energy Inc ($115,000 predicted loss provision, 12.9% risk), Omega Tech ($18,000 loss provision), and Vantage Systems ($9,000 loss provision).',
    keyInsights: [
      'Existing Bad Debt Provision Reserve balance in G/L 11090000: $150,000.',
      'Current provision reserve covers 105.6% of predicted loss exposure.',
      'No additional P&L write-off required this period.'
    ],
    financialMetrics: [
      { label: 'Total Predicted Loss Risk', value: '$142,000', status: 'negative' },
      { label: 'Existing Provision Reserve', value: '$150,000', status: 'positive' },
      { label: 'Reserve Coverage Ratio', value: '105.6%', status: 'positive' },
      { label: 'Top Risk Account', value: '$115,000 (Titan Energy)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Titan Energy Inc (CUST-1008)', value: '$115,000 Provision', variance: '12.9% Loss Probability', detail: '$890,000 Open Receivables' },
      { category: 'Omega Tech SE (CUST-1011)', value: '$18,000 Provision', variance: '8.5% Loss Probability', detail: '$210,000 Open Receivables' },
      { category: 'Vantage Systems (CUST-1019)', value: '$9,000 Provision', variance: '7.5% Loss Probability', detail: '$120,000 Open Receivables' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Doubtful Accounts Valuation', tcode: 'F107', description: 'Execute SAP automated valuation run for doubtful receivables.' },
      { actionName: 'Post Bad Debt Provision', tcode: 'FB50', description: 'Adjust G/L provision for doubtful customer accounts.' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Show unapplied customer payments.',
    category: 'Accounts Receivable',
    sapSourceTables: ['FEBKO', 'FEBEP', 'BSID', 'BSAD'],
    summaryAnswer: 'There is currently $0.00 in unapplied customer payments. All incoming wire and check remittances processed during today’s clearing run were matched 100% against open customer billing documents.',
    keyInsights: [
      'Unapplied cash balance maintained at zero.',
      'Auto-matching algorithms resolved 100% of customer remittance advice text.',
      'Zero customer clearing exceptions pending manual review.'
    ],
    financialMetrics: [
      { label: 'Unapplied Customer Cash', value: '$0.00', status: 'positive' },
      { label: 'Clearing Rate', value: '100% Cleared', status: 'positive' },
      { label: 'Pending Remittances', value: '0 Items', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Unapplied Bank Clearing Account', value: '$0.00 Balance', variance: '0 Items', detail: 'House Bank CITI1 Clearing' }
    ],
    recommendedSapActions: [
      { actionName: 'Process Post-Clearings', tcode: 'FB05', description: 'Post manual customer clearings for unapplied incoming cash.' },
      { actionName: 'Review Bank Statement Feed', tcode: 'FEBAN', description: 'Display bank statement post-processing cockpit.' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Recommend collection priorities.',
    category: 'Accounts Receivable',
    sapSourceTables: ['BSID', 'KNA1', 'UDM_SPECIALIST'],
    summaryAnswer: 'AI Collections Strategy prioritizes 3 high-yield accounts to unlock $1,310,000 in immediate cash collections: Priority 1: Titan Energy ($890k overdue, Dunning L3 + VKM1 block), Priority 2: Apex Industrial ($240k, offer 1.0% early discount to collect by Friday), Priority 3: Omega Tech ($180k, phone outreach).',
    keyInsights: [
      'Priority 1 (Titan Energy): Issuing Dunning Level 3 Notice will recover $500,000 initial installment.',
      'Priority 2 (Apex Industrial): 1.0% discount offer accelerates $240,000 cash collection by 14 days.',
      'Priority 3 (Omega Tech): Resolves minor invoicing query to release $180,000 payment.'
    ],
    financialMetrics: [
      { label: 'Total Targeted Collections', value: '$1,310,000', status: 'positive' },
      { label: 'Priority 1 Cash Target', value: '$890,000 (Titan Energy)', status: 'positive' },
      { label: 'Priority 2 Cash Target', value: '$240,000 (Apex Industrial)', status: 'positive' },
      { label: 'Accelerated Cash Inflow', value: '+$1,310,000', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Priority 1: Titan Energy Inc', value: '$890,000 Target', variance: 'Dunning Level 3', detail: 'Apply VKM1 Delivery Block' },
      { category: 'Priority 2: Apex Industrial Corp', value: '$240,000 Target', variance: '1% Early Discount', detail: 'Accelerate 14-Day Collection' },
      { category: 'Priority 3: Omega Technologies SE', value: '$180,000 Target', variance: 'Phone Outreach', detail: 'Resolve Invoicing Query' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Dunning Run', tcode: 'F150', description: 'Generate and send Dunning Level 3 Notice to Titan Energy.' },
      { actionName: 'Assign Collections Worklist', tcode: 'UDM_SPECIALIST', description: 'Update FSCM Collections Management worklist items.' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: "Forecast next month's customer cash collections.",
    category: 'Accounts Receivable',
    sapSourceTables: ['BSID', 'A_SalesOrder', 'ACDOCA'],
    summaryAnswer: 'Projected customer cash inflows for April 2026 total $5,100,000: Week 1: $1,420,000, Week 2: $1,280,000, Week 3: $1,250,000, Week 4: $1,150,000. Projected cash collection efficiency rate is 98.2%.',
    keyInsights: [
      'SaaS annual contract renewals contribute $1,850,000 in recurring April cash inflows.',
      'Hardware sales orders contribute $2,850,000 in billing collections.',
      'Total forecast exceeds monthly AP cash outflows ($3.45M) by +$1,650,000.'
    ],
    financialMetrics: [
      { label: 'April Forecasted AR Inflows', value: '$5,100,000', status: 'positive' },
      { label: 'Collection Efficiency Rate', value: '98.2%', status: 'positive' },
      { label: 'Recurring SaaS Inflows', value: '$1,850,000', status: 'positive' },
      { label: 'Net Cash Inflow Buffer', value: '+$1,650,000', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Week 1 (April 1 - 7)', value: '$1,420,000', variance: '27.8% Total', detail: 'Enterprise SaaS Renewals' },
      { category: 'Week 2 (April 8 - 14)', value: '$1,280,000', variance: '25.1% Total', detail: 'Hardware Billing Collections' },
      { category: 'Week 3 (April 15 - 21)', value: '$1,250,000', variance: '24.5% Total', detail: 'Industrial Components AR' },
      { category: 'Week 4 (April 22 - 30)', value: '$1,150,000', variance: '22.6% Total', detail: 'Services & Support Billings' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Sales Cash Flow Forecast', tcode: 'FF7A', description: 'Run SAP Treasury customer cash collection forecast.' },
      { actionName: 'Verify SD Sales Order Pipeline', tcode: 'VA05', description: 'Review billing block status on upcoming sales orders.' }
    ]
  },

  // ==========================================
  // GROUP 4: GENERAL LEDGER (GL) [Q31 - Q40]
  // ==========================================
  {
    questionId: 'Q31',
    questionText: 'Show all journal entries posted today.',
    category: 'General Ledger',
    sapSourceTables: ['ACDOCA', 'BKPF', 'BSEG'],
    summaryAnswer: 'Today, 142 journal entry documents were posted in Leading Ledger 0L across Company Code 1710, generating total balanced debits and credits of $1,420,000. All documents maintained 100% zero-balance ledger integrity.',
    keyInsights: [
      '142 Documents Posted across Doc Types SA, DR, KR, AA, and ZP.',
      'Zero ledger discrepancies found between Leading Ledger 0L and Parallel Ledger 2L.',
      'Average processing latency: 12ms per posting.'
    ],
    financialMetrics: [
      { label: 'Journal Entries Today', value: '142 Documents', status: 'positive' },
      { label: 'Total Debit Volume', value: '$1,420,000', status: 'positive' },
      { label: 'Total Credit Volume', value: '$1,420,000', status: 'positive' },
      { label: 'Ledger Discrepancy', value: '$0.00', status: 'positive' }
    ],
    breakdownData: [
      { category: 'G/L General Journal (SA)', value: '82 Docs', variance: '$620,000 Volume', detail: 'G/L Accruals & Adjustments' },
      { category: 'Customer Invoices (DR)', value: '38 Docs', variance: '$480,000 Volume', detail: 'Billing Invoices' },
      { category: 'Vendor Invoices (KR)', value: '22 Docs', variance: '$320,000 Volume', detail: 'MIRO Supplier Postings' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Compact Journal', tcode: 'S_ALR_87012287', description: 'Display accounting document journal sequentially.' },
      { actionName: 'Verify ACDOCA Line Items', tcode: 'FAGLL03', description: 'Display G/L document line items in Universal Journal.' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: 'Which journal entries require approval?',
    category: 'General Ledger',
    sapSourceTables: ['BKPF', 'BSEG', 'SWWWIHEAD'],
    summaryAnswer: 'There are currently 3 parked manual journal entries awaiting CFO / Controller approval in SAP Workflows: Doc #10002029 ($185,000 off-hours adjustment), Doc #10002030 ($145,000 inventory scrap write-off), and Doc #10002031 ($82,500 GR/IR clearing write-back).',
    keyInsights: [
      'Doc #10002029 ($185,000): Off-hours posting at 02:14 AM; PDF audit voucher attached.',
      'Doc #10002030 ($145,000): Damaged semiconductor wafer write-off.',
      'Doc #10002031 ($82,500): Unbilled goods receipt clearing write-back.'
    ],
    financialMetrics: [
      { label: 'Pending Approval Entries', value: '3 Documents', status: 'warning' },
      { label: 'Total Approval Exposure', value: '$412,500', status: 'warning' },
      { label: 'Highest Value Entry', value: '$185,000 (Off-Hours)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Doc #10002029 (Off-Hours Adjustment)', value: '$185,000', variance: 'Pending CFO Approval', detail: 'Posted at 02:14 AM | GL 65000000' },
      { category: 'Doc #10002030 (Inventory Scrap Write-off)', value: '$145,000', variance: 'Pending Controller Approval', detail: 'Semiconductor Wafer Damage | GL 51000000' },
      { category: 'Doc #10002031 (GR/IR Clearing Write-back)', value: '$82,500', variance: 'Pending Manager Approval', detail: 'MR11 Unbilled GR Clearing | GL 2112000' }
    ],
    recommendedSapActions: [
      { actionName: 'Approve Parked Journal Entries', tcode: 'FBV0 / SBWP', description: 'Approve or reject parked accounting documents in SAP Business Workplace.' },
      { actionName: 'Display Parked Document', tcode: 'FBV3', description: 'Inspect line items and attachment list of parked document.' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Find manual journal postings over $100,000.',
    category: 'General Ledger',
    sapSourceTables: ['ACDOCA', 'BKPF', 'BSEG'],
    summaryAnswer: 'There are 2 manual journal postings exceeding $100,000 recorded this period: Document #10002029 ($185,000 manual G/L adjustment posted by JSMITH) and Document #10002030 ($145,000 inventory scrap write-off posted by MM_AGENT).',
    keyInsights: [
      'Doc #10002029 ($185,000): Manual G/L adjustment (GL 65000000 IT Cloud Compute).',
      'Doc #10002030 ($145,000): Material inventory scrap write-off (GL 51000000 COGS).',
      'Both entries verified for dual-control SOX compliance.'
    ],
    financialMetrics: [
      { label: 'Manual Postings >$100k', value: '2 Documents', status: 'warning' },
      { label: 'Combined Value', value: '$330,000', status: 'warning' },
      { label: 'SOX Audit Status', value: 'Dual-Control Verified', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Doc #10002029 (IT Cloud Compute Adjustment)', value: '$185,000', variance: 'User JSMITH', detail: 'G/L Debit 65000000 / Credit 21100000' },
      { category: 'Doc #10002030 (Inventory Scrap Write-off)', value: '$145,000', variance: 'User MM_AGENT', detail: 'G/L Debit 51000000 / Credit 12000000' }
    ],
    recommendedSapActions: [
      { actionName: 'Run High-Value Journal Audit', tcode: 'S_ALR_87012293', description: 'Filter manual accounting documents by threshold amount (> $100,000).' },
      { actionName: 'Verify Document Header User', tcode: 'FB03', description: 'Check posting user ID, timestamp, and authorization object.' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Show unbalanced journal entries.',
    category: 'General Ledger',
    sapSourceTables: ['ACDOCA', 'BKPF'],
    summaryAnswer: 'There are currently 0 unbalanced journal entries in SAP S/4HANA. All 142 posted documents strictly enforce the double-entry accounting rule (Debit Total = Credit Total) across all active ledgers (0L, 2L).',
    keyInsights: [
      'ACDOCA Universal Journal guarantees real-time balance at the moment of entry.',
      '0 ledger rounding discrepancies detected.',
      'System validation parameters prevent posting of unbalanced documents.'
    ],
    financialMetrics: [
      { label: 'Unbalanced Entries', value: '0 Documents', status: 'positive' },
      { label: 'Balance Discrepancy Amount', value: '$0.00', status: 'positive' },
      { label: 'Double-Entry Compliance', value: '100% Compliant', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Leading Ledger 0L Discrepancies', value: '$0.00', variance: '0 Items', detail: 'Strict Debit/Credit Equality' },
      { category: 'Parallel Ledger 2L Discrepancies', value: '$0.00', variance: '0 Items', detail: 'IFRS Valuation Balanced' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Ledger Consistency Check', tcode: 'FINS_CUST_CONS_CHK', description: 'Run SAP S/4HANA Universal Journal ledger consistency validation.' },
      { actionName: 'Display G/L Trial Balance', tcode: 'FAGLB03', description: 'Verify zero-balance sum across all active G/L accounts.' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Display all postings for GL account 400000.',
    category: 'General Ledger',
    sapSourceTables: ['ACDOCA', 'FAGLL03', 'GLT0'],
    summaryAnswer: 'G/L Account 400000 (Domestic Product Sales Revenues) recorded 38 posting documents today totaling $4,320,000 in credit revenue volume. All line items originate from Billing Documents in SD.',
    keyInsights: [
      'Total Credit Volume: $4,320,000.',
      'Zero debit reversal adjustments posted today.',
      'Line items distributed across Profit Centers PC-1000 ($2.10M) and PC-2000 ($1.85M).'
    ],
    financialMetrics: [
      { label: 'G/L Account Number', value: '400000 (Revenue)', status: 'neutral' },
      { label: 'Total Postings Count', value: '38 Documents', status: 'positive' },
      { label: 'Net Credit Volume', value: '$4,320,000', status: 'positive' },
      { label: 'Source Integration', value: '100% SD Billing', status: 'positive' }
    ],
    breakdownData: [
      { category: 'High-Tech Hardware Revenues (PC-1000)', value: '$2,100,000 Credit', variance: '18 Billing Docs', detail: 'Domestic Sales Revenue' },
      { category: 'Cloud SaaS Revenues (PC-2000)', value: '$1,850,000 Credit', variance: '14 Billing Docs', detail: 'Digital Subscription Revenues' },
      { category: 'Services & Consulting (PC-3000)', value: '$370,000 Credit', variance: '6 Billing Docs', detail: 'Professional Services' }
    ],
    recommendedSapActions: [
      { actionName: 'Display G/L Account Line Items', tcode: 'FAGLL03', description: 'Display line items for G/L account 400000 in Leading Ledger 0L.' },
      { actionName: 'Display Account Balance', tcode: 'FAGLB03', description: 'Display monthly cumulative balances for G/L account 400000.' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Compare actual vs budget for this cost center.',
    category: 'General Ledger',
    sapSourceTables: ['COSS', 'COSP', 'ACDOCA', 'S_ALR_87013611'],
    summaryAnswer: 'Cost Center CC-1002 (R&D Engineering) actual expenses reached $1,345,000 MTD against a period budget plan of $1,200,000, creating an unfavorable budget variance of +$145,000 (+12.08% over budget).',
    keyInsights: [
      'Actual Costs: $1,345,000 | Planned Budget: $1,200,000.',
      'Variance Driver: G/L 61000100 (Contracted Subcontracting) +$145,000 over budget.',
      'All other line items (Salaries, Utilities, Travel) remained within ±2% of budget.'
    ],
    financialMetrics: [
      { label: 'Cost Center ID', value: 'CC-1002 (R&D)', status: 'neutral' },
      { label: 'Actual Expenses MTD', value: '$1,345,000', status: 'warning' },
      { label: 'Planned Budget MTD', value: '$1,200,000', status: 'neutral' },
      { label: 'Unfavorable Variance', value: '+$145,000 (+12.08%)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'GL 61000100 (Engineering Subcontracting)', value: '$520,000 Actual', variance: '+$145,000 Variance', detail: 'Plan: $375,000 (+38.7%)' },
      { category: 'GL 60000000 (R&D Staff Salaries)', value: '$650,000 Actual', variance: '$0.00 Variance', detail: 'Plan: $650,000 (0.0%)' },
      { category: 'GL 63000000 (Lab Software Licenses)', value: '$175,000 Actual', variance: '$0.00 Variance', detail: 'Plan: $175,000 (0.0%)' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Cost Center Variance Report', tcode: 'S_ALR_87013611', description: 'Run SAP standard actual vs plan variance report for CC-1002.' },
      { actionName: 'Execute Budget Reallocation', tcode: 'KSU5 / KSV5', description: 'Reallocate unspent budget from CC-1001 to CC-1002 via assessment cycle.' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Identify unusual GL account movements.',
    category: 'General Ledger',
    sapSourceTables: ['ACDOCA', 'BKPF', 'BSEG'],
    summaryAnswer: 'AI Anomaly Detection flagged G/L Account 63000500 (Inbound Air Freight) due to an unexpected 36.4% cost surge (+$18,200 debit posting) without a corresponding Purchase Order line commitment.',
    keyInsights: [
      'G/L 63000500 normal daily baseline: $2,500 - $3,000.',
      'Today’s posting: $18,200 (Z-Score 3.8).',
      'Cause: Emergency air shipment surcharge for Asia semiconductor components.'
    ],
    financialMetrics: [
      { label: 'Flagged G/L Account', value: '63000500 (Air Freight)', status: 'warning' },
      { label: 'Daily Baseline Cost', value: '$2,800 Avg', status: 'neutral' },
      { label: 'Today Posting Amount', value: '$18,200', status: 'warning' },
      { label: 'Statistical Anomaly Score', value: 'Z-Score 3.8', status: 'warning' }
    ],
    breakdownData: [
      { category: 'G/L 63000500 (Inbound Freight Surcharges)', value: '$18,200 Debit', variance: '+36.4% Spike', detail: 'Doc #10002014 | Expedited Shipment' }
    ],
    recommendedSapActions: [
      { actionName: 'Inspect G/L Line Items', tcode: 'FAGLL03', description: 'Review line item details for G/L Account 63000500.' },
      { actionName: 'Audit Freight PO Clearing', tcode: 'MIRO', description: 'Verify freight vendor invoice against carrier bill of lading.' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Explain why office supply expenses increased this month.',
    category: 'General Ledger',
    sapSourceTables: ['ACDOCA', 'COSS', 'BSEG'],
    summaryAnswer: 'Office supply expenses (G/L 62000000) increased by $14,200 (+28.4% vs prior month) due to annual corporate workstation hardware refresh purchases ($9,800) and bulk printing toner supplies restocking ($4,400) for Plant 1710.',
    keyInsights: [
      'Hardware refresh ($9,800): Annual IT equipment purchases approved in PO #4500001102.',
      'Toner supplies ($4,400): Bulk discount captured (saved $880).',
      'Costs fully allocated to Cost Center CC-1001 (Corporate Admin).'
    ],
    financialMetrics: [
      { label: 'Total Supply Expenses', value: '$64,200', status: 'neutral' },
      { label: 'Prior Month Baseline', value: '$50,000', status: 'neutral' },
      { label: 'Expense Increase Delta', value: '+$14,200 (+28.4%)', status: 'warning' },
      { label: 'Budget Compliance', value: 'Within Annual Allocation', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Workstation Refresh Purchases', value: '$9,800', variance: 'PO #4500001102', detail: 'IT Equipment Replacement' },
      { category: 'Bulk Printing Supplies Restocking', value: '$4,400', variance: 'PO #4500001108', detail: 'Plant 1710 Printing Supplies' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Cost Center Line Items', tcode: 'KSB1', description: 'Display line items for Cost Center CC-1001 and G/L 62000000.' },
      { actionName: 'Display Purchase Order History', tcode: 'ME23N', description: 'Inspect purchase order history for office supply vendor.' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Show recurring journal entries due today.',
    category: 'General Ledger',
    sapSourceTables: ['FBD1', 'BKPF', 'F.14'],
    summaryAnswer: 'There are 3 recurring journal entry templates due for execution today totaling $185,000: Template #REC-001 ($110,000 monthly building lease amortization), Template #REC-002 ($45,000 software license subscription), and Template #REC-003 ($30,000 equipment insurance).',
    keyInsights: [
      '100% of recurring entry templates verified for period compliance.',
      'Execution will generate official accounting documents in Leading Ledger 0L.',
      'Zero manual posting intervention required.'
    ],
    financialMetrics: [
      { label: 'Recurring Entries Due', value: '3 Templates', status: 'positive' },
      { label: 'Total Amortization Value', value: '$185,000', status: 'positive' },
      { label: 'Automated Posting Status', value: 'Ready for F.14 Run', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Building Lease Amortization (REC-001)', value: '$110,000', variance: 'Monthly Cycle', detail: 'GL 63000000 Debit / GL 21100000 Credit' },
      { category: 'Software Subscription Amortization (REC-002)', value: '$45,000', variance: 'Monthly Cycle', detail: 'GL 65000000 Debit / GL 13000000 Credit' },
      { category: 'Equipment Insurance Amortization (REC-003)', value: '$30,000', variance: 'Monthly Cycle', detail: 'GL 64000000 Debit / GL 13000000 Credit' }
    ],
    recommendedSapActions: [
      { actionName: 'Execute Recurring Entries Run', tcode: 'F.14', description: 'Process recurring journal entry documents in batch execution.' },
      { actionName: 'Display Recurring Document', tcode: 'FBD3', description: 'Inspect recurring journal entry document template.' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Recommend correcting entries for posting errors.',
    category: 'General Ledger',
    sapSourceTables: ['ACDOCA', 'BKPF', 'FB08'],
    summaryAnswer: 'AI Accounting Diagnostic recommends 1 correcting journal posting: Document #10002014 ($18,200 air freight surcharge) was posted to G/L 63000500 without assigning Cost Center CC-1005. Recommends reclassification posting via FB50 to assign CC-1005.',
    keyInsights: [
      'Error Type: Missing Cost Center assignment in CO line item.',
      'Financial Impact: $18,200 currently sitting in unassigned CO segment.',
      'Corrective Action: Post FB50 G/L reclassification document.'
    ],
    financialMetrics: [
      { label: 'Recommended Correcting Entries', value: '1 Document', status: 'warning' },
      { label: 'Reclassification Value', value: '$18,200', status: 'neutral' },
      { label: 'Target Cost Center', value: 'CC-1005 (Logistics)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Doc #10002014 Reclassification', value: '$18,200', variance: 'Missing CO Object', detail: 'Assign Cost Center CC-1005 to GL 63000500' }
    ],
    recommendedSapActions: [
      { actionName: 'Post Correcting Journal Entry', tcode: 'FB50', description: 'Post manual G/L reclassification document in S/4HANA.' },
      { actionName: 'Reverse Incorrect Document', tcode: 'FB08', description: 'Reverse accounting document with standard reversal reason.' }
    ]
  },

  // ===============================================
  // GROUP 5: COST CONTROLLING (CO) [Q41 - Q50]
  // ===============================================
  {
    questionId: 'Q41',
    questionText: 'Show actual vs planned costs by cost center.',
    category: 'Cost Controlling',
    sapSourceTables: ['COSS', 'COSP', 'S_ALR_87013611', 'ACDOCA'],
    summaryAnswer: 'Total MTD actual operating costs across all 5 active cost centers equal $1,387,000 against a planned budget of $1,280,000 (+8.36% overall variance). Overruns were concentrated in CC-1002 R&D (+$145k) and CC-1005 Logistics (+$12k).',
    keyInsights: [
      'CC-1001 (Admin): $210k Actual vs $210k Plan (0.0% Variance).',
      'CC-1002 (R&D): $520k Actual vs $375k Plan (+$145k / +38.7% Variance).',
      'CC-1003 (Sales): $410k Actual vs $410k Plan (0.0% Variance).',
      'CC-1004 (Mfg): $122k Actual vs $185k Plan (-$63k / -34.1% Favorable).',
      'CC-1005 (Logistics): $125k Actual vs $100k Plan (+$25k / +25.0% Variance).'
    ],
    financialMetrics: [
      { label: 'Total Actual Costs MTD', value: '$1,387,000', status: 'warning' },
      { label: 'Total Planned Budget', value: '$1,280,000', status: 'neutral' },
      { label: 'Net Budget Variance', value: '+$107,000 (+8.36%)', status: 'warning' },
      { label: 'Favorable Cost Center', value: 'CC-1004 (-$63,000)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CC-1001 (Corporate Admin)', value: '$210,000 Actual', variance: '$0.00 (0.0%)', detail: 'Plan: $210,000' },
      { category: 'CC-1002 (R&D Engineering)', value: '$520,000 Actual', variance: '+$145,000 (+38.7%)', detail: 'Plan: $375,000 | Overbudget' },
      { category: 'CC-1003 (Sales & Marketing)', value: '$410,000 Actual', variance: '$0.00 (0.0%)', detail: 'Plan: $410,000' },
      { category: 'CC-1004 (Plant Operations)', value: '$122,000 Actual', variance: '-$63,000 (-34.1%)', detail: 'Plan: $185,000 | Favorable' },
      { category: 'CC-1005 (Logistics & Dist)', value: '$125,000 Actual', variance: '+$25,000 (+25.0%)', detail: 'Plan: $100,000 | Air Freight Spike' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Cost Center Group Report', tcode: 'S_ALR_87013611', description: 'Execute full SAP Controlling cost center variance report.' },
      { actionName: 'Execute Budget Assessment Cycle', tcode: 'KSU5', description: 'Reallocate favorable variance from CC-1004 to cover CC-1002 overrun.' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which cost centers exceeded their budget?',
    category: 'Cost Controlling',
    sapSourceTables: ['COSS', 'COSP', 'ACDOCA'],
    summaryAnswer: 'There are 2 cost centers currently exceeding their period budget allocation: Cost Center CC-1002 (R&D Engineering, +$145,000 / +38.7% over budget) and Cost Center CC-1005 (Logistics & Distribution, +$25,000 / +25.0% over budget).',
    keyInsights: [
      'CC-1002 overrun ($145k): Driven by external R&D subcontracted engineering fees (GL 61000100).',
      'CC-1005 overrun ($25k): Driven by expedited air freight charges and warehouse energy spikes (GL 63000500).',
      'Combined overrun across both cost centers: $170,000.'
    ],
    financialMetrics: [
      { label: 'Overbudget Cost Centers', value: '2 Cost Centers', status: 'warning' },
      { label: 'Combined Overrun Amount', value: '+$170,000', status: 'warning' },
      { label: 'Highest Overrun Cost Center', value: 'CC-1002 (+$145,000)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'CC-1002 (R&D Engineering)', value: '$520,000 Actual', variance: '+$145,000 Overbudget', detail: 'GL 61000100 Engineering Subcontracting' },
      { category: 'CC-1005 (Logistics & Distribution)', value: '$125,000 Actual', variance: '+$25,000 Overbudget', detail: 'GL 63000500 Expedited Freight Surcharges' }
    ],
    recommendedSapActions: [
      { actionName: 'Lock Cost Center Commitments', tcode: 'KS02', description: 'Set commitment lock on CC-1002 to restrict unbudgeted purchase requisitions.' },
      { actionName: 'Run Line Item Variance Analysis', tcode: 'KSB1', description: 'Review individual G/L line item postings for overbudget cost centers.' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Show internal order costs.',
    category: 'Cost Controlling',
    sapSourceTables: ['AUFK', 'COSS', 'COSP', 'KOB1'],
    summaryAnswer: 'Total costs posted to Internal Orders this period total $285,000 across 3 active internal orders: Order #ORD-800109 (NextGen Gateway R&D, $180,000), Order #ORD-800110 (Plant 1710 Automation, $75,000), and Order #ORD-800111 (Trade Show Marketing, $30,000).',
    keyInsights: [
      'Order #ORD-800109 ($180k): 80% towards project milestone completion; settlement scheduled at period-end.',
      'Order #ORD-800110 ($75k): Capitalized to Asset Under Construction (AuC) via KO88.',
      'Order #ORD-800111 ($30k): Fully settled to Cost Center CC-1003.'
    ],
    financialMetrics: [
      { label: 'Total Internal Order Costs', value: '$285,000', status: 'neutral' },
      { label: 'Active Internal Orders', value: '3 Orders', status: 'neutral' },
      { label: 'Largest Internal Order', value: '$180,000 (R&D Gateway)', status: 'neutral' },
      { label: 'Capitalized AuC Amount', value: '$75,000', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ORD-800109 (NextGen Gateway R&D)', value: '$180,000', variance: 'R&D Investment', detail: 'Settlement Rule: CC-1002 (100%)' },
      { category: 'ORD-800110 (Plant Automation CapEx)', value: '$75,000', variance: 'Capital Asset', detail: 'Settlement Rule: AuC #400102' },
      { category: 'ORD-800111 (Trade Show Marketing)', value: '$30,000', variance: 'Marketing Event', detail: 'Settlement Rule: CC-1003 (100%)' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Internal Order Settlement', tcode: 'KO88 / KO8G', description: 'Execute period-end internal order settlement rules.' },
      { actionName: 'Display Order Line Items', tcode: 'KOB1', description: 'Display line item actual costs for internal orders.' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Display profitability by product.',
    category: 'Cost Controlling',
    sapSourceTables: ['COPA', 'CE11000', 'ACDOCA'],
    summaryAnswer: 'Total gross product revenue of $4,320,000 produced $2,282,000 in gross profit (52.8% margin) across 3 product lines: Cloud SaaS Subscriptions ($1,850k rev, 64.1% margin), IoT Edge Gateways ($1,620k rev, 48.5% margin), and Enterprise Microcontrollers ($850k rev, 38.2% margin).',
    keyInsights: [
      'Cloud SaaS Subscriptions: Most profitable product line ($1,185,850 gross profit, 64.1% margin).',
      'IoT Edge Gateways: $785,700 gross profit (48.5% margin).',
      'Enterprise Microcontrollers: $324,700 gross profit (38.2% margin).'
    ],
    financialMetrics: [
      { label: 'Most Profitable Product', value: 'Cloud SaaS (64.1%)', status: 'positive' },
      { label: 'Top Revenue Product', value: 'Cloud SaaS ($1.85M)', status: 'positive' },
      { label: 'Consolidated Gross Margin', value: '52.8%', status: 'positive' },
      { label: 'Total Gross Profit', value: '$2,282,000', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Cloud SaaS Subscriptions (PROD-SaaS)', value: '$1,850,000 Rev', variance: '64.1% Margin', detail: 'Gross Profit: $1,185,850' },
      { category: 'IoT Edge Gateways (PROD-Edge)', value: '$1,620,000 Rev', variance: '48.5% Margin', detail: 'Gross Profit: $785,700' },
      { category: 'Enterprise Microcontrollers (PROD-MCU)', value: '$850,000 Rev', variance: '38.2% Margin', detail: 'Gross Profit: $324,700' }
    ],
    recommendedSapActions: [
      { actionName: 'Run CO-PA Profitability Report', tcode: 'KE30', description: 'Execute SAP Margin Analysis profitability report by product hierarchy.' },
      { actionName: 'Inspect CO-PA Line Items', tcode: 'KE24', description: 'Display line item cost and revenue details in CO-PA.' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Which products have the highest manufacturing cost?',
    category: 'Cost Controlling',
    sapSourceTables: ['CK11N', 'CK24', 'ACDOCA', 'MBEW'],
    summaryAnswer: 'Enterprise Microcontrollers (PROD-MCU) have the highest unit manufacturing cost at $142.50/unit (COGS 61.8% of revenue), followed by IoT Edge Gateways at $88.20/unit (COGS 51.5% of revenue). Cloud SaaS digital licenses have minimal unit manufacturing cost ($4.20/unit COGS).',
    keyInsights: [
      'Microcontrollers manufacturing cost driven by high raw semiconductor wafer costs ($92.00/unit).',
      'Standard Cost Estimate CK11N verified and released for Period 03 in CK24.',
      'No manufacturing cost variance discrepancies reported.'
    ],
    financialMetrics: [
      { label: 'Highest Unit Manufacturing Cost', value: '$142.50 (MCU)', status: 'warning' },
      { label: 'Raw Material Share of COGS', value: '64.5% of Cost', status: 'warning' },
      { label: 'Lowest Manufacturing Cost', value: '$4.20 (SaaS)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Enterprise Microcontrollers (PROD-MCU)', value: '$142.50 / Unit', variance: '61.8% COGS Ratio', detail: 'Material $92.00 | Labor $30.50 | Overhead $20.00' },
      { category: 'IoT Edge Gateways (PROD-Edge)', value: '$88.20 / Unit', variance: '51.5% COGS Ratio', detail: 'Material $54.00 | Labor $21.20 | Overhead $13.00' },
      { category: 'Cloud SaaS License (PROD-SaaS)', value: '$4.20 / Unit', variance: '12.0% COGS Ratio', detail: 'BTP Server Compute Cost $4.20' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Product Cost Estimate', tcode: 'CK11N / CK24', description: 'Calculate and release standard product cost estimates.' },
      { actionName: 'Analyze Material Cost Breakdown', tcode: 'CK13N', description: 'Inspect cost itemization breakdown for material components.' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Show production variance analysis.',
    category: 'Cost Controlling',
    sapSourceTables: ['KOC4', 'KKS2', 'ACDOCA'],
    summaryAnswer: 'Total manufacturing production cost variance for Plant 1710 stands at +$42,500 unfavorable (3.48% of total standard manufacturing cost): Material Price Variance: +$32,000 (unfavorable), Labor Efficiency Variance: -$8,500 (favorable), Overhead Variance: +$19,000 (unfavorable).',
    keyInsights: [
      'Material Price Variance (+$32k): Silicon wafer input price inflation.',
      'Labor Efficiency Variance (-$8.5k): Automation efficiency lowered assembly hours.',
      'Overhead Variance (+$19k): Cold storage warehouse energy rate increase.'
    ],
    financialMetrics: [
      { label: 'Net Production Variance', value: '+$42,500', status: 'warning' },
      { label: 'Material Price Variance', value: '+$32,000', status: 'warning' },
      { label: 'Labor Efficiency Variance', value: '-$8,500 (Favorable)', status: 'positive' },
      { label: 'Overhead Rate Variance', value: '+$19,000', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Input Material Price Variance', value: '+$32,000', variance: 'Unfavorable', detail: 'Silicon Wafer Input Cost Inflation' },
      { category: 'Direct Labor Efficiency Variance', value: '-$8,500', variance: 'Favorable', detail: 'Automated SMT Assembly Line Efficiency' },
      { category: 'Production Overhead Variance', value: '+$19,000', variance: 'Unfavorable', detail: 'Utility Energy Surcharge at Plant 1710' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Production Variance Calculation', tcode: 'KKS1 / KKS2', description: 'Calculate production order variances by variance category.' },
      { actionName: 'Settle Production Orders', tcode: 'CO88 / CO8A', description: 'Settle production order variances to G/L and CO-PA.' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Explain cost overruns this month.',
    category: 'Cost Controlling',
    sapSourceTables: ['ACDOCA', 'S_ALR_87013611', 'COSS'],
    summaryAnswer: 'Total MTD cost overrun across the enterprise is $170,000, driven by two primary sources: $145,000 in Cost Center CC-1002 (R&D external engineering subcontracting for NextGen Gateway project acceleration) and $25,000 in Cost Center CC-1005 (expedited air freight surcharges).',
    keyInsights: [
      'R&D Subcontracting ($145k): Approved strategic acceleration to hit Q2 product launch deadline.',
      'Air Freight ($25k): Caused by regional logistics port congestion.',
      'Favorable offsets ($63k in Plant 1710) reduced net enterprise overrun to $107,000.'
    ],
    financialMetrics: [
      { label: 'Gross Cost Overruns', value: '$170,000', status: 'warning' },
      { label: 'R&D Engineering Overrun', value: '$145,000', status: 'warning' },
      { label: 'Logistics Freight Overrun', value: '$25,000', status: 'warning' },
      { label: 'Net Enterprise Overrun', value: '+$107,000', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'CC-1002 R&D Engineering Subcontracting', value: '$145,000', variance: '+38.7% Overbudget', detail: 'GL 61000100 | NextGen Gateway Acceleration' },
      { category: 'CC-1005 Air Freight & Energy Surcharges', value: '$25,000', variance: '+25.0% Overbudget', detail: 'GL 63000500 | Expedited Logistics' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Budget Variance Diagnostic', tcode: 'S_ALR_87013611', description: 'Review detailed cost center line-item variance explanations.' },
      { actionName: 'Reallocate Budget via Assessment', tcode: 'KSU5', description: 'Transfer unspent IT budget to cover strategic R&D overrun.' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Forecast month-end costs.',
    category: 'Cost Controlling',
    sapSourceTables: ['ACDOCA', 'COSS', 'COSP'],
    summaryAnswer: 'Projected total month-end operating expenses (OPEX) for March 2026 are forecasted at $1,392,000 against a period budget plan of $1,280,000 (+8.75% projected variance). Total month-end Net Profit is forecasted at $895,000.',
    keyInsights: [
      'Projected OPEX: $1,392,000 (Actual to date: $1,387,000 + $5,000 remaining accruals).',
      'Net Profit Forecast: $895,000 (Exceeds baseline target of $870,000 by +$25,000).',
      'Gross Profit Forecast: $2,282,000 (52.8% Gross Margin).'
    ],
    financialMetrics: [
      { label: 'Forecasted Month-End OPEX', value: '$1,392,000', status: 'neutral' },
      { label: 'Planned Budget Target', value: '$1,280,000', status: 'neutral' },
      { label: 'Forecasted Net Profit', value: '$895,000', status: 'positive' },
      { label: 'Profit Target Outperformance', value: '+$25,000 (+2.87%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Actual Expenses to Date', value: '$1,387,000', variance: '99.6% of Forecast', detail: 'Recorded in ACDOCA Universal Journal' },
      { category: 'Remaining Run-Rate Accruals', value: '$5,000', variance: '0.4% of Forecast', detail: 'Month-End Utility & Facility Accruals' }
    ],
    recommendedSapActions: [
      { actionName: 'Run Month-End Cost Forecast', tcode: 'S_ALR_87013611', description: 'Generate S/4HANA Controlling month-end projected cost report.' },
      { actionName: 'Schedule Month-End Closing Cycle', tcode: 'KSU5 / KSV5', description: 'Schedule automated month-end allocation assessment job.' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: 'Recommend cost reduction opportunities.',
    category: 'Cost Controlling',
    sapSourceTables: ['ACDOCA', 'BSEG', 'COSS', 'EKKO'],
    summaryAnswer: 'AI Cost Optimization Engine identified 3 actionable cost reduction opportunities to generate $222,000 in annual recurring savings: Opportunity 1: Consolidate chemical reagent lab purchasing ($42k savings), Opportunity 2: BTP Cloud simulation auto-shutdown ($35k savings), Opportunity 3: Negotiate Net 60 supplier terms ($145k working capital release).',
    keyInsights: [
      'Opportunity 1 ($42k/yr): Consolidate Plant 1710 lab supplies under single master agreement.',
      'Opportunity 2 ($35k/yr): Auto-shutdown non-production BTP cloud compute nodes during off-peak hours.',
      'Opportunity 3 ($145k working capital): Extend supplier payment terms from Net 30 to Net 60.'
    ],
    financialMetrics: [
      { label: 'Total Identified Cost Savings', value: '$222,000 / Year', status: 'positive' },
      { label: 'Lab Purchasing Consolidation', value: '$42,000 / Year', status: 'positive' },
      { label: 'BTP Cloud Optimization', value: '$35,000 / Year', status: 'positive' },
      { label: 'Working Capital Unlocked', value: '+$145,000', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Lab Reagent Purchasing Consolidation', value: '$42,000 / Year', variance: 'ME21N Vendor Agreement', detail: 'Consolidate Vendor Contracts under Unified Master Agreement' },
      { category: '2. BTP Cloud Auto-Shutdown Policy', value: '$35,000 / Year', variance: 'BTP Cockpit Scheduling', detail: 'Shut down non-prod simulation compute pods during off-peak hours' },
      { category: '3. AP Payment Term Extension (Net 60)', value: '+$145,000 Capital', variance: 'LFA1 Master Update', detail: 'Negotiate Net 60 terms with top 5 semiconductor suppliers' }
    ],
    recommendedSapActions: [
      { actionName: 'Update Vendor Master Payment Terms', tcode: 'XK02 / BP', description: 'Update vendor payment terms to Net 60 in Business Partner master.' },
      { actionName: 'Consolidate Material Contracts', tcode: 'MEK1 / ME21N', description: 'Configure unified purchasing info records for lab supplies.' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'Show profitability by customer, product, and region.',
    category: 'Cost Controlling',
    sapSourceTables: ['COPA', 'CE11000', 'ACDOCA', 'KNA1'],
    summaryAnswer: '3D Profitability Matrix across Customer, Product, and Region demonstrates highest margins in North America Enterprise Cloud SaaS ($1,850,000 Rev, 64.1% Gross Margin, $1,185,850 profit), followed by Europe High-Tech Hardware ($1,620,000 Rev, 48.5% Gross Margin, $785,700 profit).',
    keyInsights: [
      'North America (Region NA): Total Revenue $2,530,000 | Gross Margin 59.8% ($1,512,940 profit).',
      'Europe (Region EU): Total Revenue $1,420,000 | Gross Margin 45.2% ($641,840 profit).',
      'Asia-Pacific (Region AP): Total Revenue $370,000 | Gross Margin 34.4% ($127,280 profit).',
      'Consolidated Enterprise Profitability: $4,320,000 Revenue | $2,282,000 Gross Profit (52.8% Margin).'
    ],
    financialMetrics: [
      { label: 'Most Profitable Region', value: 'North America (59.8%)', status: 'positive' },
      { label: 'Top Customer Segment', value: 'Enterprise SaaS (64.1%)', status: 'positive' },
      { label: 'Consolidated Revenue', value: '$4,320,000', status: 'positive' },
      { label: 'Consolidated Gross Profit', value: '$2,282,000 (52.8%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'North America - Cloud SaaS - Enterprise Cloud', value: '$1,850,000 Rev', variance: '64.1% Margin', detail: 'Net Profit: $1,185,850 | Top Performing' },
      { category: 'Europe - Hardware - Global Logistics GmbH', value: '$1,200,000 Rev', variance: '52.1% Margin', detail: 'Net Profit: $625,200 | Strong Margin' },
      { category: 'North America - Hardware - Apex Industrial', value: '$680,000 Rev', variance: '48.1% Margin', detail: 'Net Profit: $327,080 | Solid Contribution' },
      { category: 'Europe - Hardware - Titan Energy Inc', value: '$420,000 Rev', variance: '38.2% Margin', detail: 'Net Profit: $160,440 | Credit Risk Watch' },
      { category: 'Asia-Pacific - Services - Regional Clients', value: '$170,000 Rev', variance: '31.2% Margin', detail: 'Net Profit: $53,040 | Growth Potential' }
    ],
    recommendedSapActions: [
      { actionName: 'Run 3D CO-PA Profitability Matrix', tcode: 'KE30', description: 'Execute multi-dimensional CO-PA drilldown report across Customer, Product, and Region.' },
      { actionName: 'Export Segment Profit Analysis', tcode: 'KE24', description: 'Export segment profit contribution lines for executive board reporting.' }
    ]
  }
];
