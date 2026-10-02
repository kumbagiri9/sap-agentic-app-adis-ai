import { ProcessMiningData } from '../types';

export class ProcessMiningService {
  private static instance: ProcessMiningService;

  public static getInstance(): ProcessMiningService {
    if (!ProcessMiningService.instance) {
      ProcessMiningService.instance = new ProcessMiningService();
    }
    return ProcessMiningService.instance;
  }

  /**
   * Generates deep Signavio-style Process Mining analytics for a specific business channel or custom NL search.
   */
  public async getAnalysis(queryText: string): Promise<ProcessMiningData> {
    const q = queryText.toLowerCase();

    // Default to Order-To-Cash (O2C) unless others are mentioned
    let processName = 'Order-to-Cash (O2C)';
    let totalCases = 28400;
    let totalEvents = 142000;
    let conformanceScore = 82;
    let skippedSteps: string[] = ['Credit Check Approval', 'Delivery Block Release Verification'];
    let anomaliesDetected: string[] = [
      'Unplanned Invoice RefPricing loops detected in 14% of cases',
      'Delivery created prior to physical Sales Order confirmation',
      'Unauthorized price override applied during order replication from Salesforce'
    ];
    let connections: string[] = ['SAP S/4HANA Core ERP', 'Salesforce CRM', 'Databricks Event Lake', 'Snowflake DW'];

    // Define standard variants for different streams
    if (q.includes('procure') || q.includes('p2p') || q.includes('purchase')) {
      processName = 'Procure-to-Pay (P2P)';
      totalCases = 15300;
      totalEvents = 91800;
      conformanceScore = 89;
      skippedSteps = ['Three-Way Invoice Match', 'Goods Receipt Registration'];
      anomaliesDetected = [
        'Retroactive Purchase Order creation in 8% of vendor invoice bookings',
        'Duplicate invoice numbers accepted for manual override',
        'Unauthorized vendor master modifications bypassing standard approval workflows'
      ];
      connections = ['SAP S/4HANA Procurement Suite', 'SAP Ariba Network', 'Snowflake Datastore'];
    } else if (q.includes('record') || q.includes('r2r') || q.includes('finance') || q.includes('ledger')) {
      processName = 'Record-to-Report (R2R)';
      totalCases = 4200;
      totalEvents = 25200;
      conformanceScore = 91;
      skippedSteps = ['Secondary Period-End Review', 'Currency Valuation Check'];
      anomaliesDetected = [
        'Manual journal entries posted during active automated closing process',
        'Reconciliation differences outside standard threshold on Intercompany balances',
        'Unapproved ledger adjustment entries without complete compliance document links'
      ];
      connections = ['SAP S/4HANA Universal Journal (ACDOCA)', 'Databricks Cloud Sync'];
    } else if (q.includes('hire') || q.includes('employee') || q.includes('retire')) {
      processName = 'Hire-to-Retire (H2R)';
      totalCases = 1800;
      totalEvents = 10800;
      conformanceScore = 78;
      skippedSteps = ['SLA BG Check Completion', 'Hardware Assets Allocation Approval'];
      anomaliesDetected = [
        'User roles provisioned prior to verified background check clearance',
        'Manual intervention during payroll sync step in SAP SuccessFactors',
        'Overdue exit audit checks on retired contractor accounts'
      ];
      connections = ['SAP SuccessFactors Suite', 'Active Directory Sync Cluster'];
    } else if (q.includes('make') || q.includes('manufact') || q.includes('stock')) {
      processName = 'Make-to-Stock (MTS)';
      totalCases = 9200;
      totalEvents = 55200;
      conformanceScore = 85;
      skippedSteps = ['Material Quality Gate Check', 'Yield Settlement Verification'];
      anomaliesDetected = [
        'Planned Orders converted to Production Orders with incomplete raw materials allocations',
        'Scrap rate deviations on manufacturing line exceeding SPRO tolerances by 4.2%',
        'Unauthorized master recipe overrides in Plant DE-1010'
      ];
      connections = ['SAP S/4HANA Manufacturing Suite', 'ShopFloor IoT Datastream'];
    } else if (q.includes('transport') || q.includes('logistics') || q.includes('freight')) {
      processName = 'Transportation Logistics Execution';
      totalCases = 11400;
      totalEvents = 68400;
      conformanceScore = 83;
      skippedSteps = ['Freight Tender Response Validation', 'Carrier SLA Hold Audit'];
      anomaliesDetected = [
        'Freight Charge discrepancies exceeding standard carrier contracts on 9% of shipments',
        'Unscheduled standby delays at Central Depot exceeding 4 hours',
        'Outbound delivery loading confirmations completed post-carrier departure'
      ];
      connections = ['SAP TM Logistics Core', 'FedEx/DHL Webhook APIs', 'Snowflake Live Logistics Storage'];
    }

    // Nodes Construction
    let nodes: any[] = [];
    let edges: any[] = [];
    let bottlenecks: any[] = [];
    let historicalComparison: any[] = [];

    if (processName === 'Order-to-Cash (O2C)') {
      nodes = [
        { id: 'start', label: 'Order Triggered', type: 'start', percentageCount: 100 },
        { id: 'va01', label: 'Create Sales Order (VA01)', type: 'step', percentageCount: 100, avgTimeAfter: '0.8 hrs' },
        { id: 'v23', label: 'Unlock Credit Limit (V23)', type: 'bottleneck', percentageCount: 42, avgTimeAfter: '14.2 hrs' },
        { id: 'vl01n', label: 'Create Outbound Delivery (VL01N)', type: 'step', percentageCount: 100, avgTimeAfter: '1.2 hrs' },
        { id: 'lt03', label: 'Transfer Order Picking (LT03)', type: 'bottleneck', percentageCount: 94, avgTimeAfter: '8.4 hrs' },
        { id: 'vl02n', label: 'Post Goods Issue (VL02N)', type: 'step', percentageCount: 91, avgTimeAfter: '0.4 hrs' },
        { id: 'vf01', label: 'Create Invoice Billing (VF01)', type: 'step', percentageCount: 88, avgTimeAfter: '2.1 hrs' },
        { id: 'blocked_inv', label: 'Payment Block Cleared', type: 'exception', percentageCount: 15, avgTimeAfter: '18.5 hrs' },
        { id: 'f_02', label: 'Post Internal Payment (F-02)', type: 'step', percentageCount: 84, avgTimeAfter: '0.5 hrs' },
        { id: 'end', label: 'Process Complete', type: 'end', percentageCount: 84 }
      ];

      edges = [
        { fromId: 'start', toId: 'va01', volume: 28400, avgDurationHours: 0.1, type: 'standard' },
        { fromId: 'va01', toId: 'v23', volume: 11928, avgDurationHours: 14.2, type: 'issue' },
        { fromId: 'va01', toId: 'vl01n', volume: 16472, avgDurationHours: 0.8, type: 'standard' },
        { fromId: 'v23', toId: 'vl01n', volume: 11928, avgDurationHours: 1.1, type: 'standard' },
        { fromId: 'vl01n', toId: 'lt03', volume: 28400, avgDurationHours: 8.4, type: 'deviation' },
        { fromId: 'lt03', toId: 'vl02n', volume: 25844, avgDurationHours: 1.2, type: 'standard' },
        { fromId: 'vl02n', toId: 'vf01', volume: 25000, avgDurationHours: 2.1, type: 'standard' },
        { fromId: 'vf01', toId: 'blocked_inv', volume: 4260, avgDurationHours: 18.5, type: 'issue' },
        { fromId: 'vf01', toId: 'f_02', volume: 20740, avgDurationHours: 0.5, type: 'standard' },
        { fromId: 'blocked_inv', toId: 'f_02', volume: 4260, avgDurationHours: 0.4, type: 'standard' },
        { fromId: 'f_02', toId: 'end', volume: 23856, avgDurationHours: 0.1, type: 'standard' }
      ];

      bottlenecks = [
        {
          description: 'Credit Block Releases (V23 Blockage)',
          impact: 'Adds average +14.2 hours to Order Processing Lead times',
          severity: 'critical',
          typicalDelay: '14.2 Hours',
          casesAffected: 11928,
          recommendedMitigation: 'Refine SPRO automatic credit evaluation settings in UKM_CASE to automatically release sub-$5k low-risk corporate buyer profiles.'
        },
        {
          description: 'Warehouse Pick Time Delay (LT03 Transfer Order)',
          impact: 'Increases local shipping delays in TX-Warehouse',
          severity: 'warning',
          typicalDelay: '8.4 Hours',
          casesAffected: 26696,
          recommendedMitigation: 'Consolidate fast-moving stock materials using EWM Bin slot placement algorithms. Eliminate manual paper print bottlenecks.'
        },
        {
          description: 'Billing Payment Block Exception Rework Loop',
          impact: 'Triggers recurring invoice clearing rework and payment loops',
          severity: 'low',
          typicalDelay: '18.5 Hours',
          casesAffected: 4260,
          recommendedMitigation: 'Align SD billing schedules with central FI posting schemas in standard customer profile structures, removing manual block flags.'
        }
      ];

      historicalComparison = [
        { period: 'Q3 2025', cycleTimeHours: 49.2, throughputVolume: 22100 },
        { period: 'Q4 2025', cycleTimeHours: 41.5, throughputVolume: 25400 },
        { period: 'Q1 2026', cycleTimeHours: 35.8, throughputVolume: 28400 }
      ];

    } else if (processName === 'Procure-to-Pay (P2P)') {
      nodes = [
        { id: 'start', label: 'Purchase Requisition', type: 'start', percentageCount: 100 },
        { id: 'me21n', label: 'Create Purchase Order (ME21N)', type: 'step', percentageCount: 100, avgTimeAfter: '1.1 hrs' },
        { id: 'me28', label: 'Release Purchase Order (ME28)', type: 'bottleneck', percentageCount: 68, avgTimeAfter: '32.5 hrs' },
        { id: 'migo', label: 'Post Goods Receipt (MIGO)', type: 'step', percentageCount: 96, avgTimeAfter: '2.5 hrs' },
        { id: 'miro', label: 'Book Vendor Invoice (MIRO)', type: 'step', percentageCount: 94, avgTimeAfter: '18.2 hrs' },
        { id: 'f110', label: 'Automatic Payment Run (F110)', type: 'step', percentageCount: 89, avgTimeAfter: '0.6 hrs' },
        { id: 'end', label: 'Process Complete', type: 'end', percentageCount: 89 }
      ];

      edges = [
        { fromId: 'start', toId: 'me21n', volume: 15300, avgDurationHours: 0.1, type: 'standard' },
        { fromId: 'me21n', toId: 'me28', volume: 10404, avgDurationHours: 32.5, type: 'issue' },
        { fromId: 'me21n', toId: 'migo', volume: 4896, avgDurationHours: 0.9, type: 'standard' },
        { fromId: 'me28', toId: 'migo', volume: 10404, avgDurationHours: 1.8, type: 'standard' },
        { fromId: 'migo', toId: 'miro', volume: 15300, avgDurationHours: 18.2, type: 'deviation' },
        { fromId: 'miro', toId: 'f110', volume: 13617, avgDurationHours: 0.6, type: 'standard' },
        { fromId: 'f110', toId: 'end', volume: 13617, avgDurationHours: 0.1, type: 'standard' }
      ];

      bottlenecks = [
        {
          description: 'PO Release Holds (ME28 Release Strategy)',
          impact: 'Causes major supplier supply-lead bottlenecks by locking procurement items',
          severity: 'critical',
          typicalDelay: '32.5 Hours',
          casesAffected: 10404,
          recommendedMitigation: 'Implement digital Slack/Teams automatic authorization hooks with self-healing rules for regular pre-aligned supply inventory purchases.'
        },
        {
          description: 'Vendor Invoice Variances Rework (MIRO block)',
          impact: 'Price/quantity disagreements lock standard invoice bookings',
          severity: 'warning',
          typicalDelay: '18.2 Hours',
          casesAffected: 2450,
          recommendedMitigation: 'Enable automated Ariba Purchase Order pricing validations on submission, reducing human errors prior to core MIRO registration.'
        }
      ];

      historicalComparison = [
        { period: 'Q3 2025', cycleTimeHours: 62.4, throughputVolume: 12500 },
        { period: 'Q4 2025', cycleTimeHours: 58.1, throughputVolume: 14100 },
        { period: 'Q1 2026', cycleTimeHours: 54.8, throughputVolume: 15300 }
      ];
    } else {
      // General fallbacks (R2R, H2R, Transport, MTS etc)
      nodes = [
        { id: 'start', label: 'Process Instantiated', type: 'start', percentageCount: 100 },
        { id: 'step1', label: 'Record Transaction Data', type: 'step', percentageCount: 100, avgTimeAfter: '2.5 hrs' },
        { id: 'step2', label: 'Audit Verification Hold', type: 'bottleneck', percentageCount: 35, avgTimeAfter: '19.4 hrs' },
        { id: 'step3', label: 'Release & Final Settlement', type: 'step', percentageCount: 92, avgTimeAfter: '1.1 hrs' },
        { id: 'end', label: 'End Execution Stream', type: 'end', percentageCount: 92 }
      ];

      edges = [
        { fromId: 'start', toId: 'step1', volume: totalCases, avgDurationHours: 0.1, type: 'standard' },
        { fromId: 'step1', toId: 'step2', volume: Math.round(totalCases * 0.35), avgDurationHours: 19.4, type: 'issue' },
        { fromId: 'step1', toId: 'step3', volume: Math.round(totalCases * 0.65), avgDurationHours: 1.5, type: 'standard' },
        { fromId: 'step2', toId: 'step3', volume: Math.round(totalCases * 0.35), avgDurationHours: 1.1, type: 'standard' },
        { fromId: 'step3', toId: 'end', volume: Math.round(totalCases * 0.92), avgDurationHours: 0.1, type: 'standard' }
      ];

      bottlenecks = [
        {
          description: 'Manual Audit and Authorization Hold',
          impact: 'Increases administrative lead-time and cycle overhead',
          severity: 'warning',
          typicalDelay: '19.4 Hours',
          casesAffected: Math.round(totalCases * 0.35),
          recommendedMitigation: 'Standardize SPRO validation conditions to auto-authorize compliant lines based on trusted partner records.'
        }
      ];

      historicalComparison = [
        { period: 'Q3 2025', cycleTimeHours: 28.5, throughputVolume: Math.round(totalCases * 0.8) },
        { period: 'Q4 2025', cycleTimeHours: 24.1, throughputVolume: Math.round(totalCases * 0.9) },
        { period: 'Q1 2026', cycleTimeHours: 21.3, throughputVolume: totalCases }
      ];
    }

    const standardVariantSteps = nodes.filter(n => n.type === 'start' || n.type === 'step' || n.type === 'end').map(n => n.label);
    const deviationVariantSteps = nodes.filter(n => n.type !== 'exception').map(n => n.label);
    const complexVariantSteps = nodes.map(n => n.label);

    const variants = [
      {
        rank: 1,
        steps: standardVariantSteps,
        volume: Math.round(totalCases * 0.58),
        percentage: 58,
        avgDurationHours: 4.8,
        isStandard: true
      },
      {
        rank: 2,
        steps: deviationVariantSteps,
        volume: Math.round(totalCases * 0.28),
        percentage: 28,
        avgDurationHours: 16.5,
        isStandard: false
      },
      {
        rank: 3,
        steps: complexVariantSteps,
        volume: Math.round(totalCases * 0.14),
        percentage: 14,
        avgDurationHours: 34.2,
        isStandard: false
      }
    ];

    return {
      processName,
      totalCases,
      totalEvents,
      variants,
      nodes,
      edges,
      bottlenecks,
      conformanceScore,
      skippedSteps,
      anomaliesDetected,
      historicalComparison,
      connections
    };
  }
}
