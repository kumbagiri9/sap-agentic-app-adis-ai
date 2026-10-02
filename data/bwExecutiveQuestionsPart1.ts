import { BwExecutiveQuestionAnswer } from '../types';

export const BW_EXECUTIVE_QUESTIONS_PART1: BwExecutiveQuestionAnswer[] = [
  // =========================================================================
  // PILLAR 1: EXECUTIVE & BUSINESS ANALYTICS (Q1 - Q10) + CEO QUESTION (Q0)
  // =========================================================================
  {
    questionId: 'Q0',
    questionText: 'How is the company performing today?',
    category: 'Executive & Business Analytics',
    targetSystem: 'Multi-System Unified Engine',
    sapTechnicalTarget: 'Governed Tri-System Analytics Mesh (S/4HANA + BW/4HANA + SAP Datasphere)',
    pfcgAuthObject: 'S_RS_COMP, S_DS_SPACE, S_TABU_DIS',
    sapSourceTables: ['VBAK', 'VBAP', 'ACDOCA', 'MATDOC', 'EKKO', 'EKPO', 'AFKO', 'QALS'],
    summaryAnswer: 'Enterprise cross-pillar performance is strong: Total daily revenue stands at €142.8M (+3.3% MoM) with 28.6% gross margin. Order volume has reached 4,820 sales orders with 98.4% on-time fulfillment. Plant inventory is valuated at $32.4M with 89.4% supplier OTIF and 98.7% manufacturing quality pass rate.',
    keyInsights: [
      'Multi-model governed consolidation across 8 enterprise pillars with sub-second OLAP latency.',
      'Revenue & Margin: €142.8M net revenue with gross margin expansion (+1.2% QoQ) driven by High-Tech.',
      'Operations & Supply Chain: 4,820 orders fulfilled; Plant 1000 inventory turned at 11.4x annually.',
      'Financial Working Capital: Operating cash flow at €35.1M with DSO improved to 42.5 days.'
    ],
    analyticsMetrics: [
      { label: 'Total Revenue', value: '€142.8M', status: 'positive' },
      { label: 'Gross Margin', value: '28.6%', status: 'positive' },
      { label: 'Order Intake', value: '4,820 Orders', status: 'positive' },
      { label: 'Operating Cash', value: '€35.1M', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Revenue Pillar', value: '€142.8M (+3.3% MoM)', variance: '+€4.6M', detail: 'North America €61.2M, EMEA €53.5M, APAC €28.1M' },
      { category: 'Margin Pillar', value: '28.6% Gross Margin', variance: '+1.2%', detail: 'Direct Materials 31.2%, Industrial 27.8%, Consumer 24.5%' },
      { category: 'Orders Pillar', value: '4,820 Orders ($18.4M backlog)', variance: 'Normal', detail: 'On-time delivery index at 98.4%' },
      { category: 'Inventory Pillar', value: '$32.40M Active Valuation', variance: '-$1.2M', detail: '38,100 SKUs, Days Inventory Outstanding: 32.1d' },
      { category: 'Procurement Pillar', value: '$18.50M Open Purchase Orders', variance: 'Stable', detail: 'Supplier OTIF at 89.4% across 140 active vendors' },
      { category: 'Production Pillar', value: '92.8% Schedule Attainment', variance: '+2.1% Var', detail: 'Plant 1000: 420 orders, Plant 1010: 280 orders' },
      { category: 'Cash Pillar', value: '€35.1M Operating Cash Flow', variance: '+8.0% Plan', detail: 'DSO at 42.5 days, DPO at 56.2 days' },
      { category: 'Quality Pillar', value: '98.7% First-Pass Yield', variance: 'Optimal', detail: '0.42% overall defect rate across 28 active lots' }
    ],
    executive8PillarsSummary: {
      revenuePillar: { label: 'Revenue', value: '€142.8M', detail: '+3.3% MoM growth (€61.2M NA / €53.5M EMEA / €28.1M APAC)', trend: 'up' },
      marginPillar: { label: 'Gross Margin', value: '28.6%', detail: '+120 bps QoQ (Direct Materials 31.2%, Industrial 27.8%)', trend: 'up' },
      ordersPillar: { label: 'Orders & Backlog', value: '4,820 Orders', detail: '$18.4M open backlog with 98.4% OTIF delivery index', trend: 'up' },
      inventoryPillar: { label: 'Inventory Stock', value: '$32.40M', detail: '38,100 stock items, DIO 32.1 days, 94.2% healthy stock', trend: 'neutral' },
      procurementPillar: { label: 'Procurement', value: '$18.50M Open POs', detail: '89.4% vendor OTIF score across 140 active suppliers', trend: 'up' },
      productionPillar: { label: 'Production', value: '92.8% Attainment', detail: 'Plant 1000 variance +2.1% due to component pricing shift', trend: 'neutral' },
      cashPillar: { label: 'Cash & Liquidity', value: '€35.1M Cash Flow', detail: 'EBITDA +8.0% vs plan; DSO reduced 3.5 days to 42.5 days', trend: 'up' },
      qualityPillar: { label: 'Quality & Yield', value: '98.7% FPY', detail: '0.42% defect rate; zero critical lot holds today', trend: 'up' }
    },
    tableData: {
      headers: ['Pillar', 'Key Metric', 'Actual Value', 'Variance / Trend', 'Primary Grounding System'],
      rows: [
        ['Revenue', 'Net Sales Volume', '€142.8M', '+3.3% MoM', 'BW/4HANA CP_SALES_HIST & S/4 CDS'],
        ['Margin', 'Gross Profit Margin', '28.6%', '+1.2% QoQ', 'S/4 ACDOCA & CO-PA Profit Center'],
        ['Orders', 'Daily Sales Orders', '4,820 Orders', '+4.1% WoW', 'S/4 CDS C_SalesOrderAnalytics'],
        ['Inventory', 'Valuated Stock', '$32.40M', '-2.4% MoM', 'S/4 CDS C_MaterialStockValue'],
        ['Procurement', 'Open Purchase Orders', '$18.50M', 'Within Budget', 'S/4 CDS C_PurOrdItemAnalytics'],
        ['Production', 'Manufacturing Attainment', '92.8%', '+0.8% Target', 'S/4 Manufacturing Orders AFKO'],
        ['Cash', 'Operating Cash Flow', '€35.1M', '+8.0% vs Plan', 'Datasphere AM_ENTERPRISE_FINANCIAL'],
        ['Quality', 'First-Pass Yield (FPY)', '98.7%', '+0.3% vs Target', 'S/4 QM QALS & Usage Decisions']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics', 'I_ActualFinancialLineItem', 'C_MaterialStockValue', 'C_PurOrdItemAnalytics'],
      bwObjectsInvolved: ['CP_SALES_HIST', 'ADSO_SALES_H', 'ADSO_FIN_ACDOCA'],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE', 'SUPPLY_CHAIN_ANALYTICS', 'SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'CEO enterprise 8-pillar cross-engine consolidation.'
    },
    recommendedSapActions: [
      { actionName: 'Executive Control Tower', tcode: 'Fiori F2814', description: 'Launch SAP Fiori Executive Digital Boardroom dashboard' },
      { actionName: 'Profitability Analysis', tcode: 'KE30 / KE24', description: 'Display multi-dimensional CO-PA segment contributions' },
      { actionName: 'Universal Journal Display', tcode: 'FAGLL03H', description: 'Inspect real-time ACDOCA financial line items' }
    ]
  },
  {
    questionId: 'Q1',
    questionText: "Show today's revenue.",
    category: 'Executive & Business Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'CDS View C_SalesOrderAnalytics & VBRK Billing Documents',
    pfcgAuthObject: 'S_TABU_DIS, V_VBAK_VKO',
    sapSourceTables: ['VBRK', 'VBRP', 'VBAK', 'VBAP'],
    summaryAnswer: "Today's total invoiced net revenue across all company codes is $4.82M across 342 billed deliveries, with an additional $1.85M in open sales orders scheduled for PGI and billing before midnight.",
    keyInsights: [
      'Invoiced revenue: $4.82M aggregated in real-time from VBRK/VBRP billing documents.',
      'Top contributing Sales Org: 1710 (US Domestic) generating $2.84M (58.9% share).',
      'Average order value today is $14,093 with 0% unbilled block exception rate.',
      'Real-time CDS view execution latency: 18ms.'
    ],
    analyticsMetrics: [
      { label: "Today's Invoiced", value: '$4.82M', status: 'positive' },
      { label: 'Billed Deliveries', value: '342 Docs', status: 'positive' },
      { label: 'Pending Billing', value: '$1.85M', status: 'neutral' },
      { label: 'Average Order', value: '$14,093', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Sales Org 1710 (US Domestic)', value: '$2.84M (58.9%)', variance: '+4.2% DoD', detail: 'Direct Materials & Electronics' },
      { category: 'Sales Org 1010 (Germany Commercial)', value: '$1.42M (29.5%)', variance: '+1.8% DoD', detail: 'Machinery & Automotive Components' },
      { category: 'Sales Org 3010 (APAC Regional)', value: '$0.56M (11.6%)', variance: '+3.1% DoD', detail: 'Semi-conductor sub-assemblies' }
    ],
    tableData: {
      headers: ['Sales Org', 'Currency', 'Billed Revenue', 'Open Orders', 'Total Potential', 'Share %'],
      rows: [
        ['1710 (US Domestic)', 'USD', '$2,840,000', '$1,120,000', '$3,960,000', '58.9%'],
        ['1010 (Germany HQ)', 'EUR', '€1,310,000 ($1.42M)', '$480,000', '$1,900,000', '29.5%'],
        ['3010 (APAC Singapore)', 'SGD', 'S$760,000 ($0.56M)', '$250,000', '$810,000', '11.6%']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics', 'I_BillingDocumentItemBasic'],
      bwObjectsInvolved: ['ADSO_SALES_H'],
      datasphereSpacesInvolved: ['SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'S/4HANA live CDS aggregation grounded on real-time billing headers.'
    },
    recommendedSapActions: [
      { actionName: 'Sales Volume Analytics', tcode: 'Fiori F2270', description: 'Monitor daily real-time billing document flow and pricing conditions' },
      { actionName: 'Billing Due List', tcode: 'VF04', description: 'Process pending outbound deliveries to accelerate revenue recognition' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: "Compare this month's revenue with last month.",
    category: 'Executive & Business Analytics',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'CompositeProvider CP_SALES_HIST & BeX Query 2C_SALES_COMP',
    pfcgAuthObject: 'S_RS_COMP',
    sapSourceTables: ['ADSO_SALES_H', 'CP_SALES_HIST', 'VBRK', 'ACDOCA'],
    summaryAnswer: "This month's revenue has reached €142.8M compared to €138.2M at the same day last month, representing a +3.3% MoM growth (+€4.6M absolute increase) led by strong North American direct sales.",
    keyInsights: [
      'Month-to-Date revenue: €142.8M vs €138.2M prior month (+€4.6M, +3.3%).',
      'North America (Sales Org 1710) generated +€2.8M (+4.8% growth).',
      'Europe (Sales Org 1010) grew +€1.4M (+2.7% growth).',
      'Asia-Pacific (Sales Org 3010) added +€0.4M (+1.4% growth).'
    ],
    analyticsMetrics: [
      { label: 'Current Month MTD', value: '€142.8M', status: 'positive' },
      { label: 'Prior Month MTD', value: '€138.2M', status: 'neutral' },
      { label: 'MoM Variance', value: '+€4.6M (+3.3%)', status: 'positive' },
      { label: 'Run-rate Projection', value: '€158.4M', status: 'positive' }
    ],
    breakdownData: [
      { category: 'North America (Sales Org 1710)', value: '€61.2M vs €58.4M', variance: '+€2.8M (+4.8%)', detail: 'High Tech & Industrial segment surge' },
      { category: 'Europe (Sales Org 1010)', value: '€53.5M vs €52.1M', variance: '+€1.4M (+2.7%)', detail: 'Automotive and machinery replacements' },
      { category: 'Asia Pacific (Sales Org 3010)', value: '€28.1M vs €27.7M', variance: '+€0.4M (+1.4%)', detail: 'Semiconductor component exports' }
    ],
    tableData: {
      headers: ['Region', 'Prior Month MTD', 'Current Month MTD', 'Variance (€M)', 'Growth %'],
      rows: [
        ['North America (1710)', '€58.4M', '€61.2M', '+€2.8M', '+4.8%'],
        ['Europe (1010)', '€52.1M', '€53.5M', '+€1.4M', '+2.7%'],
        ['Asia Pacific (3010)', '€27.7M', '€28.1M', '+€0.4M', '+1.4%'],
        ['Total Enterprise', '€138.2M', '€142.8M', '+€4.6M', '+3.3%']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalyticsCube'],
      bwObjectsInvolved: ['CP_SALES_HIST', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: '2-Year comparative BeX Query executed over BW/4HANA ADSO delta partition.'
    },
    recommendedSapActions: [
      { actionName: 'BW Query Monitor', tcode: 'RSRT', description: 'Analyze BeX Query 2C_SALES_COMP execution plan and aggregation cache' },
      { actionName: 'Period Comparison Report', tcode: 'Fiori F0998', description: 'Review period-over-period sales variance and margin drivers' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Show sales by region, product, and customer.',
    category: 'Executive & Business Analytics',
    targetSystem: 'SAP Datasphere Data Mesh',
    sapTechnicalTarget: 'Analytic Model AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM',
    pfcgAuthObject: 'S_DS_SPACE, S_RS_COMP',
    sapSourceTables: ['VBAK', 'VBAP', 'MARA', 'KNA1', 'ACDOCA'],
    summaryAnswer: 'Cross-system Datasphere analysis shows North America generating $21.40M led by Trading Goods MZ-TG-Y200 for USCU_L09 Customer, Europe at $16.80M led by Finished Goods MZ-FG-M100 for USCU_L33, and APAC at $10.05M led by Raw Titanium for USCU_L14.',
    keyInsights: [
      'Top Regional Market: North America with 44.3% revenue contribution ($21.40M).',
      'Top Product Line: MZ-TG-Y200 Trading Goods generating $18.40M in sales volume.',
      'Top Customer Account: USCU_L09 Customer Corp generating $8.40M.',
      'Data grounded on Datasphere Analytic Model connecting S/4HANA + BW/4HANA.'
    ],
    analyticsMetrics: [
      { label: 'Total Analyzed Volume', value: '$48.25M', status: 'positive' },
      { label: 'Active Regions', value: '3 Regions', status: 'neutral' },
      { label: 'Product Hierarchies', value: '14 Lines', status: 'positive' },
      { label: 'Customer Accounts', value: '128 Accounts', status: 'positive' }
    ],
    breakdownData: [
      { category: 'North America', value: '$21.40M (44.3%)', variance: 'Top Region', detail: 'Customer: USCU_L09 ($8.40M), Product: MZ-TG-Y200' },
      { category: 'Europe', value: '$16.80M (34.8%)', variance: 'Second Region', detail: 'Customer: USCU_L33 ($9.80M), Product: MZ-FG-M100' },
      { category: 'Asia Pacific', value: '$10.05M (20.9%)', variance: 'Third Region', detail: 'Customer: USCU_L14 ($5.20M), Product: MZ-RM-R100' }
    ],
    tableData: {
      headers: ['Region', 'Product Line', 'Key Customer', 'Sales Volume ($M)', 'Contribution %'],
      rows: [
        ['North America', 'MZ-TG-Y200 (Trading Goods)', 'USCU_L09 Customer Corp', '$21.40M', '44.3%'],
        ['Europe', 'MZ-FG-M100 (Finished Goods)', 'USCU_L33 Electronics Inc', '$16.80M', '34.8%'],
        ['Asia Pacific', 'MZ-RM-R100 (Raw Materials)', 'USCU_L14 Automotive LLC', '$10.05M', '20.9%']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['CP_SALES_HIST'],
      datasphereSpacesInvolved: ['SALES_360_MESH', 'SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Cross-dimensional semantic view query executed via Datasphere OData v4.'
    },
    recommendedSapActions: [
      { actionName: 'Datasphere Data Builder', tcode: 'Datasphere UI', description: 'Inspect Analytic Model AM_CUSTOMER_PROFITABILITY_CROSS_SYSTEM' },
      { actionName: 'Customer 360 Overview', tcode: 'Fiori F2187', description: 'Review multi-dimensional customer sales and fulfillment performance' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'What are our top five products by revenue?',
    category: 'Executive & Business Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'CDS View C_SalesOrderAnalytics & Material Master MARA',
    pfcgAuthObject: 'S_TABU_DIS, M_MATE_STA',
    sapSourceTables: ['MARA', 'MAKT', 'VBRP', 'VBRK'],
    summaryAnswer: 'The top 5 revenue-generating materials are: (1) MZ-TG-Y200 ($18.40M, 32,400 EA), (2) MZ-FG-M100 ($14.20M, 24,100 EA), (3) MZ-RM-R100 ($8.60M, 18,500 KG), (4) MZ-TG-X100 ($4.85M, 12,000 EA), and (5) MZ-SERV-01 ($2.20M, 450 HRS).',
    keyInsights: [
      'MZ-TG-Y200 (Trading Goods) dominates with 38.1% of top-5 product volume.',
      'Finished Goods MZ-FG-M100 delivers highest unit margin at 34.2%.',
      'Raw Materials MZ-RM-R100 titanium compound demand increased 18% QoQ.',
      'Combined top 5 products represent $48.25M in realized sales.'
    ],
    analyticsMetrics: [
      { label: 'Top 5 Combined Sales', value: '$48.25M', status: 'positive' },
      { label: '#1 Product Revenue', value: '$18.40M', status: 'positive' },
      { label: 'Total Units Sold', value: '87,450 Units', status: 'positive' },
      { label: 'Avg Unit Margin', value: '31.4%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MZ-TG-Y200 (Trading Goods)', value: '$18.40M (32,400 EA)', variance: '#1 Rank', detail: 'Industrial standard assemblies' },
      { category: 'MZ-FG-M100 (Finished Goods)', value: '$14.20M (24,100 EA)', variance: '#2 Rank', detail: 'Precision motor controller unit' },
      { category: 'MZ-RM-R100 (Raw Material)', value: '$8.60M (18,500 KG)', variance: '#3 Rank', detail: 'High-grade Titanium compound' },
      { category: 'MZ-TG-X100 (Trading Goods)', value: '$4.85M (12,000 EA)', variance: '#4 Rank', detail: 'Industrial optical sensor module' },
      { category: 'MZ-SERV-01 (Consulting/Service)', value: '$2.20M (450 HRS)', variance: '#5 Rank', detail: 'System integration & calibration service' }
    ],
    tableData: {
      headers: ['Rank', 'Material ID', 'Description', 'Revenue ($M)', 'Units Sold', 'Gross Margin %'],
      rows: [
        ['1', 'MZ-TG-Y200', 'Trading Goods Standard Assembly', '$18.40M', '32,400 EA', '31.2%'],
        ['2', 'MZ-FG-M100', 'Finished Goods Precision Motor', '$14.20M', '24,100 EA', '34.2%'],
        ['3', 'MZ-RM-R100', 'Raw Titanium Compound Grade A', '$8.60M', '18,500 KG', '28.4%'],
        ['4', 'MZ-TG-X100', 'Trading Goods Optical Sensor', '$4.85M', '12,000 EA', '29.1%'],
        ['5', 'MZ-SERV-01', 'Enterprise Integration Service', '$2.20M', '450 HRS', '45.0%']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics', 'I_MaterialBasic'],
      bwObjectsInvolved: ['ADSO_SALES_H'],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Material ranking aggregation with margin calculation executed in S/4HANA.'
    },
    recommendedSapActions: [
      { actionName: 'Material Profitability', tcode: 'Fiori F2270', description: 'Analyze material gross margin, order frequency, and batch profitability' },
      { actionName: 'Display Material Master', tcode: 'MM03', description: 'Review sales organization views and pricing conditions for top materials' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which customers are declining?',
    category: 'Executive & Business Analytics',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW Predictive PAL & CompositeProvider CP_SALES_HIST',
    pfcgAuthObject: 'S_RS_COMP',
    sapSourceTables: ['KNA1', 'VBAK', 'VBAP', 'ADSO_SALES_H'],
    summaryAnswer: 'Predictive PAL analysis identifies 3 customer accounts with significant order velocity contraction (>8% MoM drop): USCU_L09 Customer Corp (-14.2% decline), USCU_L14 Automotive LLC (-11.5% decline), and USCU_L33 Electronics Inc (-9.2% decline).',
    keyInsights: [
      'USCU_L09 dropped from $8.40M to $7.20M (-14.2%) due to delayed shipping allocation at Plant 1000.',
      'USCU_L14 dropped from $5.20M to $4.60M (-11.5%) due to VF04 billing queue locking.',
      'USCU_L33 dropped from $9.80M to $8.90M (-9.2%) due to product migration transition.',
      'Overall customer retention across the remaining 125 accounts remains steady at 96.8%.'
    ],
    analyticsMetrics: [
      { label: 'Declining Accounts', value: '3 Accounts', status: 'warning' },
      { label: 'Revenue at Risk', value: '$2.70M', status: 'warning' },
      { label: 'Max Drop Rate', value: '-14.2%', status: 'negative' },
      { label: 'Retention Rate', value: '96.8%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'USCU_L09 Customer Corp', value: '$7.20M vs $8.40M', variance: '-14.2% (-$1.20M)', detail: 'Root Cause: Plant 1000 shipping backlog & slot delay' },
      { category: 'USCU_L14 Automotive LLC', value: '$4.60M vs $5.20M', variance: '-11.5% (-$0.60M)', detail: 'Root Cause: VF04 invoice generation hold on delivery batch' },
      { category: 'USCU_L33 Electronics Inc', value: '$8.90M vs $9.80M', variance: '-9.2% (-$0.90M)', detail: 'Root Cause: End-of-life component phaseout by client' }
    ],
    tableData: {
      headers: ['Customer ID', 'Customer Name', 'Prior Mo Sales', 'Current Mo Sales', 'Decline %', 'Identified Root Cause'],
      rows: [
        ['USCU_L09', 'USCU_L09 Customer Corp', '$8.40M', '$7.20M', '-14.2%', 'Shipping allocation bottleneck at Plant 1000'],
        ['USCU_L14', 'USCU_L14 Automotive LLC', '$5.20M', '$4.60M', '-11.5%', 'VF04 billing document queue lock'],
        ['USCU_L33', 'USCU_L33 Electronics Inc', '$9.80M', '$8.90M', '-9.2%', 'Customer model transition & inventory rebalancing']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['CP_SALES_HIST', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: ['SALES_360_MESH'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'HANA PAL Machine Learning time-series decay analysis over customer sales history.'
    },
    recommendedSapActions: [
      { actionName: 'Customer Churn Analysis', tcode: 'Fiori F2187', description: 'Review customer order velocity, credit limits, and outstanding quotations' },
      { actionName: 'Sales Order Expedite', tcode: 'VA02', description: 'Review priority delivery schedules for USCU_L09 to recover order cadence' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show gross margin by business unit.',
    category: 'Executive & Business Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'ACDOCA Financial Line Items & Profit Center CEPC',
    pfcgAuthObject: 'S_TABU_DIS, K_PCA',
    sapSourceTables: ['ACDOCA', 'CEPC', 'CEPCT', 'COEP'],
    summaryAnswer: 'Company-wide gross margin stands at 28.6% ($13.82M gross profit on $48.25M revenue). Direct Materials leads at 31.2% ($6.68M), followed by Industrial Machinery at 27.8% ($4.67M), and Consumer Goods at 24.5% ($2.47M).',
    keyInsights: [
      'Direct Materials Business Unit (PC-1000-DM): Highest profitability at 31.2% gross margin.',
      'Industrial Machinery (PC-1010-IM): Steady at 27.8% with $16.80M in revenue.',
      'Consumer Goods (PC-3010-CG): 24.5% margin impacted by recent logistics freight surcharges.',
      'Consolidated gross profit expanded +120 bps compared to Q2 baseline.'
    ],
    analyticsMetrics: [
      { label: 'Overall Gross Margin', value: '28.6%', status: 'positive' },
      { label: 'Total Gross Profit', value: '$13.82M', status: 'positive' },
      { label: 'Top BU Margin', value: '31.2%', status: 'positive' },
      { label: 'QoQ Expansion', value: '+1.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Direct Materials (PC-1000-DM)', value: '$6.68M Gross Profit (31.2%)', variance: '+1.8% QoQ', detail: 'Revenue: $21.40M | COGS: $14.72M' },
      { category: 'Industrial Machinery (PC-1010-IM)', value: '$4.67M Gross Profit (27.8%)', variance: '+0.9% QoQ', detail: 'Revenue: $16.80M | COGS: $12.13M' },
      { category: 'Consumer Goods (PC-3010-CG)', value: '$2.47M Gross Profit (24.5%)', variance: '-0.4% QoQ', detail: 'Revenue: $10.05M | COGS: $7.58M' }
    ],
    tableData: {
      headers: ['Business Unit', 'Profit Center', 'Revenue ($M)', 'COGS ($M)', 'Gross Profit ($M)', 'Margin %'],
      rows: [
        ['Direct Materials', 'PC-1000-DM', '$21.40M', '$14.72M', '$6.68M', '31.2%'],
        ['Industrial Machinery', 'PC-1010-IM', '$16.80M', '$12.13M', '$4.67M', '27.8%'],
        ['Consumer Goods', 'PC-3010-CG', '$10.05M', '$7.58M', '$2.47M', '24.5%'],
        ['Total Enterprise', 'Consolidated', '$48.25M', '$34.43M', '$13.82M', '28.6%']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['I_ActualFinancialLineItem', 'C_ProfitCenterAnalytics'],
      bwObjectsInvolved: ['CP_FIN_ACDOCA'],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'S/4HANA ACDOCA Universal Journal margin analysis across CEPC profit center hierarchy.'
    },
    recommendedSapActions: [
      { actionName: 'Profit Center Reporting', tcode: 'S_ALR_87013326 / KE5Z', description: 'Review line item actuals and plan comparisons by profit center' },
      { actionName: 'Financial Statement Display', tcode: 'Fiori F0708', description: 'Generate multi-dimensional P&L statement by business unit' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: 'Which plants are exceeding their operating budget?',
    category: 'Executive & Business Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'Cost Center COSP/COSS & Plant Master T001W',
    pfcgAuthObject: 'S_TABU_DIS, K_CCA',
    sapSourceTables: ['CSKS', 'COSP', 'COSS', 'T001W', 'ACDOCA'],
    summaryAnswer: 'Plant 1000 (Dallas Manufacturing) is currently exceeding its operating budget by +$420K (+3.2% overrun: $13.52M actual vs $13.10M budget) due to night-shift overtime labor and expedited freight. Plants 1010 and 1020 are operating within approved budget.',
    keyInsights: [
      'Plant 1000 (Dallas): Over budget by +$420K (+3.2%) driven by overtime labor ($280K) and expedited freight ($140K).',
      'Plant 1010 (Frankfurt): Under budget by -$150K (-1.3%) with actual spend of $11.65M vs $11.80M budget.',
      'Plant 1020 (Singapore): Favorable by -$50K (-0.6%) with actual spend of $8.35M vs $8.40M budget.',
      'Net enterprise plant variance is +$220K across $33.30M consolidated budget.'
    ],
    analyticsMetrics: [
      { label: 'Plant 1000 Variance', value: '+$420K (+3.2%)', status: 'negative' },
      { label: 'Plant 1010 Variance', value: '-$150K (-1.3%)', status: 'positive' },
      { label: 'Plant 1020 Variance', value: '-$50K (-0.6%)', status: 'positive' },
      { label: 'Net Plant Variance', value: '+$220K (+0.7%)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas Manufacturing)', value: '$13.52M actual vs $13.10M budget', variance: '+$420K (+3.2%)', detail: 'Overtime labor: +$280K, Unscheduled machine maintenance: +$140K' },
      { category: 'Plant 1010 (Frankfurt Assembly)', value: '$11.65M actual vs $11.80M budget', variance: '-$150K (-1.3%)', detail: 'Energy efficiency savings: -$110K, Consumables: -$40K' },
      { category: 'Plant 1020 (Singapore Component)', value: '$8.35M actual vs $8.40M budget', variance: '-$50K (-0.6%)', detail: 'Packaging optimizations: -$50K' }
    ],
    tableData: {
      headers: ['Plant ID', 'Plant Name', 'Budget ($M)', 'Actual Spend ($M)', 'Variance ($K)', 'Variance %', 'Status'],
      rows: [
        ['Plant 1000', 'Dallas Manufacturing', '$13.10M', '$13.52M', '+$420K', '+3.2%', 'OVER_BUDGET'],
        ['Plant 1010', 'Frankfurt Assembly', '$11.80M', '$11.65M', '-$150K', '-1.3%', 'WITHIN_BUDGET'],
        ['Plant 1020', 'Singapore Component', '$8.40M', '$8.35M', '-$50K', '-0.6%', 'WITHIN_BUDGET'],
        ['Consolidated', 'All 3 Plants', '$33.30M', '$33.52M', '+$220K', '+0.7%', 'SLIGHT_VARIANCE']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['I_ActualFinancialLineItem', 'C_CostCenterActualPlan'],
      bwObjectsInvolved: ['ADSO_COST_CENTER'],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Cost center actual vs plan variance computed from S/4 ACDOCA line items.'
    },
    recommendedSapActions: [
      { actionName: 'Cost Center Variance Report', tcode: 'KSB1 / S_ALR_87013611', description: 'Review detailed primary and secondary cost postings for Plant 1000 cost centers' },
      { actionName: 'Budget Availability Control', tcode: 'KO22 / Fiori F2218', description: 'Inspect commitment and budget tolerance key settings for Plant 1000' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Show actual versus plan for this quarter.',
    category: 'Executive & Business Analytics',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'CompositeProvider CP_SALES_HIST & Plan ADSO_PLAN',
    pfcgAuthObject: 'S_RS_COMP',
    sapSourceTables: ['ADSO_PLAN', 'ADSO_SALES_H', 'CP_SALES_HIST', 'ACDOCA'],
    summaryAnswer: 'Q3 Actual sales revenue stands at €142.8M versus €138.0M Plan (+€4.8M / +3.5% positive variance). Operating Expenses were contained at €40.2M vs €41.0M Plan (-€0.8M / -2.0% favorable), driving EBITDA to €35.1M vs €32.5M Plan (+€2.6M / +8.0% ahead of target).',
    keyInsights: [
      'Net Sales Revenue: €142.8M actual vs €138.0M plan (+€4.8M / +3.5% over performance).',
      'Operating Expenses: €40.2M actual vs €41.0M plan (-€0.8M favorable cost control).',
      'EBITDA: €35.1M actual vs €32.5M plan (+€2.6M / +8.0% ahead of plan).',
      'Data integrated from SAP Analytics Cloud planning models into BW/4HANA ADSO_PLAN.'
    ],
    analyticsMetrics: [
      { label: 'Q3 Actual Revenue', value: '€142.8M', status: 'positive' },
      { label: 'Q3 Plan Revenue', value: '€138.0M', status: 'neutral' },
      { label: 'Revenue Variance', value: '+€4.8M (+3.5%)', status: 'positive' },
      { label: 'EBITDA vs Plan', value: '+€2.6M (+8.0%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Net Sales Revenue', value: '€142.8M vs €138.0M Plan', variance: '+€4.8M (+3.5%)', detail: 'Driven by North America Trading Goods volume surge' },
      { category: 'Cost of Goods Sold (COGS)', value: '€67.5M vs €64.5M Plan', variance: '+€3.0M (+4.6%)', detail: 'Increased production volume aligned with demand' },
      { category: 'Operating Expenses (OPEX)', value: '€40.2M vs €41.0M Plan', variance: '-€0.8M (-2.0%)', detail: 'Favorable SG&A spend control in EMEA' },
      { category: 'Operating EBITDA', value: '€35.1M vs €32.5M Plan', variance: '+€2.6M (+8.0%)', detail: 'Total enterprise operational profitability' }
    ],
    tableData: {
      headers: ['Financial Metric', 'Q3 Plan (€M)', 'Q3 Actual (€M)', 'Variance (€M)', 'Variance %', 'Assessment'],
      rows: [
        ['Net Sales Revenue', '€138.0M', '€142.8M', '+€4.8M', '+3.5%', 'AHEAD_OF_PLAN'],
        ['Cost of Goods Sold', '€64.5M', '€67.5M', '+€3.0M', '+4.6%', 'IN_LINE_VOLUME'],
        ['Operating Expenses', '€41.0M', '€40.2M', '-€0.8M', '-2.0%', 'FAVORABLE_SAVINGS'],
        ['Operating EBITDA', '€32.5M', '€35.1M', '+€2.6M', '+8.0%', 'SIGNIFICANT_OUTPERFORMANCE']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['CP_SALES_HIST', 'ADSO_PLAN', '2C_FIN_PLAN_ACTUAL'],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Plan vs actual comparative BeX query executed over consolidated BW/4HANA ADSO.'
    },
    recommendedSapActions: [
      { actionName: 'Plan vs Actual Analysis', tcode: 'Fiori F0998', description: 'Review quarterly financial and operational variances in SAP Fiori' },
      { actionName: 'SAC Planning Story', tcode: 'SAC Story Link', description: 'Open SAP Analytics Cloud corporate planning and forecast revision model' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Why did revenue decrease this week?',
    category: 'Executive & Business Analytics',
    targetSystem: 'Multi-System Unified Engine',
    sapTechnicalTarget: 'Full Multi-System Revenue Variance Diagnostic Engine',
    pfcgAuthObject: 'S_RS_COMP, S_TABU_DIS',
    sapSourceTables: ['VBAK', 'VBAP', 'VBRK', 'VBRP', 'ADSO_SALES_H'],
    summaryAnswer: 'Weekly revenue decreased by -8.4% (-$440K WoW) due to 3 isolated root causes: (1) 61.2% concentrated in Sales Org 1710 Direct Materials, (2) Top 3 accounts deferred $280K in purchase releases to next week, (3) $2.1M shipped revenue locked in S/4 VF04 billing queue due to pricing condition block.',
    keyInsights: [
      'Revenue Delta: -8.4% WoW (-$440K) across week 32.',
      'Primary Segment: 61.2% of decline concentrated in NA Direct Materials (Sales Org 1710).',
      'Client Ordering Cycle: Deferred ordering by USCU_L09 and USCU_L14 accounts ($280K impact).',
      'Operational Queue: $2.1M in delivered shipments pending invoice release in VF04 queue.'
    ],
    analyticsMetrics: [
      { label: 'Weekly Revenue Delta', value: '-8.4%', status: 'negative' },
      { label: 'NA Concentration', value: '61.2%', status: 'warning' },
      { label: 'Billing Lock Queue', value: '$2.10M', status: 'negative' },
      { label: 'Order Deferrals', value: '$280K', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'VF04 Billing Lock Contention', value: '$2.10M pending invoice', variance: 'Actionable', detail: '42 outbound deliveries completed PGI but awaiting billing status release' },
      { category: 'Customer Order Deferrals', value: '$280K timing shift', variance: 'Recoverable', detail: 'USCU_L09 and USCU_L14 deferred release to align with monthly dock intake' },
      { category: 'Product Line Migration Lag', value: '$160K product shift', variance: 'Expected', detail: 'Transitioning from legacy MZ-TG-X090 to MZ-TG-X100' }
    ],
    tableData: {
      headers: ['Impact Driver', 'Financial Impact ($)', 'Root Cause Category', 'Remediation Path', 'Estimated Recovery Time'],
      rows: [
        ['VF04 Billing Queue Lock', '$2,100,000', 'Operational / S/4 Queue', 'Trigger VF04 batch billing run job', 'Immediate (< 30 mins)'],
        ['Customer Order Deferral', '$280,000', 'Demand / Client Timing', 'Orders scheduled for Monday release', '3 Days (Next Week)'],
        ['Product Phaseout Lag', '$160,000', 'Lifecycle / Master Data', 'Promote MZ-TG-X100 replacement', '1 Week']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalyticsCube', 'I_BillingDocumentItemBasic'],
      bwObjectsInvolved: ['ADSO_SALES_H', 'CP_SALES_HIST'],
      datasphereSpacesInvolved: ['SAP_FINANCE_SPACE'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Multi-system root-cause diagnostic correlating S/4 delivery logs with BW historical delta.'
    },
    recommendedSapActions: [
      { actionName: 'Process Billing Due List', tcode: 'VF04 / VF06', description: 'Execute collective billing run to release $2.1M locked revenue into ACDOCA' },
      { actionName: 'Sales Document Flow', tcode: 'VA03 / VL03N', description: 'Review status of pending deliveries for deferred customer orders' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'What business KPIs require immediate attention?',
    category: 'Executive & Business Analytics',
    targetSystem: 'S/4HANA Embedded Analytics',
    sapTechnicalTarget: 'S/4 KPI Alert Engine & VF04 / DTP Diagnostics',
    pfcgAuthObject: 'S_TABU_DIS, S_RS_DTP',
    sapSourceTables: ['VBRK', 'VBRP', 'COSP', 'RSPMREQUEST', 'BSID'],
    summaryAnswer: '2 business KPIs require immediate operational attention: (1) S/4 VF04 Billing Document Queue ($2.10M delivered goods locked awaiting invoice release), (2) Plant 1000 Manufacturing Labor Variance (+$420K / +3.2% over budget). All other corporate KPIs remain in green status.',
    keyInsights: [
      'CRITICAL: $2.10M revenue delayed in VF04 billing queue due to temporary pricing condition lock.',
      'WARNING: Plant 1000 operating budget variance +3.2% (+$420K) from night shift overtime labor.',
      'OPTIMAL: Daily revenue (€142.8M), Gross Margin (28.6%), and First-Pass Yield (98.7%) all green.',
      'BW/4HANA ADSO delta latency is within normal parameters at 12 minutes.'
    ],
    analyticsMetrics: [
      { label: 'Immediate Attention Items', value: '2 KPIs', status: 'warning' },
      { label: 'Revenue Locked in Queue', value: '$2.10M', status: 'negative' },
      { label: 'Plant 1000 Overrun', value: '+$420K', status: 'warning' },
      { label: 'Healthy KPIs', value: '6 / 8 (75%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'VF04 Billing Document Queue', value: '$2.10M locked revenue', variance: 'Action Required', detail: 'Run VF04 collective billing background job to recognize revenue' },
      { category: 'Plant 1000 Labor Spend', value: '+$420K budget variance', variance: 'Action Required', detail: 'Rebalance night shift overtime allocations with production planner' },
      { category: 'BW ADSO Delta Lag', value: '12 mins latency', variance: 'Normal (SLA < 15m)', detail: 'Delta daemon operating within standard SLA threshold' }
    ],
    tableData: {
      headers: ['KPI Name', 'Current Value', 'Threshold / SLA', 'Severity', 'Recommended Executive Action'],
      rows: [
        ['S/4 VF04 Billing Queue', '$2.10M locked', '< $500,000', 'HIGH', 'Trigger automated VF04/VF06 billing batch run'],
        ['Plant 1000 Operating Budget', '+$420K (+3.2%)', '0.0% variance', 'MEDIUM', 'Review shift scheduling and overtime authorization'],
        ['AR Overdue > 60 Days', '$2.10M (14.8%)', '< 15.0%', 'LOW', 'Dispatch automated dunning notices via F150'],
        ['BW Data Pipeline Latency', '12 mins', '< 15 mins', 'INFO', 'No action needed (within nominal bounds)']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['I_ActualFinancialLineItem', 'C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ADSO_SALES_H'],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Immediate alert scan across S/4 operational tables, CO cost centers, and BW queues.'
    },
    recommendedSapActions: [
      { actionName: 'Billing Due List Processing', tcode: 'VF04', description: 'Release $2.1M in locked billing documents to recognize revenue' },
      { actionName: 'Cost Center Labor Report', tcode: 'KSB1', description: 'Review hourly labor postings and overtime charges at Plant 1000' }
    ]
  },

  // =========================================================================
  // PILLAR 2: BW/4HANA QUESTIONS (Q11 - Q20)
  // =========================================================================
  {
    questionId: 'Q11',
    questionText: 'Show BW process chains that failed overnight.',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'Process Chain RSPCPROCESSLOG & RSPC_MONITOR',
    pfcgAuthObject: 'S_RS_PC',
    sapSourceTables: ['RSPCPROCESSLOG', 'RSPCLOGCHAIN', 'RSPCVARIANT'],
    summaryAnswer: '1 process chain failed overnight: PC_NIGHTLY_SALES_DELTA at 02:14:00 AM UTC on step DTP_ADSO_SALES_DELTA_02 due to an active table lock contention on target ADSO_SALES_H. All other 23 nightly process chains completed in GREEN status.',
    keyInsights: [
      'Failed Chain: PC_NIGHTLY_SALES_DELTA (Nightly Sales & Billing Extraction).',
      'Failed Step: DTP_ADSO_SALES_DELTA_02 (Request #REQ_20260811_0214).',
      'Failure Cause: RSBK_LOCK_001 concurrent write lock during parallel rollup.',
      'Recovery: Auto-healing retry queue initialized; zero data loss.'
    ],
    analyticsMetrics: [
      { label: 'Failed Chains', value: '1 Chain', status: 'warning' },
      { label: 'Successful Chains', value: '23 Chains', status: 'positive' },
      { label: 'Chain Success Rate', value: '95.8%', status: 'positive' },
      { label: 'Failure Time', value: '02:14:00 AM', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'PC_NIGHTLY_SALES_DELTA', value: 'Status: RED (Error)', variance: '02:14:00 UTC', detail: 'Step: DTP_ADSO_SALES_DELTA_02 (Lock Contention RSBK_LOCK_001)' },
      { category: 'PC_FIN_ACDOCA_DELTA', value: 'Status: GREEN (Success)', variance: '01:45:12 UTC', detail: 'Loaded 124,500 journal entries into ADSO_FIN_ACDOCA' },
      { category: 'PC_MAT_INVENTORY_DELTA', value: 'Status: GREEN (Success)', variance: '02:30:45 UTC', detail: 'Loaded 38,100 stock records into ADSO_MATDOC' }
    ],
    tableData: {
      headers: ['Process Chain Name', 'Description', 'Failed Step', 'Failure Time', 'Error Code', 'Resolution'],
      rows: [
        ['PC_NIGHTLY_SALES_DELTA', 'Nightly Sales Delta Load', 'DTP_ADSO_SALES_DELTA_02', '02:14:00 UTC', 'RSBK_LOCK_001', 'Restart DTP step after lock clearance'],
        ['PC_FIN_ACDOCA_DELTA', 'ACDOCA Financials Delta', 'None', '01:45:12 UTC', 'GREEN', 'Completed successfully (124.5K records)'],
        ['PC_MAT_INVENTORY_DELTA', 'Material Stock Delta', 'None', '02:30:45 UTC', 'GREEN', 'Completed successfully (38.1K records)']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSPC_MONITOR', 'PC_NIGHTLY_SALES_DELTA', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Process chain execution log inspection from RSPCPROCESSLOG.'
    },
    recommendedSapActions: [
      { actionName: 'Process Chain Maintenance', tcode: 'RSPC', description: 'Display and restart failed process chain PC_NIGHTLY_SALES_DELTA' },
      { actionName: 'Process Chain Log Monitor', tcode: 'RSPCM', description: 'Monitor daily batch execution overview across all BW chains' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which BW data loads are delayed?',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'ODP Queue Mon ODQMON & DTP Monitor',
    pfcgAuthObject: 'S_RS_DTP, S_RS_ODSO',
    sapSourceTables: ['ODQ_QUEUE', 'RSBKREQUEST', 'RSPMREQUEST'],
    summaryAnswer: '2 DTP data loads are currently delayed beyond their SLA thresholds: (1) DTP_ADSO_SALES_DELTA_02 (18 minutes delay vs 15m SLA due to process chain retry), (2) DTP_FIN_ACDOCA_DELTA (11 minutes delay vs 10m SLA due to high volume financial reconciliation).',
    keyInsights: [
      'DTP_ADSO_SALES_DELTA_02: 18 minutes delay (1,240 records pending activation).',
      'DTP_FIN_ACDOCA_DELTA: 11 minutes delay (reconciling month-end closing entries).',
      'Remaining 32 active DTPs are operating within normal green SLA boundaries.',
      'Average enterprise data load delay is under 2.4 minutes across all extractors.'
    ],
    analyticsMetrics: [
      { label: 'Delayed DTP Loads', value: '2 DTPs', status: 'warning' },
      { label: 'Max Delay', value: '18 mins', status: 'warning' },
      { label: 'On-Time Loads', value: '32 DTPs', status: 'positive' },
      { label: 'SLA Adherence', value: '94.1%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'DTP_ADSO_SALES_DELTA_02', value: '18 mins delay (SLA: 15 mins)', variance: '+3 mins Over SLA', detail: 'Source: 2LIS_11_VAHDR -> Target: ADSO_SALES_H' },
      { category: 'DTP_FIN_ACDOCA_DELTA', value: '11 mins delay (SLA: 10 mins)', variance: '+1 min Over SLA', detail: 'Source: 0FI_GL_14 -> Target: ADSO_FIN_ACDOCA' }
    ],
    tableData: {
      headers: ['DTP ID', 'Source Extractor', 'Target ADSO', 'Expected SLA', 'Actual Delay', 'Current Status'],
      rows: [
        ['DTP_ADSO_SALES_DELTA_02', '2LIS_11_VAHDR', 'ADSO_SALES_H', '15 mins', '18 mins', 'DELAYED_IN_RETRY'],
        ['DTP_FIN_ACDOCA_DELTA', '0FI_GL_14', 'ADSO_FIN_ACDOCA', '10 mins', '11 mins', 'BUFFERING_ODQ'],
        ['DTP_MATDOC_DELTA_01', '2LIS_03_BF', 'ADSO_MATDOC', '15 mins', '2 mins', 'ON_SCHEDULE_GREEN']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['ODQMON', 'DTP_ADSO_SALES_DELTA_02', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'ODQ Delta queue latency analysis correlated with DTP execution timestamps.'
    },
    recommendedSapActions: [
      { actionName: 'Operational Data Provisioning Monitor', tcode: 'ODQMON', description: 'Inspect S/4 extraction queues and delta subscription states' },
      { actionName: 'Data Transfer Process Display', tcode: 'RSBKREQUEST', description: 'Review DTP execution sub-steps and memory allocation' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Why did this DTP fail?',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'DTP Execution Log RSBKREQUEST',
    pfcgAuthObject: 'S_RS_DTP',
    sapSourceTables: ['RSBKREQUEST', 'RSBKSELECT', 'RSBKCMD'],
    summaryAnswer: 'DTP_ADSO_SALES_DELTA_02 (Request #REQ_20260811_0214) failed due to error RSBK_LOCK_001: Concurrent active table write lock on target ADSO_SALES_H during parallel activation request #20260811-0021. The conflicting process has completed, and the DTP is ready for safe re-execution.',
    keyInsights: [
      'Failed Request: REQ_20260811_0214 on target ADSO_SALES_H.',
      'Error Code: RSBK_LOCK_001 (Enqueue / Table Lock Contention).',
      'Conflict: Overlapping activation job #20260811-0021 held table lock /BIC/AADSOSALESH2.',
      'Root Cause Cleared: Conflicting lock released at 02:16:15 UTC.'
    ],
    analyticsMetrics: [
      { label: 'Failed Request', value: '#REQ_20260811_0214', status: 'negative' },
      { label: 'Error Code', value: 'RSBK_LOCK_001', status: 'negative' },
      { label: 'Lock Status', value: 'RELEASED', status: 'positive' },
      { label: 'Re-run Readiness', value: '100% Ready', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Error Classification', value: 'RSBK_LOCK_001 (Table Lock Contention)', variance: 'Transient', detail: 'Active table write lock contention on /BIC/AADSOSALESH2' },
      { category: 'Conflicting Request', value: 'Request #20260811-0021', variance: 'Resolved', detail: 'Parallel activation batch process completed and released lock' },
      { category: 'Action Recommendation', value: 'Immediate Auto-Retry', variance: 'Safe', detail: 'Re-trigger DTP execution via BW cockpit or RSPCM' }
    ],
    tableData: {
      headers: ['Log Level', 'Message Class', 'Message Number', 'Diagnostic Message Text'],
      rows: [
        ['E', 'RSBK', '001', 'Lock contention on DataStore Object ADSO_SALES_H'],
        ['E', 'RSBK', '241', 'Data package 0001 could not be inserted into active table'],
        ['I', 'RSBK', '102', 'Lock released by process PID 44102 at 02:16:15 UTC']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSBKREQUEST', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Detailed DTP error stack and enqueue log inspection.'
    },
    recommendedSapActions: [
      { actionName: 'DTP Monitor & Restart', tcode: 'RSBKREQUEST', description: 'Re-execute failed DTP request REQ_20260811_0214' },
      { actionName: 'Lock Management Monitor', tcode: 'SM12', description: 'Verify no remaining active lock entries exist on ADSO tables' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Which ADSOs have not loaded successfully?',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'ADSO Status Monitor RSOADSO',
    pfcgAuthObject: 'S_RS_ADSO',
    sapSourceTables: ['RSOADSO', 'RSPMREQUEST', 'RSPMPROCESS'],
    summaryAnswer: 'Only 1 ADSO currently has an incomplete activation request: ADSO_SALES_H (Sales Order Header DataStore, Request #REQ_20260811_0214 status RED). All other 14 enterprise ADSOs (including ADSO_FIN_ACDOCA, ADSO_MATDOC, and ADSO_PUR_EKPO) are in 100% GREEN status.',
    keyInsights: [
      'Incomplete ADSO: ADSO_SALES_H (4,820,000 active records; 4,820 records in pending delta).',
      'Green ADSOs: 14 out of 15 enterprise ADSOs (93.3% system-wide operational readiness).',
      'Financial ADSO: ADSO_FIN_ACDOCA has 12,450,000 records fully activated.',
      'Inventory ADSO: ADSO_MATDOC has 3,810,000 records fully activated.'
    ],
    analyticsMetrics: [
      { label: 'Unsuccessful ADSOs', value: '1 ADSO', status: 'warning' },
      { label: 'Healthy ADSOs', value: '14 ADSOs', status: 'positive' },
      { label: 'Total ADSO Records', value: '38.4M Records', status: 'positive' },
      { label: 'System Health', value: '93.3%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ADSO_SALES_H (Sales Order Header)', value: 'Status: RED (Pending Delta Activation)', variance: 'Action Required', detail: '4.82M active records, Request #REQ_20260811_0214 incomplete' },
      { category: 'ADSO_FIN_ACDOCA (Universal Journal)', value: 'Status: GREEN (Fully Active)', variance: 'Nominal', detail: '12.45M records, last load 5 mins ago' },
      { category: 'ADSO_MATDOC (Material Movements)', value: 'Status: GREEN (Fully Active)', variance: 'Nominal', detail: '3.81M records, last load 12 mins ago' },
      { category: 'ADSO_PUR_EKPO (Purchasing Items)', value: 'Status: GREEN (Fully Active)', variance: 'Nominal', detail: '2.14M records, last load 8 mins ago' }
    ],
    tableData: {
      headers: ['ADSO Technical Name', 'Description', 'Active Records', 'Last Request Status', 'Staleness'],
      rows: [
        ['ADSO_SALES_H', 'Sales Order Header DataStore', '4,820,000', 'RED (Pending Activation)', '12 mins ago'],
        ['ADSO_FIN_ACDOCA', 'Universal Journal ACDOCA DataStore', '12,450,000', 'GREEN', '5 mins ago'],
        ['ADSO_MATDOC', 'Material Stock Movement DataStore', '3,810,000', 'GREEN', '12 mins ago'],
        ['ADSO_PUR_EKPO', 'Purchasing Item DataStore', '2,140,000', 'GREEN', '8 mins ago']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSOADSO', 'ADSO_SALES_H', 'ADSO_FIN_ACDOCA', 'ADSO_MATDOC'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'ADSO status audit executed across all active RSPM request tables.'
    },
    recommendedSapActions: [
      { actionName: 'ADSO Manage Cockpit', tcode: 'BW Cockpit / RSOADSO', description: 'Open ADSO_SALES_H manage screen to trigger delta request activation' },
      { actionName: 'BW Request Administration', tcode: 'RSPM_ADMIN', description: 'Review process monitor logs and activate pending write requests' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Show requests with errors.',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW Request Monitor RSREQMON / RSPMREQUEST',
    pfcgAuthObject: 'S_RS_DTP',
    sapSourceTables: ['RSPMREQUEST', 'RSPMPROCESS', 'RSBKREQUEST'],
    summaryAnswer: 'Found 1 request with error status across all BW/4HANA data pipelines: Request REQ_20260811_0214 targeting ADSO_SALES_H with 4,820 records read and 0 records transferred due to temporary table write lock. Zero erroneous requests exist in Financial or Material staging.',
    keyInsights: [
      'Erroneous Request: REQ_20260811_0214.',
      'Target InfoProvider: ADSO_SALES_H.',
      'Records Affected: 4,820 records read from 2LIS_11_VAHDR extractor.',
      'Remediation: Automated restart ready to process data package.'
    ],
    analyticsMetrics: [
      { label: 'Error Requests', value: '1 Request', status: 'warning' },
      { label: 'Records in Error', value: '4,820 Records', status: 'neutral' },
      { label: 'Clean Requests', value: '142 Requests', status: 'positive' },
      { label: 'Success Ratio', value: '99.3%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'REQ_20260811_0214', value: 'Target: ADSO_SALES_H', variance: 'Status: RED_ERROR', detail: 'Extractor: 2LIS_11_VAHDR | Records: 4,820 | Action: Retry DTP' }
    ],
    tableData: {
      headers: ['Request ID', 'Target InfoProvider', 'Source Extractor', 'Records Read', 'Records Loaded', 'Status', 'Recommended Action'],
      rows: [
        ['REQ_20260811_0214', 'ADSO_SALES_H', '2LIS_11_VAHDR', '4,820', '0', 'RED_ERROR', 'Retry DTP execution in BW Cockpit']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSPMREQUEST', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'RSPMREQUEST scan filtered by status = RED.'
    },
    recommendedSapActions: [
      { actionName: 'RSPM Request Monitor', tcode: 'RSPM_MONITOR', description: 'Filter and inspect failed request logs and data packages' },
      { actionName: 'Execute DTP Directly', tcode: 'RSBKREQUEST', description: 'Re-trigger background load for REQ_20260811_0214' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Which InfoProviders have stale data?',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW InfoProvider Freshness Auditor',
    pfcgAuthObject: 'S_RS_COMP, S_RS_ADSO',
    sapSourceTables: ['RSOADSO', 'RSZCOMPDIR', 'ODQ_QUEUE'],
    summaryAnswer: 'Only 1 InfoProvider currently has slightly stale data (>10 mins behind live S/4): ADSO_SALES_H with 12 minutes delta latency awaiting Request #REQ_20260811_0214 activation. All CompositeProviders (CP_SALES_HIST, CP_FIN_ACDOCA) and remaining ADSOs are completely fresh (<2 mins latency).',
    keyInsights: [
      'Stale InfoProvider: ADSO_SALES_H (12 minutes latency vs S/4 VBAK live transactions).',
      'Fresh InfoProviders: CP_SALES_HIST (Real-time union with S/4 CDS view: 2 mins latency).',
      'Financial InfoProvider: ADSO_FIN_ACDOCA (Fresh: 5 mins latency).',
      'Average latency across all 18 enterprise InfoProviders is 3.1 minutes.'
    ],
    analyticsMetrics: [
      { label: 'Stale InfoProviders', value: '1 InfoProvider', status: 'warning' },
      { label: 'Max Latency', value: '12 mins', status: 'neutral' },
      { label: 'Real-time Providers', value: '4 Providers', status: 'positive' },
      { label: 'Fresh Providers', value: '17 / 18 (94.4%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ADSO_SALES_H (DataStore)', value: '12 mins latency', variance: 'Pending Activation', detail: '4,820 records in delta buffer awaiting final activation' },
      { category: 'CP_SALES_HIST (CompositeProvider)', value: '2 mins latency', variance: 'Real-time Union', detail: 'Direct real-time query union with live S/4 CDS C_SalesOrderAnalytics' },
      { category: 'ADSO_FIN_ACDOCA (DataStore)', value: '5 mins latency', variance: 'Fresh', detail: 'Financial postings up to date with last ODQ delta cycle' }
    ],
    tableData: {
      headers: ['InfoProvider ID', 'Type', 'Last Sync Timestamp', 'Latency vs S/4', 'Freshness Assessment'],
      rows: [
        ['ADSO_SALES_H', 'Advanced DataStore Object', '12 mins ago', '12 mins', 'SCHEDULED_DELTA_PENDING'],
        ['CP_SALES_HIST', 'CompositeProvider', '2 mins ago', '2 mins', 'REALTIME_UNION_FRESH'],
        ['ADSO_FIN_ACDOCA', 'Advanced DataStore Object', '5 mins ago', '5 mins', 'NOMINAL_FRESH'],
        ['ADSO_MATDOC', 'Advanced DataStore Object', '8 mins ago', '8 mins', 'NOMINAL_FRESH']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ADSO_SALES_H', 'CP_SALES_HIST', 'ADSO_FIN_ACDOCA'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'InfoProvider freshness evaluated against live ODQ queue delta watermark.'
    },
    recommendedSapActions: [
      { actionName: 'InfoProvider Overview', tcode: 'RSA1', description: 'Inspect Data Warehousing Workbench InfoProvider status and modeling tree' },
      { actionName: 'CompositeProvider Display', tcode: 'BW Modeling Tools (Eclipse)', description: 'Verify CompositeProvider CP_SALES_HIST real-time CDS union properties' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'When was this BW query last refreshed?',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BeX Query Cache Monitor RSRCACHE',
    pfcgAuthObject: 'S_RS_COMP',
    sapSourceTables: ['RSZCOMPDIR', 'RSZELTDIR', 'RSDDSTAT'],
    summaryAnswer: 'BeX Query 2C_SALES_PROFITABILITY_BW4 was last refreshed 2 minutes ago. The OLAP cache status is FRESH with cache mode 5 (Main Memory Cache with Local Lock). Query execution latency is 42ms.',
    keyInsights: [
      'Target Query: 2C_SALES_PROFITABILITY_BW4 (Executive Profitability & Sales Cube).',
      'Last Refresh: 2 minutes ago.',
      'Cache Mode: Mode 5 (SAP HANA In-Memory Global Cache).',
      'Cache Hit Rate: 94.2% across 1,420 daily user executions.'
    ],
    analyticsMetrics: [
      { label: 'Last Refreshed', value: '2 mins ago', status: 'positive' },
      { label: 'Cache Mode', value: 'HANA Memory (Mode 5)', status: 'positive' },
      { label: 'Execution Time', value: '42 ms', status: 'positive' },
      { label: 'Cache Hit Rate', value: '94.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Cache Validity', value: 'FRESH (Valid until next delta activation)', variance: 'Optimal', detail: 'Cache timestamp aligns with ADSO_SALES_H activation cycle' },
      { category: 'HANA In-Memory Calculation', value: '28ms execution time', variance: 'Optimal', detail: 'Pushed down entirely into HANA Database Columnar Engine' }
    ],
    tableData: {
      headers: ['Query Technical Name', 'InfoProvider', 'Last Refresh Timestamp', 'Cache Status', 'Avg Runtime'],
      rows: [
        ['2C_SALES_PROFITABILITY_BW4', 'CP_SALES_HIST', '2 mins ago', 'FRESH_CACHE_VALID', '42 ms'],
        ['2C_FIN_ACDOCA_ACTUAL', 'CP_FIN_ACDOCA', '5 mins ago', 'FRESH_CACHE_VALID', '36 ms'],
        ['2C_MAT_INVENTORY_SLOW', 'CP_MAT_STOCK', '8 mins ago', 'FRESH_CACHE_VALID', '410 ms']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['2C_SALES_PROFITABILITY_BW4', 'RSRCACHE'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'OLAP query runtime cache inspection from RSRCACHE.'
    },
    recommendedSapActions: [
      { actionName: 'Query Monitor & Cache', tcode: 'RSRT', description: 'Execute query in debug mode, clear cache, or display SQL execution plan' },
      { actionName: 'Query Cache Administration', tcode: 'RSRCACHE', description: 'Inspect memory footprint and invalidation rules for OLAP cache' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Show BW query runtime performance.',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW Query Statistics Engine RSDDSTAT',
    pfcgAuthObject: 'S_RS_COMP',
    sapSourceTables: ['RSDDSTATAGGRDEF', 'RSDDSTATINFO', 'RSDDSTATLOGTICK'],
    summaryAnswer: 'Average BW query execution time across all 48 active BeX queries is 85ms: HANA DB Engine consumes 42ms (49.4%), OLAP Processor consumes 28ms (32.9%), and Frontend Transport consumes 15ms (17.7%). Overall query performance rating is EXCELLENT.',
    keyInsights: [
      'Average Query Response: 85ms across 14,200 daily query executions.',
      'HANA DB Layer: 42ms (all joins and aggregations pushed down).',
      'OLAP Processor: 28ms (formula evaluations and currency translations).',
      '99.2% of all query executions complete in under 500ms.'
    ],
    analyticsMetrics: [
      { label: 'Avg Query Runtime', value: '85 ms', status: 'positive' },
      { label: 'HANA DB Time', value: '42 ms (49.4%)', status: 'positive' },
      { label: 'OLAP Time', value: '28 ms (32.9%)', status: 'positive' },
      { label: 'Sub-second Ratio', value: '99.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'HANA Database Engine', value: '42ms (49.4% share)', variance: 'Optimized', detail: 'Columnar parallel scan over CompositeProviders' },
      { category: 'OLAP Processor Engine', value: '28ms (32.9% share)', variance: 'Optimized', detail: 'Calculated key figures and hierarchy processing' },
      { category: 'Frontend Transport / RFC', value: '15ms (17.7% share)', variance: 'Nominal', detail: 'OData v4 / INA protocol serialization to client UI' }
    ],
    tableData: {
      headers: ['Execution Layer', 'Avg Time (ms)', 'Share %', 'Performance Rating', 'SLA Target'],
      rows: [
        ['HANA DB Engine', '42 ms', '49.4%', 'EXCELLENT', '< 200 ms'],
        ['OLAP Processor', '28 ms', '32.9%', 'EXCELLENT', '< 150 ms'],
        ['Frontend Transport', '15 ms', '17.7%', 'EXCELLENT', '< 100 ms'],
        ['Total End-to-End', '85 ms', '100.0%', 'EXCELLENT', '< 500 ms']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSDDSTAT', '2C_SALES_PROFITABILITY_BW4'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'RSDDSTAT statistics aggregation over last 24-hour query execution window.'
    },
    recommendedSapActions: [
      { actionName: 'BW Statistics Analysis', tcode: 'ST03N (BW Workload)', description: 'Analyze query runtime distribution and top slowest queries in SAP GUI' },
      { actionName: 'Query Performance Tuning', tcode: 'RSRT', description: 'Review aggregation levels and pushdown flags for complex analytical models' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Which queries are running slowly?',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'RSDDSTAT Query Performance Profiler',
    pfcgAuthObject: 'S_RS_COMP',
    sapSourceTables: ['RSDDSTATINFO', 'RSZCOMPDIR', 'RSZELTXREF'],
    summaryAnswer: 'Zero queries exceed the 3.0s SLA warning threshold. The slowest executing query in the landscape is 2C_MAT_INVENTORY_SLOW at 410ms (due to multi-level material BOM hierarchy expansion), followed by 2C_PUR_VENDOR_SPEND at 285ms. Both operate safely within green bounds.',
    keyInsights: [
      '0 slow queries exceeding standard 3.0-second warning SLA.',
      'Slowest Query: 2C_MAT_INVENTORY_SLOW at 410ms (Material BOM rollup).',
      'Second Slowest: 2C_PUR_VENDOR_SPEND at 285ms (Multi-currency conversion).',
      'All other 46 BeX queries execute in under 120ms.'
    ],
    analyticsMetrics: [
      { label: 'Slow Queries (>3s)', value: '0 Queries', status: 'positive' },
      { label: 'Max Query Runtime', value: '410 ms', status: 'positive' },
      { label: 'Query SLA Rate', value: '100% Compliant', status: 'positive' },
      { label: 'Avg Landscape Time', value: '85 ms', status: 'positive' }
    ],
    breakdownData: [
      { category: '2C_MAT_INVENTORY_SLOW', value: '410ms runtime', variance: 'Within SLA (<3.0s)', detail: 'BOM explosion with 8-level recursive hierarchy calculation' },
      { category: '2C_PUR_VENDOR_SPEND', value: '285ms runtime', variance: 'Within SLA (<3.0s)', detail: 'Cross-company code purchasing spend with dynamic currency translation' },
      { category: '2C_SALES_PROFITABILITY_BW4', value: '42ms runtime', variance: 'Fast', detail: 'HANA in-memory pushdown active' }
    ],
    tableData: {
      headers: ['Query Technical Name', 'Description', 'Runtime (ms)', 'SLA Threshold', 'Root Cause for Latency'],
      rows: [
        ['2C_MAT_INVENTORY_SLOW', 'Material Inventory Multi-Level BOM', '410 ms', '3,000 ms', 'Multi-level BOM hierarchy recursion'],
        ['2C_PUR_VENDOR_SPEND', 'Purchasing Vendor Spend Analytics', '285 ms', '3,000 ms', 'Dynamic cross-currency rate calculations'],
        ['2C_SALES_PROFITABILITY_BW4', 'Executive Sales & Margin Matrix', '42 ms', '3,000 ms', 'Fully optimized in-memory pushdown']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['RSDDSTAT', '2C_MAT_INVENTORY_SLOW'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Query runtime profiler scan sorted descending by execution duration.'
    },
    recommendedSapActions: [
      { actionName: 'Query Performance Profiler', tcode: 'RSRT', description: 'Analyze 2C_MAT_INVENTORY_SLOW runtime profile and memory footprint' },
      { actionName: 'Hierarchy Cache Optimization', tcode: 'RSH1', description: 'Review buffer settings for Material BOM hierarchy tables' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Which BW objects depend on this ADSO?',
    category: 'BW/4HANA Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'BW Where-Used List RS_NAV_WHERE_USED',
    pfcgAuthObject: 'S_RS_ADSO, S_RS_COMP',
    sapSourceTables: ['RSOADSO', 'RSZCOMPDIR', 'RSTRAN', 'RSDHCPR'],
    summaryAnswer: '5 downstream BW and analytics objects depend on ADSO_SALES_H: (1) CompositeProvider CP_SALES_HIST, (2) Transformation TR_ADSO_CP, (3) BeX Query 2C_SALES_PROFITABILITY_BW4, (4) Datasphere Analytic Model AM_GLOBAL_SUPPLY_CHAIN, and (5) SAP Analytics Cloud Story Sales 360.',
    keyInsights: [
      'Direct CompositeProvider: CP_SALES_HIST (unions ADSO_SALES_H with live CDS).',
      'Downstream BeX Queries: 2C_SALES_PROFITABILITY_BW4 and 2C_SALES_COMP.',
      'Cloud Analytics Integration: SAP Datasphere Space SUPPLY_CHAIN_ANALYTICS.',
      'Executive Consumer: SAC Story "Executive Sales 360 & Revenue Dashboard".'
    ],
    analyticsMetrics: [
      { label: 'Dependent Objects', value: '5 Objects', status: 'positive' },
      { label: 'CompositeProviders', value: '1 Provider', status: 'positive' },
      { label: 'Analytical Queries', value: '2 Queries', status: 'positive' },
      { label: 'Cloud Data Models', value: '1 Datasphere Model', status: 'positive' }
    ],
    breakdownData: [
      { category: 'CompositeProvider CP_SALES_HIST', value: 'Direct Downstream Union', variance: 'Core Model', detail: 'Combines historical sales with real-time S/4 CDS views' },
      { category: 'Transformation TR_ADSO_CP', value: 'Rule Transformation', variance: 'Active', detail: 'Maps currency, quantity units, and customer hierarchy' },
      { category: 'BeX Query 2C_SALES_PROFITABILITY_BW4', value: 'Reporting Query', variance: 'Exposed', detail: 'Used by executive management and finance teams' },
      { category: 'Datasphere Model AM_GLOBAL_SUPPLY_CHAIN', value: 'Data Mesh Model', variance: 'Federated', detail: 'Remote table replication flow in SUPPLY_CHAIN_ANALYTICS space' }
    ],
    tableData: {
      headers: ['Object Type', 'Technical Name', 'Description', 'Impact of Schema Change'],
      rows: [
        ['CompositeProvider', 'CP_SALES_HIST', 'Historical Sales Union', 'Requires mapping regeneration'],
        ['Transformation', 'TR_ADSO_CP', 'ADSO to CP Mapping Rule', 'Requires syntax re-compilation'],
        ['BeX Query', '2C_SALES_PROFITABILITY_BW4', 'Sales & Margin BeX Query', 'Field availability impacted'],
        ['Datasphere Model', 'AM_GLOBAL_SUPPLY_CHAIN', 'Supply Chain Analytic Model', 'Remote table structure refresh required'],
        ['SAC Story', 'Story_Sales_360', 'Executive Visual Story', 'Widget binding check required']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['ADSO_SALES_H', 'CP_SALES_HIST', '2C_SALES_PROFITABILITY_BW4'],
      datasphereSpacesInvolved: ['SUPPLY_CHAIN_ANALYTICS'],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Where-used dependency analysis executed across BW repository tables.'
    },
    recommendedSapActions: [
      { actionName: 'BW Data Flow Display', tcode: 'BW Modeling Tools (Eclipse)', description: 'Inspect graphical data flow diagram for ADSO_SALES_H' },
      { actionName: 'Where-Used List', tcode: 'RSA1 / RS_NAV_WHERE_USED', description: 'Run complete where-used analysis before initiating model maintenance' }
    ]
  },

  // =========================================================================
  // PILLAR 3: BW DATA LOAD & ETL QUESTIONS (Q21 - Q25)
  // =========================================================================
  {
    questionId: 'Q21',
    questionText: "Show today's source-system loads.",
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'ODP Source System Monitor ODQMON',
    pfcgAuthObject: 'S_RS_ODSO, S_RS_DTP',
    sapSourceTables: ['ODQ_QUEUE', 'ODQ_DATA', 'RSPMREQUEST'],
    summaryAnswer: "3 source systems extracted and loaded data into BW/4HANA today totaling 62,850 records: (1) S/4HANA Client 100 (49,200 records via ODP_CDS 2LIS_11_VAHDR), (2) Salesforce Cloud (12,400 records via REST API Delta), and (3) Flat File Bank Recon (1,250 records). All loads verified.",
    keyInsights: [
      'Total Daily Extracted Records: 62,850 records across 3 heterogeneous source systems.',
      'S/4HANA Client 100: 49,200 sales and billing records (78.3% of total volume).',
      'Salesforce Sales Cloud: 12,400 opportunity and pipeline records.',
      'Bank Flat File: 1,250 cash and reconciliation transactions.'
    ],
    analyticsMetrics: [
      { label: 'Total Records Loaded', value: '62,850 Records', status: 'positive' },
      { label: 'Source Systems', value: '3 Systems', status: 'positive' },
      { label: 'S/4 Volume', value: '49,200 (78.3%)', status: 'positive' },
      { label: 'Extraction Status', value: '100% SUCCESS', status: 'positive' }
    ],
    breakdownData: [
      { category: 'S/4HANA Client 100', value: '49,200 records loaded', variance: 'Status: SUCCESS', detail: 'Extractor: 2LIS_11_VAHDR (ODP Delta) -> ADSO_SALES_H' },
      { category: 'Salesforce Sales Cloud', value: '12,400 records loaded', variance: 'Status: SUCCESS', detail: 'REST API Delta Extractor -> ADSO_SFDC_OPP' },
      { category: 'Bank Flat File Interface', value: '1,250 records loaded', variance: 'Status: SUCCESS', detail: 'CSV Bank Statement Upload -> ADSO_BANK_RECON' }
    ],
    tableData: {
      headers: ['Source System', 'Extraction Technology', 'Extractor Name', 'Records Extracted', 'Status', 'Latency'],
      rows: [
        ['S/4HANA Client 100', 'ODP_CDS Delta Queue', '2LIS_11_VAHDR', '49,200', 'SUCCESS', '12 mins'],
        ['Salesforce Cloud', 'REST API Delta Webhook', 'SFDC_OPPORTUNITY_EXT', '12,400', 'SUCCESS', '15 mins'],
        ['Flat File / Bank', 'Direct CSV Upload', 'FF_BANK_RECON_2026', '1,250', 'SUCCESS', '1 hour ago']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ODQMON', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Source system extraction audit from ODQMON delta queues.'
    },
    recommendedSapActions: [
      { actionName: 'ODQ Source System Monitor', tcode: 'ODQMON', description: 'Inspect delta queue subscriptions and data compression rates' },
      { actionName: 'Source System Administration', tcode: 'RSA1', description: 'Review connection status for S/4HANA and external REST connectors' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Which extractors failed?',
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'S/4 Extractor Log ROOSOURCE / ODQMON',
    pfcgAuthObject: 'S_RS_ODSO',
    sapSourceTables: ['ROOSOURCE', 'ODQ_QUEUE', 'RSDSEXTRACT'],
    summaryAnswer: 'Zero extractors failed today. All 18 S/4HANA ODP extractors (including 2LIS_11_VAHDR, 0FI_GL_14, 2LIS_03_BF, and 2LIS_02_ITM) are in 100% GREEN status with zero rejected records in the extraction queue.',
    keyInsights: [
      '0 failed extractors across all connected S/4HANA and cloud sources.',
      'Active Extractors: 18 extractors running in real-time or scheduled delta mode.',
      'Sales Extractor: 2LIS_11_VAHDR extracted 49,200 records without error.',
      'Financial Extractor: 0FI_GL_14 extracted 124,500 records with 100% integrity.'
    ],
    analyticsMetrics: [
      { label: 'Failed Extractors', value: '0 Extractors', status: 'positive' },
      { label: 'Active Extractors', value: '18 Extractors', status: 'positive' },
      { label: 'Extraction Health', value: '100% GREEN', status: 'positive' },
      { label: 'Queue Error Rate', value: '0.00%', status: 'positive' }
    ],
    breakdownData: [
      { category: '2LIS_11_VAHDR (Sales Order Header)', value: 'Status: GREEN', variance: 'Nominal', detail: '49,200 records extracted without error' },
      { category: '0FI_GL_14 (General Ledger ACDOCA)', value: 'Status: GREEN', variance: 'Nominal', detail: '124,500 records extracted without error' },
      { category: '2LIS_03_BF (Material Movements)', value: 'Status: GREEN', variance: 'Nominal', detail: '38,100 records extracted without error' }
    ],
    tableData: {
      headers: ['Extractor Technical Name', 'Application Component', 'Status', 'Extracted Records', 'Error Count'],
      rows: [
        ['2LIS_11_VAHDR', 'Sales and Distribution (SD)', 'GREEN', '49,200', '0'],
        ['0FI_GL_14', 'Financial Accounting (FI-GL)', 'GREEN', '124,500', '0'],
        ['2LIS_03_BF', 'Materials Management (MM-IM)', 'GREEN', '38,100', '0'],
        ['2LIS_02_ITM', 'Purchasing (MM-PUR)', 'GREEN', '21,400', '0']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['ODQMON', 'ROOSOURCE'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Extractor health check across ROOSOURCE and ODQ queue logs.'
    },
    recommendedSapActions: [
      { actionName: 'Extractor Overview', tcode: 'RSA5 / RSA6', description: 'Review active extractor hierarchy and data source definitions' },
      { actionName: 'Delta Queue Monitor', tcode: 'ODQMON', description: 'Inspect delta subscription units and data confirmation timestamps' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: "What data is missing from today's load?",
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'Source vs Target Reconciliation Engine',
    pfcgAuthObject: 'S_RS_COMP, S_TABU_DIS',
    sapSourceTables: ['VBAK', 'ADSO_SALES_H', 'ACDOCA', 'ADSO_FIN_ACDOCA'],
    summaryAnswer: "No data is missing from today's load. Automated reconciliation confirms that source S/4HANA transaction counts (49,200 sales orders, 124,500 journal entries) match target BW/4HANA ADSO record counts with 0.00% variance.",
    keyInsights: [
      'Zero missing records identified across SD, FI, and MM data streams.',
      'Sales Orders: 49,200 source records in VBAK = 49,200 records in ADSO_SALES_H.',
      'Financials: 124,500 source lines in ACDOCA = 124,500 records in ADSO_FIN_ACDOCA.',
      'Material Movements: 38,100 source lines in MATDOC = 38,100 records in ADSO_MATDOC.'
    ],
    analyticsMetrics: [
      { label: 'Missing Records', value: '0 Records', status: 'positive' },
      { label: 'Reconciliation Match', value: '100.00%', status: 'positive' },
      { label: 'Reconciled Tables', value: '4 Modules', status: 'positive' },
      { label: 'Data Integrity', value: 'OPTIMAL', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Sales Orders (VBAK -> ADSO_SALES_H)', value: '49,200 vs 49,200 (100% Match)', variance: '0 Variance', detail: 'Zero missing sales order documents' },
      { category: 'Journal Entries (ACDOCA -> ADSO_FIN_ACDOCA)', value: '124,500 vs 124,500 (100% Match)', variance: '0 Variance', detail: 'Zero missing financial line items' },
      { category: 'Material Movements (MATDOC -> ADSO_MATDOC)', value: '38,100 vs 38,100 (100% Match)', variance: '0 Variance', detail: 'Zero missing inventory movement lines' }
    ],
    tableData: {
      headers: ['Business Stream', 'Source S/4 Table', 'Target BW ADSO', 'Source Records', 'Target Records', 'Missing Count'],
      rows: [
        ['Sales Orders (SD)', 'VBAK / VBAP', 'ADSO_SALES_H', '49,200', '49,200', '0'],
        ['Universal Journal (FI)', 'ACDOCA', 'ADSO_FIN_ACDOCA', '124,500', '124,500', '0'],
        ['Material Movements (MM)', 'MATDOC', 'ADSO_MATDOC', '38,100', '38,100', '0'],
        ['Purchase Orders (PUR)', 'EKKO / EKPO', 'ADSO_PUR_EKPO', '21,400', '21,400', '0']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ADSO_SALES_H', 'ADSO_FIN_ACDOCA'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Source-to-target reconciliation hash verification across operational tables.'
    },
    recommendedSapActions: [
      { actionName: 'Data Reconciliation Run', tcode: 'Fiori F3160', description: 'Review automated source-to-target hash reconciliation matrix' },
      { actionName: 'ODQ Delta Verification', tcode: 'ODQMON', description: 'Confirm zero unacknowledged data packages in delta queues' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Compare source record count with BW record count.',
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'Source vs BW Record Reconciliation Matrix',
    pfcgAuthObject: 'S_RS_COMP, S_TABU_DIS',
    sapSourceTables: ['VBAK', 'ACDOCA', 'MATDOC', 'ADSO_SALES_H', 'ADSO_FIN_ACDOCA', 'ADSO_MATDOC'],
    summaryAnswer: 'Source vs Target record matrix: Sales Orders (VBAK: 49,200 | BW: 49,200, 0 var), Financial Postings (ACDOCA: 124,500 | BW: 124,500, 0 var), Material Movements (MATDOC: 38,100 | BW: 38,100, 0 var). System is 100% reconciled.',
    keyInsights: [
      'Comprehensive reconciliation across 211,800 active transactional records.',
      'Zero record count discrepancies across all 3 primary core modules.',
      'Data verification grounded on live S/4 document hashes.',
      'Automated reconciliation latency: 22ms.'
    ],
    analyticsMetrics: [
      { label: 'Source Total Count', value: '211,800 Records', status: 'positive' },
      { label: 'BW Total Count', value: '211,800 Records', status: 'positive' },
      { label: 'Discrepancy Count', value: '0 Records', status: 'positive' },
      { label: 'Match Ratio', value: '100.00%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Sales Orders (VBAK)', value: '49,200 Source = 49,200 BW', variance: '100% Match', detail: 'Reconciliation Status: RECONCILED_100%' },
      { category: 'Financial Lines (ACDOCA)', value: '124,500 Source = 124,500 BW', variance: '100% Match', detail: 'Reconciliation Status: RECONCILED_100%' },
      { category: 'Stock Lines (MATDOC)', value: '38,100 Source = 38,100 BW', variance: '100% Match', detail: 'Reconciliation Status: RECONCILED_100%' }
    ],
    tableData: {
      headers: ['Entity / Table', 'Source S/4 Count', 'Target BW ADSO Count', 'Variance', 'Reconciliation Status'],
      rows: [
        ['Sales Orders (VBAK)', '49,200', '49,200', '0', 'RECONCILED_100%'],
        ['Journal Entries (ACDOCA)', '124,500', '124,500', '0', 'RECONCILED_100%'],
        ['Material Stock (MATDOC)', '38,100', '38,100', '0', 'RECONCILED_100%'],
        ['Total Audited', '211,800', '211,800', '0', 'RECONCILED_100%']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: ['C_SalesOrderAnalytics'],
      bwObjectsInvolved: ['ADSO_SALES_H', 'ADSO_FIN_ACDOCA', 'ADSO_MATDOC'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Record count matrix comparison executed across S/4 and BW/4HANA.'
    },
    recommendedSapActions: [
      { actionName: 'Record Count Matrix', tcode: 'Fiori F3160', description: 'Review real-time record reconciliation scorecard in SAP Fiori' },
      { actionName: 'Table Data Browser', tcode: 'SE16N', description: 'Perform manual audit of record counts in VBAK and ACDOCA' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Which delta loads are incomplete?',
    category: 'BW Data Load & ETL Questions',
    targetSystem: 'BW/4HANA EDW',
    sapTechnicalTarget: 'ODP Delta Queue Monitor ODQMON',
    pfcgAuthObject: 'S_RS_DTP, S_RS_ODSO',
    sapSourceTables: ['ODQ_QUEUE', 'ODQ_DATA', 'RSPMREQUEST'],
    summaryAnswer: 'Only 1 delta load is currently in incomplete status: Delta request #ODQ_20260811_02 on extractor 2LIS_11_VAHDR (1,240 records pending activation into ADSO_SALES_H due to temporary lock contention retry). All other 17 delta pipelines are fully consolidated.',
    keyInsights: [
      'Incomplete Delta: Request #ODQ_20260811_02 (1,240 records in ODQ buffer).',
      'Extractor: 2LIS_11_VAHDR (Sales Order Header Delta).',
      'Target: ADSO_SALES_H active table.',
      'Status: Auto-recovery triggered; full activation expected within 3 minutes.'
    ],
    analyticsMetrics: [
      { label: 'Incomplete Deltas', value: '1 Delta', status: 'warning' },
      { label: 'Buffered Records', value: '1,240 Records', status: 'neutral' },
      { label: 'Completed Deltas', value: '17 Deltas', status: 'positive' },
      { label: 'Consolidation Rate', value: '94.4%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'ODQ_20260811_02 (2LIS_11_VAHDR)', value: '1,240 records pending activation', variance: 'Buffering in ODQ', detail: 'Target: ADSO_SALES_H | ETA to resolution: 3 mins' }
    ],
    tableData: {
      headers: ['Delta Request ID', 'Extractor', 'Target ADSO', 'Buffered Records', 'Reason for Buffer', 'Next Scheduled Step'],
      rows: [
        ['ODQ_20260811_02', '2LIS_11_VAHDR', 'ADSO_SALES_H', '1,240', 'DTP retry queue lock release', 'DTP activation step']
      ]
    },
    technicalDetails: {
      cdsViewsUsed: [],
      bwObjectsInvolved: ['ODQMON', 'ADSO_SALES_H'],
      datasphereSpacesInvolved: [],
      sqlGenerationBlocked: true,
      auditTrailNote: 'Delta queue scan filtered by unconsolidated status in ODQMON.'
    },
    recommendedSapActions: [
      { actionName: 'Delta Queue Administration', tcode: 'ODQMON', description: 'Monitor active delta subscriptions and manually trigger queue compression' },
      { actionName: 'Process Chain Scheduling', tcode: 'RSPC', description: 'Ensure next delta daemon job is scheduled to execute' }
    ]
  }
];
