import { MmExecutiveQuestionAnswer } from '../types';

export const ALL_MM_EXECUTIVE_QUESTIONS: MmExecutiveQuestionAnswer[] = [
  // ============================================================================
  // PILLAR 1: Material Master Management (Q1 - Q10)
  // ============================================================================
  {
    questionId: 'Q1',
    questionText: 'Show details of Material MAT-1001.',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MAKT', 'MARC', 'MARD', 'MBEW', 'MVKE'],
    summaryAnswer: 'Material MAT-1001 (Industrial Hydraulic Valve 500 PSI) is active across Plant 1000 (Storage Loc 0001). Type: FERT, Material Group: VALV-01, Base UoM: EA. Standard Price: $485.00/EA. Current unrestricted stock: 1,420 EA. Valuation Total: $688,700. MRP Type: PD, Lot Size: EX, Planned Delivery Time: 5 days.',
    keyInsights: [
      'Material Master fully maintained across Basic Data, Sales Org, Purchasing, MRP 1-4, and Accounting 1 views.',
      'Active BOM BOM-V500 rev 4 assigned with standard routing RT-VALV-01.',
      'Safety Stock configured at 250 EA; current stock (1,420 EA) exceeds reorder threshold.'
    ],
    mmMetrics: [
      { label: 'Standard Price', value: '$485.00 / EA', status: 'positive' },
      { label: 'Unrestricted Stock', value: '1,420 EA', status: 'positive' },
      { label: 'MRP Type / Lot Size', value: 'PD / EX', status: 'neutral' },
      { label: 'Valuation Class', value: '7920 (Finished)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 / Loc 0001 (Main)', value: '1,150 EA', variance: '81% of Total', detail: 'Unrestricted Storage' },
      { category: 'Plant 1000 / Loc 0002 (Buffer)', value: '270 EA', variance: '19% of Total', detail: 'Secondary Staging' },
      { category: 'Plant 2000 / Loc 0001', value: '0 EA', variance: 'Stockout', detail: 'Extended view required' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Material Master', tcode: 'MM03', description: 'Inspect all Plant 1000 and valuation views for MAT-1001' },
      { actionName: 'Stock Overview', tcode: 'MMBE', description: 'Review real-time multi-plant stock distribution and batches' }
    ]
  },
  {
    questionId: 'Q2',
    questionText: 'Which materials were created this week?',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'CDHDR', 'CDPOS', 'MAKT'],
    summaryAnswer: 'In the last 7 calendar days, 14 new material master records were created in S/4HANA (8 ROH raw materials, 4 HALB semi-finished, 2 FERT finished goods). All 14 records passed automated MDG (Master Data Governance) duplicate validation.',
    keyInsights: [
      '8 Raw materials created for the new EV Battery sub-assembly line.',
      '12 of 14 materials have all mandatory views extended (Purchasing, Accounting, MRP).',
      '2 materials (ROH-9041, ROH-9042) are missing Purchasing Info Records.'
    ],
    mmMetrics: [
      { label: 'Created This Week', value: '14 Materials', status: 'positive' },
      { label: 'Fully Configured', value: '12 of 14 (86%)', status: 'positive' },
      { label: 'Pending Info Records', value: '2 Records', status: 'warning' },
      { label: 'MDG Approval State', value: '100% Approved', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Raw Materials (ROH)', value: '8 Records', variance: '+60% vs Prev Week', detail: 'Supplier: Bosch & Continental' },
      { category: 'Semi-Finished (HALB)', value: '4 Records', variance: 'Normal', detail: 'Internal Assembly Line 2' },
      { category: 'Finished Goods (FERT)', value: '2 Records', variance: 'New Product Line', detail: 'Commercial Launch Q3' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Creation Audit', tcode: 'MM60', description: 'Display complete material list filtered by creation date range' },
      { actionName: 'Maintain Info Records', tcode: 'ME11', description: 'Create purchasing info records for ROH-9041 and ROH-9042' }
    ]
  },
  {
    questionId: 'Q3',
    questionText: 'Which materials are inactive?',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MARC', 'MBEW', 'MSEG'],
    summaryAnswer: 'Identified 38 inactive materials flagged with Deletion Indicator (LVORM) or Cross-Plant Material Status (MSTAE = "01 - Inactive/Blocked"). Total residual valuation locked in inactive stock is $42,150 across 3 plants.',
    keyInsights: [
      '22 materials have zero stock and can be archived via SARA object MM_MATNR.',
      '16 materials have 4,890 EA residual physical stock requiring scrap posting (Mvt 551) or write-down.',
      'No open purchase orders or active sales orders exist against these 38 codes.'
    ],
    mmMetrics: [
      { label: 'Inactive Materials', value: '38 Records', status: 'warning' },
      { label: 'Zero Stock (Archivable)', value: '22 Materials', status: 'positive' },
      { label: 'Residual Stock Tied Up', value: '$42,150', status: 'negative' },
      { label: 'Pending Deletions', value: '16 Pending Scrap', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Manufacturing)', value: '18 Inactive', variance: '$28,400', detail: 'Legacy components' },
      { category: 'Plant 2000 (Assembly)', value: '14 Inactive', variance: '$11,250', detail: 'Superseded by rev 2' },
      { category: 'Plant 3000 (Aftermarket)', value: '6 Inactive', variance: '$2,500', detail: 'Discontinued spares' }
    ],
    recommendedSapActions: [
      { actionName: 'Mass Deletion Flag', tcode: 'MM17', description: 'Execute mass maintenance to update deletion flags across plants' },
      { actionName: 'Post Scrap Movement', tcode: 'MIGO', description: 'Post Goods Issue with Movement 551 for obsolete inventory' }
    ]
  },
  {
    questionId: 'Q4',
    questionText: 'Show materials missing MRP data.',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MARC', 'MPOP', 'T438A'],
    summaryAnswer: '26 materials in Plant 1000 are missing MRP data (MARC-DISPO is blank, MRP Type is ND or missing, or Lot Sizing procedure is unassigned). These materials are currently excluded from automated MRP runs (MD01N).',
    keyInsights: [
      '18 Raw Materials (ROH) have MRP Type ND (No Planning), preventing automated Purchase Requisition generation.',
      '5 Sub-assemblies lack MRP Controller assignment, causing planning exception errors.',
      '3 Trading goods have invalid Planned Delivery Times (0 days).'
    ],
    mmMetrics: [
      { label: 'Missing MRP Data', value: '26 Materials', status: 'negative' },
      { label: 'Excluded from MD01N', value: '18 ROH Items', status: 'negative' },
      { label: 'Unassigned MRP Ctrl', value: '5 Records', status: 'warning' },
      { label: 'Lead Time Defaulted 0', value: '3 Items', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Raw Materials (ROH)', value: '18 Items', variance: 'Critical Risk', detail: 'Risk of production stoppage' },
      { category: 'Semi-Finished (HALB)', value: '5 Items', variance: 'Moderate Risk', detail: 'Missing MRP controller' },
      { category: 'Trading Goods (HAWA)', value: '3 Items', variance: 'Low Risk', detail: 'Lead time unmaintained' }
    ],
    recommendedSapActions: [
      { actionName: 'Mass MRP Maintenance', tcode: 'MM17', description: 'Populate MRP Type PD, Lot Size EX, and MRP Controllers' },
      { actionName: 'MRP Live Verification', tcode: 'MD01N', description: 'Execute dry-run MRP evaluation to verify planning coverage' }
    ]
  },
  {
    questionId: 'Q5',
    questionText: 'Which materials have incomplete master data?',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MARC', 'MARD', 'MBEW', 'MLGN', 'MVKE'],
    summaryAnswer: '19 materials have incomplete master data views: 7 missing Accounting 1 (no valuation class/price control), 6 missing Purchasing data (no purchasing group), 4 missing EWM/Warehouse views, and 2 missing Sales views.',
    keyInsights: [
      '7 materials cannot have Goods Receipts posted due to missing MBEW valuation records (Error M8 147).',
      '6 materials cannot be included in Purchase Orders due to missing MARC Purchasing Group.',
      'Immediate mass completion required prior to month-end transaction posting.'
    ],
    mmMetrics: [
      { label: 'Incomplete Records', value: '19 Materials', status: 'negative' },
      { label: 'Missing Valuation', value: '7 Materials', status: 'negative' },
      { label: 'Missing Purchasing', value: '6 Materials', status: 'warning' },
      { label: 'Missing WM Views', value: '4 Materials', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Accounting View Missing', value: '7 Items', variance: 'Block GR (MIGO)', detail: 'No Valuation Class / S Price' },
      { category: 'Purchasing View Missing', value: '6 Items', variance: 'Block PO (ME21N)', detail: 'No Purchasing Group' },
      { category: 'Warehouse View Missing', value: '4 Items', variance: 'Block Putaway', detail: 'No Storage Type indicator' }
    ],
    recommendedSapActions: [
      { actionName: 'Extend Valuation Data', tcode: 'MM50', description: 'List and extend maintainable materials with missing views' },
      { actionName: 'Update Accounting View', tcode: 'MM02', description: 'Maintain Valuation Class 3000 / V-Price on pending records' }
    ]
  },
  {
    questionId: 'Q6',
    questionText: 'Show obsolete materials.',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MARC', 'MBEW', 'MSEG', 'MATDOC'],
    summaryAnswer: 'Identified 47 obsolete materials in the master catalog (cross-plant status "99 - Obsolete/Discontinued"). 29 materials have zero inventory, while 18 materials hold $128,450 in scrap-eligible inventory with no consumption in >18 months.',
    keyInsights: [
      'Total write-off reserve needed: $128,450 across Plant 1000 and Plant 2000.',
      'Active supersession chains (superseded by modern parts) are defined for 32 of 47 items in table VBAP/MARA.',
      'Physical bin space consumed by obsolete parts: 142 storage bins in Warehouse W01.'
    ],
    mmMetrics: [
      { label: 'Obsolete Materials', value: '47 Codes', status: 'warning' },
      { label: 'Residual Book Value', value: '$128,450', status: 'negative' },
      { label: 'Storage Bins Occupied', value: '142 Bins', status: 'warning' },
      { label: 'Supersession Ready', value: '32 Items (68%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 Warehouse W01', value: '28 Items ($84k)', variance: 'High Priority', detail: 'Automotive hydraulics' },
      { category: 'Plant 2000 Warehouse W02', value: '14 Items ($36k)', variance: 'Medium Priority', detail: 'Electronics PCB rev 1' },
      { category: 'Plant 3000 Depot', value: '5 Items ($8.4k)', variance: 'Low Priority', detail: 'Fasteners / Hardware' }
    ],
    recommendedSapActions: [
      { actionName: 'Scrap Posting', tcode: 'MIGO', description: 'Post movement 551 to clear obsolete stock to scrap cost center' },
      { actionName: 'Archive Materials', tcode: 'SARA', description: 'Initiate MM_MATNR archiving for zero-stock obsolete codes' }
    ]
  },
  {
    questionId: 'Q7',
    questionText: "Which materials haven't been used in the last 12 months?",
    category: 'Material Master Management',
    sapSourceTables: ['MATDOC', 'MSEG', 'MARC', 'MBEW'],
    summaryAnswer: '63 active materials across Plant 1000 and 2000 have had zero Goods Issues (Movement 201, 261, 601) in the last 12 months. Total locked inventory value is $312,800 across 24,100 stock units.',
    keyInsights: [
      'Top slow-mover: MAT-7088 (Titanium Fasteners) with $64,000 capital stagnant for 412 days.',
      'Carrying cost impact estimated at $46,920/year (15% annual inventory holding rate).',
      'Recommended action: Vendor return under warranty agreement or write-down.'
    ],
    mmMetrics: [
      { label: 'Zero Movement >365d', value: '63 Materials', status: 'negative' },
      { label: 'Capital Locked', value: '$312,800', status: 'negative' },
      { label: 'Annual Holding Cost', value: '$46,920/yr', status: 'warning' },
      { label: 'Average Days Stagnant', value: '448 Days', status: 'negative' }
    ],
    breakdownData: [
      { category: 'MAT-7088 (Titanium Fasteners)', value: '$64,000', variance: '412 Days Idle', detail: 'Plant 1000 / Loc 0001' },
      { category: 'MAT-4412 (Bearing Housing)', value: '$48,200', variance: '390 Days Idle', detail: 'Plant 1000 / Loc 0002' },
      { category: 'MAT-9901 (Sensor Bracket)', value: '$35,600', variance: '480 Days Idle', detail: 'Plant 2000 / Loc 0001' }
    ],
    recommendedSapActions: [
      { actionName: 'Slow-Moving Analysis', tcode: 'MC50', description: 'Run dead stock and slow-moving material analysis in Logistics Info System' },
      { actionName: 'Vendor Return Order', tcode: 'ME21N', description: 'Create return PO (Order Type NB with Return Indicator) to supplier' }
    ]
  },
  {
    questionId: 'Q8',
    questionText: 'Compare Material A and Material B.',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MARC', 'MBEW', 'EINE', 'MAKT'],
    summaryAnswer: 'Comparing MAT-1001 (Valve Standard) vs MAT-1002 (Valve High-Temp): MAT-1001 standard price is $485.00 with 1,420 EA stock and 5-day lead time. MAT-1002 is $620.00 with 310 EA stock and 12-day lead time. Both share identical base dimensions and mounting specs.',
    keyInsights: [
      'MAT-1001 is sourced from 2 local vendors; MAT-1002 requires specialized alloy import from single supplier.',
      'Safety stock: MAT-1001 is 250 EA (current coverage: 42 days); MAT-1002 is 100 EA (current coverage: 18 days).',
      'MAT-1001 can substitute for MAT-1002 in non-high-pressure applications (Engineering Rule ER-88).'
    ],
    mmMetrics: [
      { label: 'MAT-1001 Price / Stock', value: '$485 / 1,420 EA', status: 'positive' },
      { label: 'MAT-1002 Price / Stock', value: '$620 / 310 EA', status: 'warning' },
      { label: 'Lead Time Delta', value: '+7 Days on MAT-1002', status: 'warning' },
      { label: 'Interchangeable', value: 'Conditional (ER-88)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Standard Unit Cost', value: '$485 vs $620', variance: '+$135 (+27.8%)', detail: 'Specialized alloy premium' },
      { category: 'Inventory on Hand', value: '1,420 vs 310 EA', variance: '+1,110 EA on MAT-1001', detail: '42 days vs 18 days coverage' },
      { category: 'Approved Suppliers', value: '2 vs 1 Supplier', variance: 'Single-source risk on MAT-1002', detail: 'Vendor V-901 vs V-804' }
    ],
    recommendedSapActions: [
      { actionName: 'Side-by-Side Master Data', tcode: 'MM03', description: 'Compare engineering and purchasing tabs for both materials' },
      { actionName: 'Maintain Substitution', tcode: 'VB11', description: 'Create material determination rule for dynamic substitution' }
    ]
  },
  {
    questionId: 'Q9',
    questionText: 'Show duplicate material master records.',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MAKT', 'MARC', 'MDG_DUP_CHECK'],
    summaryAnswer: 'Master Data Governance audit detected 9 potential duplicate material pairs based on identical Manufacturer Part Numbers (MFRPN), base dimension specifications, and phonetic description similarity >92%.',
    keyInsights: [
      'Total duplicate inventory footprint: $86,400 scattered across separate material numbers.',
      'Duplicate pairs split purchasing volume, preventing tier-1 bulk discount thresholds.',
      'Recommended: Consolidate records under parent material ID and block child records with status 01.'
    ],
    mmMetrics: [
      { label: 'Duplicate Pairs', value: '9 Pairs (18 Codes)', status: 'warning' },
      { label: 'Split Inventory Value', value: '$86,400', status: 'warning' },
      { label: 'Consolidation Savings', value: '$14,200/yr', status: 'positive' },
      { label: 'MDG Confidence Score', value: '94.6% Match', status: 'positive' }
    ],
    breakdownData: [
      { category: 'MAT-3011 & MAT-3088 (O-Ring 25mm)', value: '$34,500', variance: 'Identical MFRPN', detail: 'Both active in Plant 1000' },
      { category: 'MAT-5020 & MAT-5091 (Steel Hex Bolt)', value: '$28,900', variance: 'Identical DIN 933', detail: 'Vendor 100084 & 100092' },
      { category: 'MAT-7102 & MAT-7155 (Bearing 6205)', value: '$23,000', variance: 'Identical ISO spec', detail: 'SKF vs NSK dual records' }
    ],
    recommendedSapActions: [
      { actionName: 'Consolidate Materials', tcode: 'MM17', description: 'Block duplicate material codes from procurement via status 01' },
      { actionName: 'Transfer Stock', tcode: 'MIGO', description: 'Post movement 309 (Material to Material transfer) to merge stock' }
    ]
  },
  {
    questionId: 'Q10',
    questionText: 'Recommend material master cleanup opportunities.',
    category: 'Material Master Management',
    sapSourceTables: ['MARA', 'MARC', 'MBEW', 'MARD', 'MSEG'],
    summaryAnswer: 'AI Master Data Optimization identified 3 high-impact cleanup initiatives across 142 material records: 1) Archive 22 zero-stock obsolete materials, 2) Complete MRP views on 26 active items, 3) Consolidate 9 duplicate pairs, unlocking $143,000 in working capital.',
    keyInsights: [
      'Immediate action on 26 unconfigured MRP items will prevent forecast stockouts in Manufacturing Line 1.',
      'Merging 9 duplicate pairs will enable an 8% volume rebate from Tier-1 suppliers ($14.2k/year).',
      'Purging 22 obsolete records reduces master data sync overhead in integrated EWM/MES systems.'
    ],
    mmMetrics: [
      { label: 'Total Cleanup Targets', value: '142 Materials', status: 'warning' },
      { label: 'Working Capital Impact', value: '$143,000', status: 'positive' },
      { label: 'Data Quality Index', value: '88.4% -> 99.2%', status: 'positive' },
      { label: 'Annual Holding Savings', value: '$21,450/yr', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Archive Obsolete Zero-Stock', value: '22 Codes', variance: 'Zero Financial Risk', detail: 'Execute SARA MM_MATNR' },
      { category: '2. Mass Populate MRP Views', value: '26 Codes', variance: 'High Supply Risk', detail: 'Execute MM17 with standard template' },
      { category: '3. Merge Duplicate Pairs', value: '9 Pairs', variance: '$14.2k Rebate Opp', detail: 'Execute MIGO 309 transfer' }
    ],
    recommendedSapActions: [
      { actionName: 'Launch MDG Mass Clean', tcode: 'MM17', description: 'Execute mass maintenance batch on flagged material attributes' },
      { actionName: 'Material Archiving Run', tcode: 'SARA', description: 'Schedule archiving run for flagged obsolete materials' }
    ]
  },

  // ============================================================================
  // PILLAR 2: Inventory Management (Q11 - Q20)
  // ============================================================================
  {
    questionId: 'Q11',
    questionText: 'Show current inventory by plant.',
    category: 'Inventory Management',
    sapSourceTables: ['MARD', 'MARC', 'MBEW', 'T001W'],
    summaryAnswer: 'Total live inventory across the enterprise is $18,420,500 representing 142,650 SKUs across 4 plants: Plant 1000 (Manufacturing): $10.2M (55.4%), Plant 2000 (Assembly): $4.8M (26.1%), Plant 3000 (Distribution): $2.6M (14.1%), Plant 4000 (Aftermarket): $820k (4.4%).',
    keyInsights: [
      'Unrestricted stock represents 92.4% ($17.02M), Quality Inspection stock 5.1% ($940k), Blocked stock 2.5% ($460k).',
      'Plant 1000 inventory is operating at 94% warehouse capacity; Plant 3000 at 68%.',
      'Inventory turnover ratio is 6.4x per annum enterprise-wide.'
    ],
    mmMetrics: [
      { label: 'Total Valuation', value: '$18.42M', status: 'positive' },
      { label: 'Unrestricted Stock', value: '92.4% ($17.0M)', status: 'positive' },
      { label: 'In Quality Stock', value: '$940,000', status: 'neutral' },
      { label: 'Blocked / Scrap', value: '$460,000', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas Hub)', value: '$10,200,000', variance: '78,400 SKUs', detail: '94% Bin Utilization' },
      { category: 'Plant 2000 (Austin Assembly)', value: '$4,800,000', variance: '41,200 SKUs', detail: '82% Bin Utilization' },
      { category: 'Plant 3000 (Chicago DC)', value: '$2,600,000', variance: '18,500 SKUs', detail: '68% Bin Utilization' },
      { category: 'Plant 4000 (Atlanta Spares)', value: '$820,500', variance: '4,550 SKUs', detail: '54% Bin Utilization' }
    ],
    recommendedSapActions: [
      { actionName: 'Plant Stock Overview', tcode: 'MB52', description: 'Display warehouse stocks on hand with batch and valuation detail' },
      { actionName: 'Inventory Valuation by Plant', tcode: 'MC.9', description: 'Analyze stock balances and monthly inventory evolution' }
    ]
  },
  {
    questionId: 'Q12',
    questionText: 'Which materials are below minimum stock?',
    category: 'Inventory Management',
    sapSourceTables: ['MARD', 'MARC', 'EBAN', 'EKPO'],
    summaryAnswer: '12 materials in Plant 1000 are currently below safety/minimum stock thresholds (MARC-MINBE). 8 of these have open purchase orders in transit, but 4 critical items have zero replenishment coverage.',
    keyInsights: [
      'Critical stockout risk: MAT-1088 (Precision Gasket) is at 15 EA against Safety Stock of 100 EA (Stockout expected in 2 days).',
      'Automated MRP purchase requisitions have been generated for all 4 uncovered materials.',
      'Expedite required with Supplier 100045 (Parker Hannifin) for MAT-1088.'
    ],
    mmMetrics: [
      { label: 'Below Min Stock', value: '12 Materials', status: 'negative' },
      { label: 'Zero Replenishment Coverage', value: '4 Items', status: 'negative' },
      { label: 'PO In Transit', value: '8 Items', status: 'positive' },
      { label: 'Worst Stockout Window', value: '2 Days (MAT-1088)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'MAT-1088 (Precision Gasket)', value: '15 EA (Min: 100)', variance: '-85 EA Deficit', detail: 'No Open PO! Immediate PO needed' },
      { category: 'MAT-2204 (Hydraulic Seal)', value: '40 EA (Min: 200)', variance: '-160 EA Deficit', detail: 'PR 1000892 pending approval' },
      { category: 'MAT-3319 (Copper Bushing)', value: '80 EA (Min: 300)', variance: '-220 EA Deficit', detail: 'PO 45000192 in transit (ETA 3 days)' }
    ],
    recommendedSapActions: [
      { actionName: 'Stock / Requirements List', tcode: 'MD04', description: 'Evaluate live MRP pegging and shortage elements for MAT-1088' },
      { actionName: 'Create Urgent PO', tcode: 'ME21N', description: 'Convert PR 1000892 to Purchase Order with overnight freight' }
    ]
  },
  {
    questionId: 'Q13',
    questionText: 'Which materials are overstocked?',
    category: 'Inventory Management',
    sapSourceTables: ['MARD', 'MARC', 'MBEW'],
    summaryAnswer: '18 materials exceed maximum stock limits (MARC-MABST) or have days of supply >120 days based on average daily consumption. Total excess capital tied up in overstock is $684,200.',
    keyInsights: [
      'Top overstock item: MAT-6620 (Stainless Hex Screws) with 420 days of supply ($142,000 tied up).',
      'Overstock is driving storage congestion in Plant 1000 High-Bay Racking.',
      'Recommendations: Pause planned MRP purchases, adjust Lot Sizing from fixed (FX) to lot-for-lot (EX).'
    ],
    mmMetrics: [
      { label: 'Overstocked Items', value: '18 Materials', status: 'warning' },
      { label: 'Excess Capital Tied Up', value: '$684,200', status: 'negative' },
      { label: 'Max Days of Supply', value: '420 Days (MAT-6620)', status: 'warning' },
      { label: 'Avg Days of Supply', value: '184 Days', status: 'warning' }
    ],
    breakdownData: [
      { category: 'MAT-6620 (Stainless Screws)', value: '84,000 EA ($142k)', variance: '+300 Days Excess', detail: 'Plant 1000 / Loc 0001' },
      { category: 'MAT-4109 (Aluminum Extrusion)', value: '12,500 M ($118k)', variance: '+240 Days Excess', detail: 'Plant 2000 / Loc 0001' },
      { category: 'MAT-8022 (Nylon Spacer)', value: '65,000 EA ($92k)', variance: '+190 Days Excess', detail: 'Plant 1000 / Loc 0002' }
    ],
    recommendedSapActions: [
      { actionName: 'Adjust MRP Lot Size', tcode: 'MM02', description: 'Change Lot Sizing to EX (Lot-for-Lot) and set Maximum Stock Limit' },
      { actionName: 'Cancel Open Future POs', tcode: 'ME22N', description: 'Delete or postpone delivery dates on open purchase order schedule lines' }
    ]
  },
  {
    questionId: 'Q14',
    questionText: 'Show stock available across all plants.',
    category: 'Inventory Management',
    sapSourceTables: ['MARD', 'MARC', 'MBEW', 'T001W'],
    summaryAnswer: 'Global multi-plant stock distribution query: Live consolidated stock across all 4 plants totals 142,650 units ($18.42M). Cross-plant stock visibility is active with inter-company STO (Stock Transport Order) pipelines enabled.',
    keyInsights: [
      'Plant 1000 holds 62% of raw material inventory ($6.3M) supporting main production lines.',
      'Plant 2000 holds 58% of semi-finished WIP ($2.8M).',
      'Plant 3000 holds 74% of finished commercial goods ($1.9M) positioned for customer distribution.'
    ],
    mmMetrics: [
      { label: 'Consolidated Stock', value: '142,650 Units', status: 'positive' },
      { label: 'Total Valuation', value: '$18,420,500', status: 'positive' },
      { label: 'Active Plants', value: '4 Plants / 18 SLocs', status: 'positive' },
      { label: 'In-Transit STO Stock', value: '$412,000', status: 'neutral' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas HQ)', value: '$10.2M (78.4k Units)', variance: '55.4% Share', detail: 'Raw & Component Staging' },
      { category: 'Plant 2000 (Austin Assembly)', value: '$4.8M (41.2k Units)', variance: '26.1% Share', detail: 'Sub-assembly & WIP' },
      { category: 'Plant 3000 (Chicago DC)', value: '$2.6M (18.5k Units)', variance: '14.1% Share', detail: 'Finished Goods distribution' },
      { category: 'Plant 4000 (Atlanta Spares)', value: '$820k (4.5k Units)', variance: '4.4% Share', detail: 'Field service spares' }
    ],
    recommendedSapActions: [
      { actionName: 'Multi-Plant Overview', tcode: 'MB52', description: 'Run cross-plant inventory report without plant restriction' },
      { actionName: 'Stock Transport Order', tcode: 'ME21N', description: 'Create STO (UB document type) to rebalance stock across plants' }
    ]
  },
  {
    questionId: 'Q15',
    questionText: 'Which materials have negative inventory?',
    category: 'Inventory Management',
    sapSourceTables: ['MARD', 'MARC', 'MBEW', 'T159L'],
    summaryAnswer: 'Zero materials currently have negative inventory in Plant 1000 or Plant 2000. S/4HANA Negative Stocks customizing (OMJ1 / MARC-XMCNG) is strictly disabled in production client 100 to enforce physical posting discipline.',
    keyInsights: [
      'System validation: S/4HANA strictly blocks Goods Issues (Movement 261/601) when unrestricted stock is insufficient (Error M7 021).',
      'No back-flush posting discrepancies detected across all 4 production lines.',
      'Physical inventory cycle count accuracy is verified at 99.4%.'
    ],
    mmMetrics: [
      { label: 'Negative Inventory SKUs', value: '0 SKUs', status: 'positive' },
      { label: 'Negative Stock Allowed', value: 'Disabled (OMJ1)', status: 'positive' },
      { label: 'Inventory Record Accuracy', value: '99.4%', status: 'positive' },
      { label: 'Posting Discrepancies', value: '0 Errors', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 Storage Loc 0001', value: '0 Negative Records', variance: '100% Compliant', detail: 'Physical posting validated' },
      { category: 'Plant 2000 Storage Loc 0001', value: '0 Negative Records', variance: '100% Compliant', detail: 'Backflush synchronized' },
      { category: 'Plant 3000 Storage Loc 0001', value: '0 Negative Records', variance: '100% Compliant', detail: 'EWM bin synchronization active' }
    ],
    recommendedSapActions: [
      { actionName: 'Verify Stock Balances', tcode: 'MB5B', description: 'Execute Stocks for Posting Date audit to verify historical integrity' },
      { actionName: 'Physical Inventory Monitor', tcode: 'MI24', description: 'Review cycle counting progress and open inventory documents' }
    ]
  },
  {
    questionId: 'Q16',
    questionText: 'Show slow-moving inventory.',
    category: 'Inventory Management',
    sapSourceTables: ['MATDOC', 'MSEG', 'MARC', 'MBEW', 'MC50'],
    summaryAnswer: 'Identified 34 slow-moving materials (turnover rate < 1.2x/year with days of supply >180 days). Total value of slow-moving inventory is $492,000 across Plant 1000 and 2000.',
    keyInsights: [
      'Top slow-mover: MAT-5012 (Cast Iron Housing) with $88,000 stock holding 210 days of supply.',
      'Holding cost run-rate is $73,800/year.',
      'Opportunity to negotiate vendor buy-back or discount sale to third-party distributors.'
    ],
    mmMetrics: [
      { label: 'Slow-Moving Items', value: '34 Materials', status: 'warning' },
      { label: 'Tied Up Capital', value: '$492,000', status: 'negative' },
      { label: 'Avg Days of Supply', value: '224 Days', status: 'warning' },
      { label: 'Annual Carrying Cost', value: '$73,800/yr', status: 'negative' }
    ],
    breakdownData: [
      { category: 'MAT-5012 (Cast Iron Housing)', value: '$88,000', variance: '210 Days Supply', detail: 'Turnover: 0.8x/yr' },
      { category: 'MAT-3390 (Industrial Solenoid)', value: '$64,500', variance: '240 Days Supply', detail: 'Turnover: 0.6x/yr' },
      { category: 'MAT-8814 (Drive Belt XL)', value: '$45,000', variance: '195 Days Supply', detail: 'Turnover: 1.1x/yr' }
    ],
    recommendedSapActions: [
      { actionName: 'Slow Moving Analysis', tcode: 'MC50', description: 'Execute LIS slow-moving inventory report with custom threshold days' },
      { actionName: 'Adjust Reorder Point', tcode: 'MM02', description: 'Lower safety stock and reorder points in MRP 1 view' }
    ]
  },
  {
    questionId: 'Q17',
    questionText: 'Show non-moving inventory.',
    category: 'Inventory Management',
    sapSourceTables: ['MATDOC', 'MSEG', 'MARC', 'MBEW', 'MC52'],
    summaryAnswer: 'Identified 29 completely non-moving materials (zero consumption or goods issues for >180 days). Total dead stock valuation is $245,600.',
    keyInsights: [
      '14 materials have had zero movement for >360 days ($158,000 book value).',
      'Non-moving stock occupies 86 high-density pallet locations in Warehouse W01.',
      'Recommend immediate 50% write-down reserve and scrap disposition.'
    ],
    mmMetrics: [
      { label: 'Non-Moving Materials', value: '29 Materials', status: 'negative' },
      { label: 'Dead Stock Valuation', value: '$245,600', status: 'negative' },
      { label: 'Zero Movement >360d', value: '14 Items ($158k)', status: 'negative' },
      { label: 'Warehouse Bins Tied', value: '86 Pallets', status: 'warning' }
    ],
    breakdownData: [
      { category: 'MAT-9011 (Turbine Seal Ring)', value: '$52,000', variance: '430 Days Dead', detail: 'Discontinued project' },
      { category: 'MAT-4402 (Hydraulic Manifold v1)', value: '$38,400', variance: '395 Days Dead', detail: 'Replaced by v2' },
      { category: 'MAT-7718 (Control Module Gen 1)', value: '$31,200', variance: '370 Days Dead', detail: 'No active production demand' }
    ],
    recommendedSapActions: [
      { actionName: 'Dead Stock Report', tcode: 'MC52', description: 'Display dead stock analysis by plant, storage location, and material group' },
      { actionName: 'Scrap Inventory', tcode: 'MIGO', description: 'Post movement 551 to scrap dead stock and reclaim warehouse space' }
    ]
  },
  {
    questionId: 'Q18',
    questionText: 'Which materials will stock out within the next 7 days?',
    category: 'Inventory Management',
    sapSourceTables: ['MD04', 'MARD', 'RESB', 'EKPO', 'AFKO'],
    summaryAnswer: 'Predictive MRP Simulation projects that 5 critical raw materials will stock out within 7 days based on confirmed production order reservations (RESB) and current stock on hand.',
    keyInsights: [
      'Highest risk: MAT-1044 (Silicon Sealant) will reach 0 EA on Thursday (Day 3) affecting 2 assembly lines.',
      'PO 45000198 for MAT-1044 is confirmed for Friday (1 day late). Overnight freight expedite required.',
      'Total production revenue at risk across the 5 materials: $480,000.'
    ],
    mmMetrics: [
      { label: 'Stockouts in 7 Days', value: '5 Materials', status: 'negative' },
      { label: 'First Stockout In', value: '3 Days (MAT-1044)', status: 'negative' },
      { label: 'Production Lines At Risk', value: '2 Lines', status: 'negative' },
      { label: 'Revenue At Risk', value: '$480,000', status: 'negative' }
    ],
    breakdownData: [
      { category: 'MAT-1044 (Silicon Sealant)', value: '3 Days to Zero', variance: '50 EA Deficit', detail: 'PO 45000198 expedite required' },
      { category: 'MAT-2190 (Copper Wire 2mm)', value: '4 Days to Zero', variance: '120 KG Deficit', detail: 'Transfer from Plant 2000 available' },
      { category: 'MAT-3881 (Rubber Bushing)', value: '6 Days to Zero', variance: '200 EA Deficit', detail: 'Supplier confirmed early delivery' }
    ],
    recommendedSapActions: [
      { actionName: 'Live MRP Evaluation', tcode: 'MD04', description: 'Inspect stock/requirements situation and expedite purchase orders' },
      { actionName: 'Inter-Plant STO', tcode: 'ME21N', description: 'Create emergency STO from Plant 2000 to cover 120 KG copper deficit' }
    ]
  },
  {
    questionId: 'Q19',
    questionText: 'Show inventory valuation by plant.',
    category: 'Inventory Management',
    sapSourceTables: ['MBEW', 'MARC', 'T001W', 'CKMLCR'],
    summaryAnswer: 'Enterprise inventory is valuated at $18,420,500 using Material Ledger with standard price (S) for finished/semi-finished and moving average price (V) for raw materials. Plant 1000 holds $10.2M (55.4%), Plant 2000 $4.8M (26.1%), Plant 3000 $2.6M (14.1%), Plant 4000 $820k (4.4%).',
    keyInsights: [
      'Raw Materials (ROH): $7.4M (40.2%), WIP / Semi-Finished (HALB): $4.6M (25.0%), Finished Goods (FERT): $6.4M (34.8%).',
      'Material Ledger monthly actual costing active in all plants with currency EUR and USD.',
      'Purchase price variance (PPV) variance rate for the current period is favorable at -1.4%.'
    ],
    mmMetrics: [
      { label: 'Total Valuation', value: '$18,420,500', status: 'positive' },
      { label: 'Raw Materials (ROH)', value: '$7,400,000 (40%)', status: 'positive' },
      { label: 'Finished Goods (FERT)', value: '$6,420,500 (35%)', status: 'positive' },
      { label: 'PPV Variance Rate', value: '-1.4% Favorable', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 (Dallas Mfg)', value: '$10,200,000', variance: '55.4% Share', detail: 'ROH: $6.3M, HALB: $2.4M, FERT: $1.5M' },
      { category: 'Plant 2000 (Austin Assembly)', value: '$4,800,000', variance: '26.1% Share', detail: 'ROH: $1.1M, HALB: $2.2M, FERT: $1.5M' },
      { category: 'Plant 3000 (Chicago DC)', value: '$2,600,000', variance: '14.1% Share', detail: 'FERT: $2.6M Commercial' },
      { category: 'Plant 4000 (Atlanta Spares)', value: '$820,500', variance: '4.4% Share', detail: 'Spare parts inventory' }
    ],
    recommendedSapActions: [
      { actionName: 'Valuation Audit', tcode: 'MB5L', description: 'Reconcile G/L inventory account balances with MM sub-ledger' },
      { actionName: 'Material Ledger Analysis', tcode: 'CKM3N', description: 'Analyze material price analysis and cost breakdown components' }
    ]
  },
  {
    questionId: 'Q20',
    questionText: 'Recommend inventory optimization opportunities.',
    category: 'Inventory Management',
    sapSourceTables: ['MARC', 'MARD', 'MBEW', 'MD04', 'MC50'],
    summaryAnswer: 'AI Inventory Optimization identified $1.24M in working capital reduction opportunities: 1) Eliminate $684k in overstock by switching to lot-for-lot lot sizing, 2) Liquidate $245k in dead stock, 3) Rebalance $312k slow-moving inventory across plants, cutting holding costs by $186,000/year.',
    keyInsights: [
      'Safety stock dynamic calculation (Safety Time / Coverage Profiling) will reduce safety stock buffer by 18% without increasing stockout risk.',
      'Rebalancing slow-movers from Plant 1000 to Plant 3000 satisfies open sales orders without new purchases.',
      'Total annual holding cost savings: $186,000 (calculated at 15% WACC).'
    ],
    mmMetrics: [
      { label: 'Working Capital Opportunity', value: '$1,241,800', status: 'positive' },
      { label: 'Holding Cost Savings', value: '$186,000/yr', status: 'positive' },
      { label: 'Overstock Reduction', value: '$684,200', status: 'positive' },
      { label: 'Dead Stock Liquidation', value: '$245,600', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Dynamic Safety Stock Tuning', value: '$420,000 Reduction', variance: 'Zero Stockout Risk', detail: 'Implement MRP Safety Time profile' },
      { category: '2. Overstock PO Postponement', value: '$684,200 Capital Freed', variance: '18 Materials', detail: 'Push out delivery dates in ME22N' },
      { category: '3. Dead Stock Liquidation', value: '$245,600 Recovery', variance: '29 Materials', detail: 'Scrap (551) or vendor buyback' }
    ],
    recommendedSapActions: [
      { actionName: 'Batch MRP Parameter Update', tcode: 'MM17', description: 'Mass update Safety Stock and Lot Size parameters' },
      { actionName: 'Execute PO Rescheduling', tcode: 'MD04', description: 'Process MRP exception messages 10 (Bring Forward) and 15 (Postpone)' }
    ]
  },

  // ============================================================================
  // PILLAR 3: Purchasing (Q21 - Q30)
  // ============================================================================
  {
    questionId: 'Q21',
    questionText: 'Show all open Purchase Requisitions.',
    category: 'Purchasing',
    sapSourceTables: ['EBAN', 'EBKN', 'MARA', 'T001W'],
    summaryAnswer: 'Currently 42 open Purchase Requisitions (EBAN) in the system with a total value of $1,840,500. 28 are fully approved and awaiting PO conversion, 9 are currently in workflow approval, and 5 are blocked or rejected.',
    keyInsights: [
      '28 approved PRs ($1.42M) are ready for automated conversion to Purchase Orders via ME59N.',
      '9 PRs ($360k) are awaiting Level-2 manager sign-off (Flexible Workflow active).',
      'Average PR processing cycle time: 1.8 days.'
    ],
    mmMetrics: [
      { label: 'Open PRs', value: '42 Requisitions', status: 'neutral' },
      { label: 'Total Value', value: '$1,840,500', status: 'positive' },
      { label: 'Ready for PO Conversion', value: '28 PRs ($1.42M)', status: 'positive' },
      { label: 'Pending Approval', value: '9 PRs ($360k)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Production Raw Materials (ROH)', value: '24 PRs ($1.1M)', variance: 'High Priority', detail: 'Generated by MRP run' },
      { category: 'Maintenance / MRO Spares', value: '11 PRs ($480k)', variance: 'Medium Priority', detail: 'PM Work order generated' },
      { category: 'Indirect / Office / IT Services', value: '7 PRs ($260k)', variance: 'Low Priority', detail: 'Departmental requisitions' }
    ],
    recommendedSapActions: [
      { actionName: 'Automatic PO Creation', tcode: 'ME59N', description: 'Execute mass conversion of approved purchase requisitions into POs' },
      { actionName: 'Requisition List Display', tcode: 'ME5A', description: 'Display all open purchase requisitions with release status' }
    ]
  },
  {
    questionId: 'Q22',
    questionText: 'Show all open Purchase Orders.',
    category: 'Purchasing',
    sapSourceTables: ['EKKO', 'EKPO', 'EKET', 'LFA1'],
    summaryAnswer: 'There are 68 open Purchase Orders across all plants with total open commitment value of $4,920,000. 52 POs are fully released and confirmed with suppliers, 11 are awaiting release approval, and 5 have open delivery delays.',
    keyInsights: [
      '52 confirmed POs have confirmed Delivery Dates within the next 30 days.',
      'Top supplier by open commitment: Bosch Rexroth ($1.25M across 8 POs).',
      '94.2% of open POs have confirmed Order Acknowledgments (AB confirmation category).'
    ],
    mmMetrics: [
      { label: 'Open POs', value: '68 Orders', status: 'neutral' },
      { label: 'Open Commitment', value: '$4,920,000', status: 'positive' },
      { label: 'Released & Confirmed', value: '52 Orders (76%)', status: 'positive' },
      { label: 'Pending Approval', value: '11 Orders ($680k)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Standard Stock POs (NB)', value: '48 Orders ($3.8M)', variance: '77% of Value', detail: 'Manufacturing components' },
      { category: 'Subcontracting POs (SC)', value: '12 Orders ($720k)', variance: '15% of Value', detail: 'Plating & Heat Treatment' },
      { category: 'Service POs (FO)', value: '8 Orders ($400k)', variance: '8% of Value', detail: 'Facility & Calibration services' }
    ],
    recommendedSapActions: [
      { actionName: 'Purchasing Document List', tcode: 'ME2N', description: 'Display open purchase orders by material, plant, and delivery date' },
      { actionName: 'Vendor PO Summary', tcode: 'ME2L', description: 'Review open commitments grouped by vendor' }
    ]
  },
  {
    questionId: 'Q23',
    questionText: 'Which purchase orders are overdue?',
    category: 'Purchasing',
    sapSourceTables: ['EKKO', 'EKPO', 'EKET', 'LFA1'],
    summaryAnswer: '8 Purchase Orders are currently overdue (confirmed Delivery Date in EKET is in the past with no Goods Receipt posted in EKBE). Total overdue commitment value is $385,400.',
    keyInsights: [
      'Oldest overdue PO: 45000188 (Parker Hannifin) - 9 days overdue for 450 EA Hydraulic Valves ($218k).',
      'Production Line 2 faces a potential schedule slip if PO 45000188 is not received within 48 hours.',
      'Expedite notices (Dunning / Reminder level 2) have been generated.'
    ],
    mmMetrics: [
      { label: 'Overdue POs', value: '8 Orders', status: 'negative' },
      { label: 'Overdue Value', value: '$385,400', status: 'negative' },
      { label: 'Max Days Overdue', value: '9 Days (PO 45000188)', status: 'negative' },
      { label: 'Production Impact', value: 'Line 2 At Risk', status: 'negative' }
    ],
    breakdownData: [
      { category: 'PO 45000188 (Parker Hannifin)', value: '$218,250', variance: '9 Days Overdue', detail: 'MAT-1001 (450 EA) - High Impact' },
      { category: 'PO 45000194 (Continental AG)', value: '$94,500', variance: '5 Days Overdue', detail: 'MAT-2044 (800 EA) - Medium Impact' },
      { category: 'PO 45000201 (SKF Bearings)', value: '$48,000', variance: '3 Days Overdue', detail: 'MAT-3311 (1,200 EA) - Low Impact' }
    ],
    recommendedSapActions: [
      { actionName: 'Send Expedite Reminder', tcode: 'ME91F', description: 'Generate and transmit Level 2 Reminder / Expedite message to vendors' },
      { actionName: 'Update Confirmation Date', tcode: 'ME22N', description: 'Enter updated supplier promise date in Confirmation tab' }
    ]
  },
  {
    questionId: 'Q24',
    questionText: 'Which purchase orders require approval?',
    category: 'Purchasing',
    sapSourceTables: ['EKKO', 'EKPO', 'SWWWIHEAD', 'T16FS'],
    summaryAnswer: '11 Purchase Orders are currently blocked in release strategy / flexible workflow approval (EKKO-FRGKE = "B - Blocked"). Total value awaiting approval is $680,200 across 6 approvers.',
    keyInsights: [
      '4 POs exceed $100k requiring VP of Procurement sign-off.',
      'Longest pending approval: PO 45000210 ($185k for Titanium stock) pending with Approver J. DOE for 48 hours.',
      'SLA warning: 3 orders have exceeded the 24-hour approval window.'
    ],
    mmMetrics: [
      { label: 'Pending Approval', value: '11 POs', status: 'warning' },
      { label: 'Pending Value', value: '$680,200', status: 'warning' },
      { label: 'SLA Breached (>24h)', value: '3 Orders', status: 'negative' },
      { label: 'Max Pending Time', value: '48 Hours', status: 'warning' }
    ],
    breakdownData: [
      { category: 'PO 45000210 ($185k - Titanium)', value: 'Pending VP Approval', variance: '48h Waiting', detail: 'Approver: J. DOE (VP Operations)' },
      { category: 'PO 45000214 ($142k - Bearings)', value: 'Pending Director Approval', variance: '32h Waiting', detail: 'Approver: M. SMITH (Dir Supply)' },
      { category: 'PO 45000218 ($98k - Electronics)', value: 'Pending Manager Approval', variance: '18h Waiting', detail: 'Approver: R. VANCE (Purchasing Mgr)' }
    ],
    recommendedSapActions: [
      { actionName: 'Release Purchase Orders', tcode: 'ME28', description: 'Execute individual or collective release of blocked purchase orders' },
      { actionName: 'Fiori My Inbox', tcode: 'F0862', description: 'Approve pending PO flexible workflow work items in Fiori launchpad' }
    ]
  },
  {
    questionId: 'Q25',
    questionText: 'Which purchase orders have delivery delays?',
    category: 'Purchasing',
    sapSourceTables: ['EKKO', 'EKPO', 'EKET', 'LFA1'],
    summaryAnswer: '14 Purchase Orders have vendor-notified delivery delays (supplier confirmed delivery date is later than the initial PO requested delivery date). Total affected value is $924,000.',
    keyInsights: [
      'Average delivery delay across the 14 orders is 6.4 calendar days.',
      'Top cause: Port customs clearance delays on imported electronic modules from Europe.',
      'Safety stocks in Plant 1000 absorb 11 of the 14 delays; 3 require production schedule adjustment.'
    ],
    mmMetrics: [
      { label: 'Delayed POs', value: '14 Orders', status: 'warning' },
      { label: 'Affected Value', value: '$924,000', status: 'warning' },
      { label: 'Average Delay', value: '6.4 Days', status: 'warning' },
      { label: 'Safety Stock Absorbed', value: '11 of 14 (79%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PO 45000179 (Siemens AG)', value: '$240,000', variance: '+10 Days Delay', detail: 'Microcontrollers (Customs hold)' },
      { category: 'PO 45000182 (Schneider Electric)', value: '$180,000', variance: '+7 Days Delay', detail: 'Circuit Breakers (Factory lead time)' },
      { category: 'PO 45000190 (ABB Ltd)', value: '$135,000', variance: '+5 Days Delay', detail: 'Inverters (Transit delay)' }
    ],
    recommendedSapActions: [
      { actionName: 'PO Monitoring', tcode: 'ME2O', description: 'Monitor SC stock and vendor deliveries with delayed delivery dates' },
      { actionName: 'Reschedule Production', tcode: 'CM21', description: 'Adjust production order dispatch dates in Capacity Planning' }
    ]
  },
  {
    questionId: 'Q26',
    questionText: 'Show urgent procurement requests.',
    category: 'Purchasing',
    sapSourceTables: ['EBAN', 'MARA', 'RESB', 'EKKO'],
    summaryAnswer: '6 urgent procurement requisitions are flagged with Priority "1 - High/Urgent" or Requirement Tracking Number "URGENT-EXPEDITE". Total urgent procurement value is $315,000.',
    keyInsights: [
      'PR 1000898 ($120k for Emergency Spares) is tied to Plant 1000 Extruder Line 3 breakdown.',
      'All 6 urgent PRs have been fast-tracked through automated approval rules.',
      'Ready for immediate conversion to PO with same-day dispatch.'
    ],
    mmMetrics: [
      { label: 'Urgent Requisitions', value: '6 PRs', status: 'negative' },
      { label: 'Urgent Value', value: '$315,000', status: 'warning' },
      { label: 'Plant Breakdown Related', value: '2 PRs ($165k)', status: 'negative' },
      { label: 'Fast-Track Approved', value: '6 of 6 (100%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PR 1000898 (Extruder Motor Spares)', value: '$120,000', variance: 'Line Breakdown', detail: 'Supplier: Baldor Electric (Same-day dispatch)' },
      { category: 'PR 1000902 (Chemical Catalyst)', value: '$75,000', variance: 'Stockout in 48h', detail: 'Supplier: BASF (Air freight overnight)' },
      { category: 'PR 1000905 (Replacement Valves)', value: '$45,000', variance: 'Critical PM Job', detail: 'Supplier: Parker Hannifin' }
    ],
    recommendedSapActions: [
      { actionName: 'Instant PO Conversion', tcode: 'ME21N', description: 'Convert urgent PRs directly to POs with express freight conditions' },
      { actionName: 'Transmit PO to Vendor', tcode: 'ME9F', description: 'Trigger immediate EDI / XML transmission to supplier' }
    ]
  },
  {
    questionId: 'Q27',
    questionText: 'Which suppliers have delayed deliveries?',
    category: 'Purchasing',
    sapSourceTables: ['LFA1', 'EKKO', 'EKPO', 'EKET', 'MSEG'],
    summaryAnswer: 'Supplier on-time delivery (OTD) analysis across the last 90 days identifies 4 vendors with chronic delivery delays (OTD rate < 85%): 1) Parker Hannifin (78% OTD, avg 5.2 days late), 2) Schneider Electric (81% OTD), 3) Continental AG (82% OTD), 4) Festo AG (84% OTD).',
    keyInsights: [
      'Parker Hannifin delays have caused 3 production rescheduling events in the last quarter.',
      'Root cause: Component shortages at supplier tier-2 forging plant.',
      'Recommendation: Activate secondary qualified supplier (V-804 Eaton) for hydraulic valves.'
    ],
    mmMetrics: [
      { label: 'Chronic Delay Suppliers', value: '4 Vendors', status: 'negative' },
      { label: 'Worst OTD Rate', value: '78.2% (Parker)', status: 'negative' },
      { label: 'Avg Delivery Latency', value: '4.8 Days Late', status: 'warning' },
      { label: 'Quarterly Reschedule Events', value: '5 Incidents', status: 'negative' }
    ],
    breakdownData: [
      { category: 'Vendor 100045 (Parker Hannifin)', value: '78.2% OTD (5.2d late)', variance: '8 Delayed POs', detail: 'Hydraulic Valves & Fittings' },
      { category: 'Vendor 100088 (Schneider Electric)', value: '81.0% OTD (4.1d late)', variance: '5 Delayed POs', detail: 'Power Distribution & Breakers' },
      { category: 'Vendor 100062 (Continental AG)', value: '82.4% OTD (3.8d late)', variance: '4 Delayed POs', detail: 'Sensors & Hoses' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Evaluation', tcode: 'ME65', description: 'Generate vendor evaluation ranking sheet and OTD scores' },
      { actionName: 'Quota Arrangement', tcode: 'MEQ1', description: 'Reallocate 40% volume to secondary supplier (Eaton) in quota arrangement' }
    ]
  },
  {
    questionId: 'Q28',
    questionText: 'Show purchase order price variances.',
    category: 'Purchasing',
    sapSourceTables: ['EKKO', 'EKPO', 'EINE', 'MBEW', 'KONV'],
    summaryAnswer: 'Purchase price variance (PPV) audit shows an overall favorable net variance of -$48,200 (-1.4%) against standard material cost (MBEW-STPRS) across $3.4M in POs placed this month.',
    keyInsights: [
      '14 PO lines have unfavorable variances (PO price > Standard Cost) totaling +$32,400, primarily in Copper and Alloy categories.',
      '28 PO lines have favorable variances totaling -$80,600 due to negotiated volume discounts on fasteners and plastics.',
      'Largest single variance: MAT-8801 Copper Rod +12% price increase ($14,200 impact).'
    ],
    mmMetrics: [
      { label: 'Net PPV Variance', value: '-$48,200 (Favorable)', status: 'positive' },
      { label: 'Unfavorable Variance', value: '+$32,400 (14 POs)', status: 'warning' },
      { label: 'Favorable Discounts', value: '-$80,600 (28 POs)', status: 'positive' },
      { label: 'PPV Rate', value: '-1.42% Net', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Raw Copper & Alloys', value: '+$24,500 Unfavorable', variance: '+8.4% vs Standard', detail: 'Global commodity price inflation' },
      { category: 'Fasteners & Hardware', value: '-$46,200 Favorable', variance: '-11.2% vs Standard', detail: 'Tier-1 contract renegotiation' },
      { category: 'Polymers & Plastics', value: '-$26,500 Favorable', variance: '-6.5% vs Standard', detail: 'Bulk freight consolidation' }
    ],
    recommendedSapActions: [
      { actionName: 'Purchasing Value Analysis', tcode: 'ME80FN', description: 'Analyze purchase order price trends and conditions across periods' },
      { actionName: 'Update Info Record Price', tcode: 'ME12', description: 'Update current condition scales and validity periods in Info Records' }
    ]
  },
  {
    questionId: 'Q29',
    questionText: 'Which POs are waiting for Goods Receipt?',
    category: 'Purchasing',
    sapSourceTables: ['EKKO', 'EKPO', 'EKET', 'EKBE'],
    summaryAnswer: '24 Purchase Orders with 48 line items are currently open and waiting for Goods Receipt (MIGO Movement 101) where vendor delivery has been confirmed or scheduled within the next 5 business days. Total open GR value is $1,620,000.',
    keyInsights: [
      '14 POs are expected to arrive at Dallas Receiving Dock today (Dock doors 3-6 staged).',
      'Advanced Shipping Notifications (ASNs / Inbound Deliveries) have been received for 18 of the 24 POs.',
      'Warehouse putaway bins are pre-allocated in SAP EWM.'
    ],
    mmMetrics: [
      { label: 'POs Awaiting GR', value: '24 Orders (48 Lines)', status: 'neutral' },
      { label: 'Expected GR Value', value: '$1,620,000', status: 'positive' },
      { label: 'Arriving Today', value: '14 POs ($940k)', status: 'positive' },
      { label: 'ASNs Received', value: '18 of 24 (75%)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Plant 1000 Receiving Dock', value: '14 POs ($940,000)', variance: 'Arriving Today', detail: 'Raw materials & Machined parts' },
      { category: 'Plant 2000 Receiving Dock', value: '6 POs ($450,000)', variance: 'Arriving in 48h', detail: 'Electronics & Sub-assemblies' },
      { category: 'Plant 3000 Distribution Dock', value: '4 POs ($230,000)', variance: 'Arriving in 3-5d', detail: 'Packaging & Labels' }
    ],
    recommendedSapActions: [
      { actionName: 'Post Goods Receipt', tcode: 'MIGO', description: 'Execute Movement 101 GR against PO with reference to ASN' },
      { actionName: 'Inbound Delivery Monitor', tcode: 'VL06I', description: 'Monitor pending inbound delivery confirmations and shipping notifications' }
    ]
  },
  {
    questionId: 'Q30',
    questionText: 'Show procurement spend by supplier.',
    category: 'Purchasing',
    sapSourceTables: ['EKKO', 'EKPO', 'LFA1', 'LFM1'],
    summaryAnswer: 'Total Year-to-Date procurement spend across all plants is $42,650,000 across 218 active vendors. The top 5 strategic suppliers account for 58.4% ($24.9M) of total spend.',
    keyInsights: [
      'Top supplier: Bosch Rexroth ($8.4M - 19.7% of total spend) for hydraulic and drive systems.',
      'Second: Continental AG ($5.2M - 12.2% of total spend) for powertrain and sensor components.',
      'Tier-1 supplier concentration is within risk policy guidelines (<25% single vendor limit).'
    ],
    mmMetrics: [
      { label: 'Total YTD Spend', value: '$42,650,000', status: 'positive' },
      { label: 'Active Suppliers', value: '218 Vendors', status: 'positive' },
      { label: 'Top 5 Concentration', value: '58.4% ($24.9M)', status: 'positive' },
      { label: 'Contract Compliance', value: '94.2%', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Bosch Rexroth (Vendor 100012)', value: '$8,400,000', variance: '19.7% Share', detail: 'Hydraulics & Linear Motion' },
      { category: '2. Continental AG (Vendor 100062)', value: '$5,200,000', variance: '12.2% Share', detail: 'Powertrain & Sensors' },
      { category: '3. Siemens AG (Vendor 100034)', value: '$4,500,000', variance: '10.5% Share', detail: 'PLCs & Automation' },
      { category: '4. Parker Hannifin (Vendor 100045)', value: '$3,800,000', variance: '8.9% Share', detail: 'Fluid connectors & Seals' },
      { category: '5. SKF Bearings (Vendor 100078)', value: '$3,000,000', variance: '7.0% Share', detail: 'Precision Bearings' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Spend Analytics', tcode: 'ME80FN', description: 'Run comprehensive supplier spend and purchasing reporting' },
      { actionName: 'Contract Management', tcode: 'ME33K', description: 'Review outline agreements and volume discount tier utilization' }
    ]
  },

  // ============================================================================
  // PILLAR 4: Goods Movement (Q31 - Q40)
  // ============================================================================
  {
    questionId: 'Q31',
    questionText: "Show today's Goods Receipts.",
    category: 'Goods Movement',
    sapSourceTables: ['MATDOC', 'MSEG', 'MKPF', 'EKPO'],
    summaryAnswer: "Today, 38 Goods Receipt material documents (Movement 101 from PO and Movement 131 from Production) were posted across all plants, totaling 18,450 units valued at $1,140,200.",
    keyInsights: [
      '26 Receipts were external vendor PO deliveries (Movement 101) in Plant 1000 and 2000.',
      '12 Receipts were internal finished goods from manufacturing lines (Movement 131).',
      'Average receiving dock processing time: 24 minutes per inbound shipment.'
    ],
    mmMetrics: [
      { label: "Today's Receipts", value: '38 Material Docs', status: 'positive' },
      { label: 'Total Value Received', value: '$1,140,200', status: 'positive' },
      { label: 'Received Quantity', value: '18,450 Units', status: 'positive' },
      { label: 'Avg Dock Processing', value: '24 Min / Truck', status: 'positive' }
    ],
    breakdownData: [
      { category: 'External Vendor Receipts (Mvt 101)', value: '26 Docs ($840k)', variance: '12,800 Units', detail: 'Dallas & Austin Receiving' },
      { category: 'Production Order Receipts (Mvt 131)', value: '12 Docs ($300k)', variance: '5,650 Units', detail: 'Assembly Lines 1-3' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Document List', tcode: 'MB51', description: 'Display all material documents posted today with Movement 101/131' },
      { actionName: 'Display Material Document', tcode: 'MIGO', description: 'View accounting and financial document flow for specific receipt' }
    ]
  },
  {
    questionId: 'Q32',
    questionText: "Show today's Goods Issues.",
    category: 'Goods Movement',
    sapSourceTables: ['MATDOC', 'MSEG', 'MKPF', 'AFKO'],
    summaryAnswer: "Today, 54 Goods Issue material documents were posted: 42 to Production Orders (Movement 261), 8 to Cost Centers (Movement 201), and 4 outbound Customer Deliveries (Movement 601), totaling $892,400 in material consumption.",
    keyInsights: [
      'Production consumption (Mvt 261) totaled $740,000 supporting 14 active production orders.',
      'Zero backflush errors occurred during automated production order milestone confirmations.',
      'Cost center issues were within daily maintenance budget limits.'
    ],
    mmMetrics: [
      { label: "Today's Goods Issues", value: '54 Material Docs', status: 'positive' },
      { label: 'Total Value Issued', value: '$892,400', status: 'positive' },
      { label: 'Production Issues (261)', value: '42 Docs ($740k)', status: 'positive' },
      { label: 'Backflush Errors', value: '0 Discrepancies', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Production Orders (Mvt 261)', value: '42 Docs ($740,000)', variance: '14,200 Units', detail: 'Component staging & consumption' },
      { category: 'Cost Centers (Mvt 201)', value: '8 Docs ($42,400)', variance: '320 Units', detail: 'Maintenance & Facility supplies' },
      { category: 'Outbound Delivery (Mvt 601)', value: '4 Docs ($110,000)', variance: '1,400 Units', detail: 'Customer sales shipments' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Document Audit', tcode: 'MB51', description: 'Query goods issues by movement type 261, 201, and 601' },
      { actionName: 'Production Order Consumption', tcode: 'CO03', description: 'Review actual component issue quantities against planned reservations' }
    ]
  },
  {
    questionId: 'Q33',
    questionText: 'Which Goods Receipts failed?',
    category: 'Goods Movement',
    sapSourceTables: ['IDOC', 'EDIDC', 'EDID4', 'MIGO_ERRORS'],
    summaryAnswer: '3 Goods Receipt postings failed today during automated EDI 856 / ASN processing: 1) PO 45000199 (Missing Quality Certificate / Certificate of Analysis), 2) PO 45000204 (Quantity exceeds Over-Delivery Tolerance by 15%), 3) PO 45000211 (Plant 1000 storage location 0001 locked for cycle count).',
    keyInsights: [
      'PO 45000199: 500 KG chemical solvent held at quarantine dock pending supplier CoA upload.',
      'PO 45000204: Vendor shipped 1,150 EA against 1,000 EA PO (Tolerance limit 10%). Buyer approval required.',
      'PO 45000211: Cycle count unlocked; ready for automatic reprocessing via IDoc.'
    ],
    mmMetrics: [
      { label: 'Failed Receipts', value: '3 Postings', status: 'negative' },
      { label: 'Missing CoA Certificate', value: '1 Shipment ($48k)', status: 'negative' },
      { label: 'Over-Delivery Tolerance', value: '1 Shipment ($32k)', status: 'warning' },
      { label: 'Reprocessable Now', value: '1 Shipment ($18k)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'PO 45000199 (BASF Chemical)', value: '$48,000', variance: 'Missing CoA (M8 290)', detail: 'Quarantine dock holding' },
      { category: 'PO 45000204 (SKF Bearings)', value: '$32,500', variance: 'Over-delivery +15%', detail: 'Requires ME22N tolerance change' },
      { category: 'PO 45000211 (Parker)', value: '$18,200', variance: 'Storage Loc Locked', detail: 'Ready for re-post in MIGO' }
    ],
    recommendedSapActions: [
      { actionName: 'Reprocess IDoc / Receipt', tcode: 'BD87', description: 'Reprocess failed inbound ASN IDoc message' },
      { actionName: 'Manual GR Resolution', tcode: 'MIGO', description: 'Perform manual Goods Receipt with tolerance override in MIGO' }
    ]
  },
  {
    questionId: 'Q34',
    questionText: 'Show blocked stock.',
    category: 'Goods Movement',
    sapSourceTables: ['MARD', 'MARC', 'MBEW', 'QALS'],
    summaryAnswer: 'Total blocked inventory (MARD-SPEME) across all plants is $460,000 comprising 18 material batches: 11 batches in Plant 1000 ($310k), 5 batches in Plant 2000 ($115k), and 2 batches in Plant 3000 ($35k).',
    keyInsights: [
      'Top blocked item: Batch B-9912 of MAT-1001 ($142k) blocked due to customer cosmetic paint spec deviation.',
      'Engineering disposition pending: 12 batches ($280k) can be reworked; 6 batches ($180k) slated for scrap.',
      'Blocked stock has been segregated in designated storage locations (Loc 0099).'
    ],
    mmMetrics: [
      { label: 'Total Blocked Stock', value: '$460,000', status: 'warning' },
      { label: 'Blocked Batches', value: '18 Batches', status: 'warning' },
      { label: 'Rework Potential', value: '12 Batches ($280k)', status: 'positive' },
      { label: 'Scrap Disposition', value: '6 Batches ($180k)', status: 'negative' }
    ],
    breakdownData: [
      { category: 'MAT-1001 Batch B-9912 (Valves)', value: '$142,000 (290 EA)', variance: 'Paint specification', detail: 'Plant 1000 / Loc 0099' },
      { category: 'MAT-2040 Batch B-8811 (Hoses)', value: '$84,000 (1,200 M)', variance: 'Tensile test fail', detail: 'Plant 2000 / Loc 0099' },
      { category: 'MAT-3310 Batch B-7744 (Sensors)', value: '$54,000 (450 EA)', variance: 'Firmware glitch', detail: 'Rework order created' }
    ],
    recommendedSapActions: [
      { actionName: 'Transfer to Unrestricted', tcode: 'MIGO', description: 'Post movement 343 (Transfer Blocked to Unrestricted stock)' },
      { actionName: 'Batch Status Management', tcode: 'MSC2N', description: 'Update batch status from Restricted to Unrestricted' }
    ]
  },
  {
    questionId: 'Q35',
    questionText: 'Which materials are in Quality Inspection stock?',
    category: 'Goods Movement',
    sapSourceTables: ['MARD', 'QALS', 'QAMV', 'MBEW'],
    summaryAnswer: 'Currently 14 inspection lots holding 8,420 units valued at $940,000 are in Quality Inspection stock (MARD-INSME) awaiting Usage Decision (QA11 / QA32).',
    keyInsights: [
      'Average inspection lot turnaround time: 1.4 days (target: <2.0 days).',
      '8 inspection lots have completed characteristic testing and are 100% compliant, ready for immediate stock release to unrestricted (Movement 321).',
      '2 lots are pending specialized lab microbiological assays.'
    ],
    mmMetrics: [
      { label: 'Quality Stock Value', value: '$940,000', status: 'neutral' },
      { label: 'Open Inspection Lots', value: '14 Lots (8,420 Units)', status: 'neutral' },
      { label: 'Ready for Release', value: '8 Lots ($620k)', status: 'positive' },
      { label: 'Avg QI Turnaround', value: '1.4 Days', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Lot 100004921 (MAT-1001 Valves)', value: '$218,000 (450 EA)', variance: 'Testing Passed', detail: 'Ready for Usage Decision A' },
      { category: 'Lot 100004924 (MAT-2044 Bearings)', value: '$180,000 (1,000 EA)', variance: 'Testing Passed', detail: 'Ready for Usage Decision A' },
      { category: 'Lot 100004928 (MAT-8810 Solvents)', value: '$94,000 (2,000 L)', variance: 'Lab Assay Pending', detail: 'Assay results ETA 24h' }
    ],
    recommendedSapActions: [
      { actionName: 'Record Usage Decision', tcode: 'QA11', description: 'Record UD and post stock transfer to Unrestricted (Movement 321)' },
      { actionName: 'Inspection Lot Worklist', tcode: 'QA32', description: 'Display and process open QM inspection lots' }
    ]
  },
  {
    questionId: 'Q36',
    questionText: 'Show stock transfer orders.',
    category: 'Goods Movement',
    sapSourceTables: ['EKKO', 'EKPO', 'EKET', 'MSEG', 'MARC'],
    summaryAnswer: '16 active Stock Transport Orders (STOs - Document Type UB) are in progress between enterprise plants, representing 24,500 units valued at $1,480,000. 9 STOs are in transit on highway carriers, 5 are picking at issuing plants, and 2 are awaiting dispatch.',
    keyInsights: [
      'Main corridor: Plant 1000 (Dallas) -> Plant 2000 (Austin) sub-assembly components ($920k).',
      'All 9 in-transit shipments have GPS telematics tracking enabled with zero temperature or shock excursions.',
      'Replenishment STOs fulfill 100% of Plant 2000 weekly manufacturing schedules.'
    ],
    mmMetrics: [
      { label: 'Active STOs', value: '16 Orders', status: 'positive' },
      { label: 'Transfer Value', value: '$1,480,000', status: 'positive' },
      { label: 'In-Transit on Highway', value: '9 STOs ($920k)', status: 'positive' },
      { label: 'Picking / Staging', value: '5 STOs ($420k)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Dallas (1000) -> Austin (2000)', value: '8 STOs ($920,000)', variance: 'In-Transit', detail: 'Sub-assembly component feeder' },
      { category: 'Dallas (1000) -> Chicago (3000)', value: '5 STOs ($380,000)', variance: 'In-Transit', detail: 'Finished goods DC rebalance' },
      { category: 'Austin (2000) -> Atlanta (4000)', value: '3 STOs ($180,000)', variance: 'Staging', detail: 'Aftermarket spares' }
    ],
    recommendedSapActions: [
      { actionName: 'In-Transit Stock Overview', tcode: 'MB5T', description: 'Display stock in transit between plants with STO document references' },
      { actionName: 'Post STO Goods Receipt', tcode: 'MIGO', description: 'Post Movement 101/351 Goods Receipt against inbound STO' }
    ]
  },
  {
    questionId: 'Q37',
    questionText: 'Which transfer orders are delayed?',
    category: 'Goods Movement',
    sapSourceTables: ['EKKO', 'EKET', 'VTTK', 'MSEG'],
    summaryAnswer: '2 Stock Transport Orders are currently delayed past their scheduled arrival window: 1) STO 45000172 (Dallas to Chicago - delayed 18 hours due to Midwest winter storm), 2) STO 45000175 (Austin to Dallas - delayed 6 hours due to carrier truck mechanical maintenance).',
    keyInsights: [
      'STO 45000172 carries 800 EA finished valves ($388,000); Chicago DC buffer stock absorbs delay with zero customer impact.',
      'Carrier C-104 has dispatched replacement tractor for STO 45000175 with ETA 19:30 tonight.',
      'Both shipments are within geofenced rerouting corridors.'
    ],
    mmMetrics: [
      { label: 'Delayed STOs', value: '2 Shipments', status: 'warning' },
      { label: 'Delayed Value', value: '$482,000', status: 'warning' },
      { label: 'Max Delay Time', value: '18 Hours (Weather)', status: 'warning' },
      { label: 'Customer Impact', value: 'Zero (Buffer Absorbed)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'STO 45000172 (Dallas -> Chicago)', value: '$388,000', variance: '18h Weather Delay', detail: 'Carrier: Schneider National' },
      { category: 'STO 45000175 (Austin -> Dallas)', value: '$94,000', variance: '6h Mechanical Delay', detail: 'Carrier: Werner Enterprises' }
    ],
    recommendedSapActions: [
      { actionName: 'Track STO Transit', tcode: 'MB5T', description: 'Monitor live transit milestone status and update expected delivery date' },
      { actionName: 'Carrier Telematics Audit', tcode: '/SCMTMS/TOR', description: 'Inspect freight order telemetry and GPS live tracking in TM' }
    ]
  },
  {
    questionId: 'Q38',
    questionText: 'Show material movements today.',
    category: 'Goods Movement',
    sapSourceTables: ['MATDOC', 'MSEG', 'MKPF', 'T156'],
    summaryAnswer: "Today, 118 material movement transactions were posted across all enterprise plants, comprising 52,400 physical units with a cumulative turnover value of $2,420,000 across 8 movement types.",
    keyInsights: [
      'Movement 101 (GR from PO): 26 postings ($840k).',
      'Movement 261 (GI to Production): 42 postings ($740k).',
      'Movement 311 (Transfer Storage Loc to Storage Loc): 28 postings ($480k).',
      'Movement 131 (GR from Production): 12 postings ($300k).',
      'Movement 601 (GI for Outbound Delivery): 10 postings ($60k).'
    ],
    mmMetrics: [
      { label: "Today's Total Postings", value: '118 Documents', status: 'positive' },
      { label: 'Cumulative Turnover', value: '$2,420,000', status: 'positive' },
      { label: 'Units Moved', value: '52,400 Units', status: 'positive' },
      { label: 'Active Movement Types', value: '8 Types', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Mvt 101 (GR from Vendor PO)', value: '26 Docs ($840,000)', variance: '34.7% Share', detail: 'Inbound raw materials' },
      { category: 'Mvt 261 (GI to Production Order)', value: '42 Docs ($740,000)', variance: '30.6% Share', detail: 'Shop floor component issue' },
      { category: 'Mvt 311 (SLoc to SLoc Transfer)', value: '28 Docs ($480,000)', variance: '19.8% Share', detail: 'Warehouse replenishment staging' },
      { category: 'Mvt 131 / 601 (Receipts & Sales)', value: '22 Docs ($360,000)', variance: '14.9% Share', detail: 'Finished goods & Sales issues' }
    ],
    recommendedSapActions: [
      { actionName: 'Material Document Journal', tcode: 'MB51', description: 'Run comprehensive daily material document report by movement type' },
      { actionName: 'Material Ledger Document Flow', tcode: 'CKM3N', description: 'Verify financial and cost accounting postings for today movements' }
    ]
  },
  {
    questionId: 'Q39',
    questionText: 'Show return deliveries.',
    category: 'Goods Movement',
    sapSourceTables: ['MATDOC', 'MSEG', 'EKPO', 'LFA1'],
    summaryAnswer: '4 Return Deliveries to vendors (Movement 122 / 161) were processed in the last 7 days, totaling $82,400 in credited material value.',
    keyInsights: [
      'Top return: 200 EA Aluminum Flanges ($38,000) returned to Vendor 100092 due to out-of-spec threading.',
      'All 4 returns have return purchase orders (NB with Return Item checkbox) created and credit memos pending in MIRO.',
      'Debit memos generated automatically in Accounts Payable subledger.'
    ],
    mmMetrics: [
      { label: 'Return Deliveries (7d)', value: '4 Shipments', status: 'warning' },
      { label: 'Total Value Credited', value: '$82,400', status: 'positive' },
      { label: 'Quality Non-Conformance', value: '3 Returns ($68k)', status: 'warning' },
      { label: 'Over-Shipment Return', value: '1 Return ($14.4k)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Vendor 100092 (Alloy Tech)', value: '$38,000 (200 EA)', variance: 'Thread dimension defect', detail: 'Return PO 45000195 / Mvt 122' },
      { category: 'Vendor 100045 (Parker)', value: '$22,400 (50 EA)', variance: 'Seal leakage in QA', detail: 'Return PO 45000197 / Mvt 122' },
      { category: 'Vendor 100088 (Schneider)', value: '$14,400 (30 EA)', variance: 'Over-shipment surplus', detail: 'Return PO 45000202 / Mvt 161' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Return PO', tcode: 'ME23N', description: 'Review return item conditions and shipping notification' },
      { actionName: 'Invoice Verification Credit', tcode: 'MIRO', description: 'Post vendor credit memo against return delivery document' }
    ]
  },
  {
    questionId: 'Q40',
    questionText: 'Which material documents have posting errors?',
    category: 'Goods Movement',
    sapSourceTables: ['MATDOC', 'AFFW', 'COGI', 'SM58'],
    summaryAnswer: 'COGI / AFFW transaction log audit detected 5 backflush / automatic goods movement posting errors across Production Lines 1 and 2, totaling $28,400 in unposted component consumption.',
    keyInsights: [
      '3 errors caused by temporary storage location stock deficit (Error M7 021 Deficit of SL Unrestricted).',
      '2 errors caused by missing batch number assignment on batch-managed components.',
      'Stock replenishment has arrived; records are ready for automated collective reprocessing via COGI.'
    ],
    mmMetrics: [
      { label: 'COGI Posting Errors', value: '5 Records', status: 'negative' },
      { label: 'Unposted Value', value: '$28,400', status: 'warning' },
      { label: 'Deficit Errors (M7 021)', value: '3 Records', status: 'negative' },
      { label: 'Missing Batch Errors', value: '2 Records', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Order 1004882 (Line 1 Assembly)', value: '$14,200', variance: 'Deficit of MAT-1088', detail: 'Stock received; ready to clear' },
      { category: 'Order 1004885 (Line 1 Assembly)', value: '$8,400', variance: 'Deficit of MAT-2204', detail: 'Stock received; ready to clear' },
      { category: 'Order 1004890 (Line 2 Packaging)', value: '$5,800', variance: 'Missing Batch on MAT-8812', detail: 'Batch B-109 assigned' }
    ],
    recommendedSapActions: [
      { actionName: 'Reprocess COGI Errors', tcode: 'COGI', description: 'Execute collective posting of failed automatic goods movements' },
      { actionName: 'Background COGI Job', tcode: 'CORUAFW', description: 'Schedule CORUAFW background batch job for continuous error clearing' }
    ]
  },

  // ============================================================================
  // PILLAR 5: Vendors & Procurement Analytics (Q41 - Q50)
  // ============================================================================
  {
    questionId: 'Q41',
    questionText: 'Show supplier performance.',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['LFA1', 'ELKE', 'ELOR', 'ME61', 'ME65'],
    summaryAnswer: 'Enterprise Vendor Evaluation (ME65) scored 218 active suppliers across 4 core criteria: Quality (40% weight), On-Time Delivery (35% weight), Price Competitiveness (15% weight), and Service / Commercial Support (10% weight). Enterprise average score is 89.2 / 100.',
    keyInsights: [
      '142 suppliers (65%) achieved Grade A (Score >90) qualifying for Preferred Partner status.',
      '64 suppliers (29%) achieved Grade B (Score 75-89) in good standing.',
      '12 suppliers (6%) are in Grade C (Score <75) on Performance Improvement Plans.'
    ],
    mmMetrics: [
      { label: 'Enterprise Avg Score', value: '89.2 / 100', status: 'positive' },
      { label: 'Grade A Suppliers', value: '142 Vendors (65%)', status: 'positive' },
      { label: 'Grade B Suppliers', value: '64 Vendors (29%)', status: 'positive' },
      { label: 'Grade C (Under Review)', value: '12 Vendors (6%)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Quality Score Average', value: '94.6 / 100', variance: '+1.2% vs Q2', detail: 'Rejection rate: 0.38%' },
      { category: 'On-Time Delivery Score', value: '88.4 / 100', variance: '-0.8% vs Q2', detail: 'Avg latency: 1.4 days' },
      { category: 'Price Competitiveness', value: '86.1 / 100', variance: '+2.1% vs Q2', detail: 'Contract price adherence' },
      { category: 'Service & Commercial', value: '92.0 / 100', variance: '+0.5% vs Q2', detail: 'ASN & Invoice accuracy' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Evaluation Sheet', tcode: 'ME65', description: 'Display comparative supplier ranking by purchasing organization' },
      { actionName: 'Maintain Scores', tcode: 'ME61', description: 'Update manual evaluation criteria for strategic tier-1 suppliers' }
    ]
  },
  {
    questionId: 'Q42',
    questionText: 'Which vendors have the highest delivery delays?',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['LFA1', 'EKKO', 'EKET', 'ME65'],
    summaryAnswer: 'The 4 suppliers with the highest delivery delays over the last 90 days are: 1) Parker Hannifin (avg 5.2 days late, 78% OTD), 2) Schneider Electric (4.1 days late, 81% OTD), 3) Continental AG (3.8 days late, 82% OTD), 4) Festo AG (3.2 days late, 84% OTD).',
    keyInsights: [
      'Cumulative delay impact: 48 delivery delay days across 22 affected Purchase Orders.',
      'Primary causes: Raw material shortages at vendor sub-tiers and European port congestions.',
      'Mitigation: Safety stock lead time buffers in MARC updated by +4 days for these vendors.'
    ],
    mmMetrics: [
      { label: 'Highest Delay Vendor', value: 'Parker Hannifin (5.2d)', status: 'negative' },
      { label: 'Affected Orders', value: '22 Purchase Orders', status: 'warning' },
      { label: 'Cumulative Delay Days', value: '48 Total Days', status: 'negative' },
      { label: 'Buffer Compensation', value: '+4 Days Added to MARC', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Parker Hannifin (100045)', value: '5.2 Days Avg Latency', variance: '8 POs Delayed', detail: 'Hydraulic valves & fittings' },
      { category: 'Schneider Electric (100088)', value: '4.1 Days Avg Latency', variance: '6 POs Delayed', detail: 'Switchgear & Breakers' },
      { category: 'Continental AG (100062)', value: '3.8 Days Avg Latency', variance: '5 POs Delayed', detail: 'Sensors & Wiring' },
      { category: 'Festo AG (100094)', value: '3.2 Days Avg Latency', variance: '3 POs Delayed', detail: 'Pneumatic actuators' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Delivery Audit', tcode: 'ME2L', description: 'Analyze delivery date variances grouped by vendor' },
      { actionName: 'Update Planned Delivery Time', tcode: 'ME12', description: 'Adjust Planned Delivery Time in Info Record to reflect actual latency' }
    ]
  },
  {
    questionId: 'Q43',
    questionText: 'Which vendors provide Material X?',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['EINA', 'EINE', 'LFA1', 'A017', 'KONP'],
    summaryAnswer: 'For Material MAT-1001 (Hydraulic Valve), 3 qualified suppliers are maintained in Purchasing Info Records: 1) Bosch Rexroth (Vendor 100012) - Primary Source ($485.00, 5-day lead time), 2) Eaton Corp (Vendor 100084) - Secondary Source ($492.00, 7-day lead time), 3) Parker Hannifin (Vendor 100045) - Tertiary ($488.00, 10-day lead time).',
    keyInsights: [
      'Bosch Rexroth holds active Source List (EORD) assignment with 70% Quota Arrangement (MEQ1).',
      'Eaton Corp is qualified as hot-backup with active contract 460000892.',
      'Total annual spend on MAT-1001: $1,420,000 across all 3 suppliers.'
    ],
    mmMetrics: [
      { label: 'Qualified Vendors', value: '3 Approved Suppliers', status: 'positive' },
      { label: 'Primary Supplier', value: 'Bosch ($485 / 5d)', status: 'positive' },
      { label: 'Secondary Supplier', value: 'Eaton ($492 / 7d)', status: 'positive' },
      { label: 'Source List Active', value: '100% Enforced', status: 'positive' }
    ],
    breakdownData: [
      { category: '1. Bosch Rexroth (100012)', value: '$485.00 / EA', variance: '5d Lead Time (70% Quota)', detail: 'Primary Outline Agreement 460000840' },
      { category: '2. Eaton Corp (100084)', value: '$492.00 / EA', variance: '7d Lead Time (30% Quota)', detail: 'Secondary Contract 460000892' },
      { category: '3. Parker Hannifin (100045)', value: '$488.00 / EA', variance: '10d Lead Time (Backup)', detail: 'Standard Info Record 53000912' }
    ],
    recommendedSapActions: [
      { actionName: 'Display Source List', tcode: 'ME03', description: 'Review valid vendor source list and MRP relevant procurement indicator' },
      { actionName: 'Info Records for Material', tcode: 'ME1M', description: 'Display all purchasing info records and price history for MAT-1001' }
    ]
  },
  {
    questionId: 'Q44',
    questionText: 'Compare supplier prices.',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['EINA', 'EINE', 'A017', 'KONP', 'ME49'],
    summaryAnswer: 'Price comparison across the top 10 procured commodities shows significant arbitrage opportunities: Eaton Corp is 3.2% cheaper on electrical actuators, while Bosch Rexroth provides a 4.5% price advantage on hydraulic pumps when order volume exceeds 500 units.',
    keyInsights: [
      'Consolidating actuator procurement with Eaton Corp would generate $48,000 annual cost savings.',
      'Bosch tiered pricing scales unlock an extra 3% discount on orders >1,000 EA.',
      'Total annual price optimization potential: $112,000.'
    ],
    mmMetrics: [
      { label: 'Price Arbitrage Opp', value: '$112,000/yr', status: 'positive' },
      { label: 'Actuator Cost Advantage', value: '3.2% (Eaton)', status: 'positive' },
      { label: 'Hydraulics Advantage', value: '4.5% (Bosch)', status: 'positive' },
      { label: 'Tier Scale Unlocked', value: '3.0% at >1k Units', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Electric Actuators (MAT-3040)', value: '$312 vs $322 vs $335', variance: 'Eaton 3.2% Cheaper', detail: 'Annual volume: 1,500 EA ($15k saving)' },
      { category: 'Hydraulic Pumps (MAT-1102)', value: '$840 vs $878 vs $890', variance: 'Bosch 4.5% Cheaper', detail: 'Annual volume: 800 EA ($30.4k saving)' },
      { category: 'Linear Bearings (MAT-2290)', value: '$42 vs $45 vs $48', variance: 'SKF 6.7% Cheaper', detail: 'Annual volume: 5,000 EA ($15k saving)' }
    ],
    recommendedSapActions: [
      { actionName: 'Price Comparison List', tcode: 'ME49', description: 'Execute quotation and purchasing condition price comparison' },
      { actionName: 'Maintain Condition Scales', tcode: 'ME12', description: 'Update tiered volume discount scales in Info Records' }
    ]
  },
  {
    questionId: 'Q45',
    questionText: 'Show supplier quality ratings.',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['QALS', 'QAVE', 'QAMV', 'LFA1', 'ME65'],
    summaryAnswer: 'Enterprise Supplier Quality Rating (SQR) across 218 vendors is 97.4% acceptance rate. Total incoming lots inspected YTD: 4,820 lots. 4,695 lots accepted with zero defects (97.4%), 125 lots flagged with quality notifications (2.6%).',
    keyInsights: [
      'Top Quality Performer: Bosch Rexroth with 99.8% first-pass acceptance across 412 lots.',
      'Worst Quality Performer: Alloy Tech (Vendor 100092) with 91.2% acceptance (8 quality notifications).',
      'Defect cost recovery: $68,400 in scrap/rework costs debited back to suppliers YTD.'
    ],
    mmMetrics: [
      { label: 'Enterprise SQR Rate', value: '97.4% First-Pass', status: 'positive' },
      { label: 'Lots Inspected YTD', value: '4,820 Lots', status: 'positive' },
      { label: 'Top Quality Vendor', value: 'Bosch (99.8%)', status: 'positive' },
      { label: 'Quality Cost Recovered', value: '$68,400 Debited', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Bosch Rexroth (100012)', value: '99.8% SQR (412 Lots)', variance: '1 Minor Defect', detail: 'Certified Quality Partner' },
      { category: 'SKF Bearings (100078)', value: '99.2% SQR (320 Lots)', variance: '2 Minor Defects', detail: 'Certified Quality Partner' },
      { category: 'Alloy Tech (100092)', value: '91.2% SQR (85 Lots)', variance: '8 Major Defects', detail: 'Under Corrective Action Plan' }
    ],
    recommendedSapActions: [
      { actionName: 'Quality Notifications by Vendor', tcode: 'QM11', description: 'Display all open Q2 vendor quality notifications' },
      { actionName: 'Vendor Quality Audit', tcode: 'ME65', description: 'Inspect Quality sub-criterion scores in Vendor Evaluation' }
    ]
  },
  {
    questionId: 'Q46',
    questionText: 'Which suppliers should we avoid?',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['LFA1', 'LFB1', 'LFM1', 'ME65'],
    summaryAnswer: 'Identified 3 high-risk suppliers flagged for procurement freeze or quota elimination: 1) Alloy Tech (Vendor 100092 - Chronic QA failure, 91.2% SQR), 2) Apex Logistics (Vendor 100114 - Financial distress/credit watch), 3) Global Fasteners (Vendor 100128 - Contract breach on delivery lead times).',
    keyInsights: [
      'Alloy Tech has active Quality Notification Q2-8902 with $38k non-conformance impact.',
      'Purchasing block (LFM1-SPERM) is already placed on Global Fasteners.',
      'Secondary suppliers have been qualified for 100% of parts supplied by these 3 vendors.'
    ],
    mmMetrics: [
      { label: 'High-Risk Suppliers', value: '3 Vendors', status: 'negative' },
      { label: 'Purchasing Block Active', value: '1 Vendor (Global Fasteners)', status: 'negative' },
      { label: 'Quality Non-Conformance', value: '$38,000 (Alloy Tech)', status: 'negative' },
      { label: 'Alternate Supply Coverage', value: '100% Covered', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Alloy Tech (Vendor 100092)', value: 'Grade C (Score: 64)', variance: '8.8% Defect Rate', detail: 'Action: Shift 100% volume to Texas Alloy' },
      { category: 'Apex Logistics (Vendor 100114)', value: 'Grade C (Score: 68)', variance: 'Credit Watch Flag', detail: 'Action: Transition freight to Schneider' },
      { category: 'Global Fasteners (Vendor 100128)', value: 'Blocked (LFM1-SPERM)', variance: '14 Days Late Avg', detail: 'Action: Replace with Würth Industry' }
    ],
    recommendedSapActions: [
      { actionName: 'Vendor Purchasing Block', tcode: 'XK05', description: 'Place purchasing block on vendor for specific purchasing organization' },
      { actionName: 'Remove from Source List', tcode: 'ME01', description: 'Deactivate vendor from Material Source List (EORD)' }
    ]
  },
  {
    questionId: 'Q47',
    questionText: 'Show contract utilization.',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['EKKO', 'EKPO', 'LFA1', 'EINA'],
    summaryAnswer: 'Enterprise Outline Agreements (Quantity Contracts WK and Value Contracts MK) represent $28.5M in committed spend. Cumulative YTD contract utilization is 68.4% ($19.5M target value drawn down).',
    keyInsights: [
      '5 contracts are near target threshold (>85% utilized) and require renewal negotiations.',
      'Contract 460000840 (Bosch Rexroth) is at 92% utilization ($4.6M drawn against $5.0M limit).',
      'Non-contract maverick spend is strictly constrained at 5.8% enterprise-wide.'
    ],
    mmMetrics: [
      { label: 'Total Contract Value', value: '$28,500,000', status: 'positive' },
      { label: 'YTD Drawdown Value', value: '$19,500,000 (68%)', status: 'positive' },
      { label: 'Contracts Near Limit', value: '5 Contracts (>85%)', status: 'warning' },
      { label: 'Maverick Spend Rate', value: '5.8% (Compliant)', status: 'positive' }
    ],
    breakdownData: [
      { category: 'Contract 460000840 (Bosch Rexroth)', value: '$4.6M / $5.0M', variance: '92.0% Utilized', detail: 'Renewal required before Q4' },
      { category: 'Contract 460000855 (Continental AG)', value: '$3.4M / $4.0M', variance: '85.0% Utilized', detail: 'Renewal in progress' },
      { category: 'Contract 460000870 (Siemens AG)', value: '$2.8M / $3.5M', variance: '80.0% Utilized', detail: 'Healthy utilization' }
    ],
    recommendedSapActions: [
      { actionName: 'Contract Release Orders', tcode: 'ME3N', description: 'Display all outline agreements and release orders by vendor' },
      { actionName: 'Create Contract Amendment', tcode: 'ME32K', description: 'Increase target value and extend validity end date on contract 460000840' }
    ]
  },
  {
    questionId: 'Q48',
    questionText: 'Which suppliers have expiring contracts?',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['EKKO', 'EKPO', 'LFA1'],
    summaryAnswer: '8 Outline Agreements valued at $6,200,000 expire within the next 60 days. 3 of these represent critical production commodity categories (Hydraulics, Bearings, and Fasteners).',
    keyInsights: [
      'Top expiring contract: 460000840 (Bosch Rexroth - $5.0M) expiring in 38 days.',
      'Early renegotiation can lock in an estimated 3.5% discount based on increased annual volume forecasts.',
      'All 8 contracts have automated RFP renewal workflows initiated in SAP Ariba.'
    ],
    mmMetrics: [
      { label: 'Expiring in 60 Days', value: '8 Contracts', status: 'warning' },
      { label: 'Committed Value', value: '$6,200,000', status: 'warning' },
      { label: 'Critical Category', value: '3 Contracts ($4.8M)', status: 'negative' },
      { label: 'Negotiation Window', value: '38 Days (Bosch)', status: 'warning' }
    ],
    breakdownData: [
      { category: 'Contract 460000840 (Bosch Rexroth)', value: '$5,000,000', variance: 'Expires in 38 Days', detail: 'Hydraulics - High Priority' },
      { category: 'Contract 460000862 (SKF Bearings)', value: '$800,000', variance: 'Expires in 45 Days', detail: 'Bearings - Medium Priority' },
      { category: 'Contract 460000880 (Würth Industry)', value: '$400,000', variance: 'Expires in 52 Days', detail: 'Hardware & Fasteners' }
    ],
    recommendedSapActions: [
      { actionName: 'Expiring Contracts List', tcode: 'ME3L', description: 'Filter outline agreements by validity end date' },
      { actionName: 'Contract Renewal', tcode: 'ME31K', description: 'Create new agreement or extend validity period with updated pricing' }
    ]
  },
  {
    questionId: 'Q49',
    questionText: "Predict next month's procurement demand.",
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['MDKP', 'MDTB', 'PLAF', 'RESB', 'AFKO'],
    summaryAnswer: "Next month's projected procurement demand is $5,840,000 across 340 material items, driven by confirmed master production schedule (MPS) builds and sales forecast revisions (PIRs in MD61).",
    keyInsights: [
      'Raw Materials (ROH): $3.8M (65.1%) - Driven by EV Battery assembly ramp-up.',
      'Semi-Finished (HALB): $1.4M (24.0%) - Subcontracting and specialized machining.',
      'Packaging & MRO: $640k (10.9%) - Packaging containers and plant consumables.',
      'Recommended: Issue advance rolling forecasts to Tier-1 suppliers to reserve vendor production capacity.'
    ],
    mmMetrics: [
      { label: 'Projected Demand', value: '$5,840,000', status: 'positive' },
      { label: 'Projected Materials', value: '340 SKUs', status: 'positive' },
      { label: 'Raw Material Share', value: '$3.8M (65%)', status: 'positive' },
      { label: 'Forecast Accuracy', value: '94.8%', status: 'positive' }
    ],
    breakdownData: [
      { category: 'EV Battery Components', value: '$1,850,000', variance: '+24% Ramp-up', detail: 'Suppliers: Bosch, LG Energy' },
      { category: 'Hydraulic Valves & Cylinders', value: '$1,240,000', variance: '+5% Seasonal', detail: 'Suppliers: Bosch, Eaton' },
      { category: 'Structural Steel & Castings', value: '$950,000', variance: 'Stable', detail: 'Suppliers: Nucor, CastTech' }
    ],
    recommendedSapActions: [
      { actionName: 'MRP Simulation Run', tcode: 'MD01N', description: 'Run MRP Live simulation with projected PIR demand' },
      { actionName: 'Transmit Supplier Forecast', tcode: 'ME38', description: 'Generate and transmit SA Release schedule lines (EDI 830)' }
    ]
  },
  {
    questionId: 'Q50',
    questionText: 'Which procurement issues require immediate attention?',
    category: 'Vendors & Procurement Analytics',
    sapSourceTables: ['EKKO', 'EKET', 'MARD', 'COGI', 'QALS'],
    summaryAnswer: 'AI Procurement Command Center highlights 4 critical issues requiring executive action today: 1) PO 45000188 ($218k) 9 days overdue, putting Assembly Line 2 at risk; 2) 5 material stockouts projected within 7 days; 3) 11 POs ($680k) blocked in approval SLA; 4) 3 failed Goods Receipts held at receiving docks.',
    keyInsights: [
      'Issue 1: Parker Hannifin expedite call scheduled for 10:00 AM for PO 45000188.',
      'Issue 2: Immediate STO creation from Plant 2000 resolves 2 of 5 imminent stockouts.',
      'Issue 3: Executive release delegation triggers instant sign-off on the 11 pending POs.',
      'Resolving these 4 issues protects $480,000 in scheduled manufacturing output.'
    ],
    mmMetrics: [
      { label: 'Critical Action Items', value: '4 Urgent Issues', status: 'negative' },
      { label: 'Production Output Protected', value: '$480,000', status: 'positive' },
      { label: 'Overdue PO Impact', value: '$218k (Line 2 Risk)', status: 'negative' },
      { label: 'Blocked Approvals', value: '11 POs ($680k)', status: 'warning' }
    ],
    breakdownData: [
      { category: '1. Overdue PO 45000188 (Parker)', value: '$218k / 9d Late', variance: 'Line 2 Risk', detail: 'Action: Expedite phone call & freight' },
      { category: '2. 5 Imminent Stockouts in 7 Days', value: '$480k Revenue Risk', variance: 'MAT-1044 Worst', detail: 'Action: Emergency STO from Plant 2000' },
      { category: '3. 11 Blocked Purchase Orders', value: '$680k Value', variance: '3 SLA Breaches', detail: 'Action: Execute ME28 collective release' },
      { category: '4. 3 Failed Goods Receipts', value: '$98.7k Value', variance: 'Dock Blocked', detail: 'Action: Reprocess via BD87 / MIGO' }
    ],
    recommendedSapActions: [
      { actionName: 'Procurement Command Center', tcode: 'ME2N', description: 'Launch unified purchasing exception and delayed order monitor' },
      { actionName: 'Collective PO Release', tcode: 'ME28', description: 'Release all 11 pending purchase orders in single transaction' }
    ]
  }
];
