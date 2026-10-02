
import { GuiScreenCard } from '../types';

// Standard Trial / Sandbox URL base
const TENANT_URL = 'https://ui.s4hana.ondemand.com/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html';

export const SCREEN_MAP: Record<string, any> = {
  'SALES_ORDER': {
    display: {
      title: 'Fiori: Manage Sales Orders',
      fioriIntent: 'SalesOrder-display',
      tCode: 'VA03',
      sapVersion: 'S/4HANA',
      module: 'SD',
      navigation: ['Logistics', 'Sales and Distribution', 'Sales', 'Order', 'Display'],
      fields: [
        { field: 'Order Type', type: 'String', description: 'Document type (e.g. OR)', mandatory: true },
        { field: 'Sales Org', type: 'ID', description: 'Organizational unit', mandatory: true }
      ],
      points: ['Verify "Overall Status"', 'Check "Net Value" Currency', 'Confirm "Partner Roles"']
    },
    create: {
      title: 'SAP GUI: Create Sales Order (VA01)',
      fioriIntent: 'SalesOrder-create',
      tCode: 'VA01',
      sapVersion: 'ECC / S/4HANA',
      module: 'SD',
      navigation: ['VA01 (TCode)', 'Enter Order Type', 'Enter Customer No'],
      fields: [
        { field: 'Sold-to Party', type: 'ID', description: 'Customer ID', mandatory: true },
        { field: 'Material', type: 'ID', description: 'Product number', mandatory: true }
      ],
      points: [
        'Confirm "Sold-to Party"', 
        'Verify Line Item Availability', 
        'Check Credit Limits',
        'Assign Delivery Block'
      ]
    }
  },
  'PURCHASE_ORDER': {
    display: {
      title: 'Fiori: Manage Purchase Orders',
      fioriIntent: 'PurchaseOrder-manage',
      tCode: 'ME23N',
      sapVersion: 'S/4HANA',
      module: 'MM',
      navigation: ['Logistics', 'Materials Management', 'Purchasing', 'Purchase Order', 'Display'],
      fields: [
        { field: 'PO Number', type: 'ID', description: 'Unique PO ID', mandatory: true }
      ],
      points: ['Check Approval Status', 'Verify Account Assignment', 'Confirm Delivery Dates']
    },
    create: {
      title: 'SAP GUI: Create Purchase Order (ME21N)',
      fioriIntent: 'PurchaseOrder-create',
      tCode: 'ME21N',
      sapVersion: 'S/4HANA',
      module: 'MM',
      navigation: ['ME21N (TCode)', 'Select Document Type', 'Enter Supplier / Vendor', 'Enter Header Data (Purch. Org, Purch. Group)', 'Fill Item Grid (Material, Qty, Plant)'],
      fields: [
        { field: 'Vendor / Supplier', type: 'ID', description: 'Creditor Account number', mandatory: true },
        { field: 'Purch. Org.', type: 'ID', description: 'Purchasing Organization', mandatory: true },
        { field: 'Purch. Group', type: 'Category', description: 'Purchasing Group ID', mandatory: true },
        { field: 'Material ID', type: 'ID', description: 'SAP Material Number', mandatory: false },
        { field: 'Quantity', type: 'Number', description: 'Order quantity', mandatory: true }
      ],
      points: [
        'Confirm Supplier details in header',
        'Verify Purchasing Group & Purchasing Org. values',
        'Enter Item details, checking Net Price and Net Value',
        'Run the "Check" document protocol for validation',
        'Perform Post/Save to generate the Purchase Order document ID'
      ]
    }
  },
  'BILLING': {
    display: {
      title: 'Fiori: Manage Billing Documents',
      fioriIntent: 'BillingDocument-display',
      tCode: 'VF03',
      sapVersion: 'S/4HANA',
      module: 'SD',
      navigation: ['Logistics', 'Sales and Distribution', 'Billing', 'Billing Document', 'Display'],
      points: ['Check "Accounting Status"', 'Verify "Tax Amount"', 'Check Output Log']
    }
  },
  'INVENTORY': {
    display: {
      title: 'Fiori: Monitor Stock',
      fioriIntent: 'Material-monitorStock',
      tCode: 'MMBE',
      sapVersion: 'S/4HANA',
      module: 'MM',
      navigation: ['Logistics', 'Materials Management', 'Inventory Management', 'Environment', 'Stock', 'Stock Overview'],
      points: ['Check Unrestricted Stock', 'Verify Storage Location', 'Check Reservations']
    }
  },
  'BUSINESS_PARTNER': {
    display: {
      title: 'Fiori: Manage Business Partner',
      fioriIntent: 'BusinessPartner-display',
      tCode: 'BP',
      sapVersion: 'S/4HANA',
      module: 'Cross-App',
      navigation: ['BP (TCode)', 'Search by Type', 'Select Role'],
      fields: [
        { field: 'Partner No', type: 'ID', description: 'Internal ID', mandatory: true },
        { field: 'Role', type: 'Category', description: 'FLVN01 (Vendor) or FLCU01 (Customer)', mandatory: true }
      ],
      points: ['Verify Account Groups', 'Check Address Validity', 'Verify Bank Data']
    },
    create: {
      title: 'SAP GUI: Create Business Partner (BP)',
      fioriIntent: 'BusinessPartner-create',
      tCode: 'BP',
      sapVersion: 'S/4HANA',
      module: 'Cross-App',
      navigation: ['BP (TCode)', 'Select Category', 'Enter BP Role', 'Fill General Address Details'],
      fields: [
        { field: 'Partner Name', type: 'String', description: 'Company or Person Name', mandatory: true },
        { field: 'Role', type: 'Category', description: 'FLVN01 (Vendor) or FLCU01 (Customer)', mandatory: true },
        { field: 'Country', type: 'String', description: 'Country Code (e.g. US, DE)', mandatory: true }
      ],
      points: ['Select role strategy', 'Address formatting verification', 'Reconciliation G/L Accounts Setup']
    }
  },
  'FINANCE_POSTING': {
    display: {
      title: 'SAP GUI: Post Journal Entry (FB50)',
      fioriIntent: 'JournalEntry-post',
      tCode: 'FB50',
      sapVersion: 'ECC / S/4HANA',
      module: 'FI',
      navigation: ['Accounting', 'Financial Accounting', 'General Ledger', 'Document Entry', 'Post GL Account Document'],
      fields: [
        { field: 'Doc Date', type: 'Date', description: 'Document date', mandatory: true },
        { field: 'Company Code', type: 'ID', description: 'Organizational unit', mandatory: true }
      ],
      points: ['Balance must be zero', 'Verify Profit Center', 'Check Tax Calc']
    }
  },
  'MATERIAL_MASTER': {
    display: {
      title: 'Fiori: Manage Material Master',
      fioriIntent: 'Material-manage',
      tCode: 'MM03',
      sapVersion: 'S/4HANA',
      module: 'MM',
      navigation: ['Logistics', 'Materials Management', 'Material Master', 'Material', 'Display'],
      fields: [
        { field: 'Material ID', type: 'ID', description: 'Material code (e.g. MAT-A01)', mandatory: true }
      ],
      points: ['Check Valuation Class', 'Verify Base Unit of Measure', 'Confirm Stock Parameters']
    },
    create: {
      title: 'SAP GUI: Create Material Master (MM01)',
      fioriIntent: 'Material-create',
      tCode: 'MM01',
      sapVersion: 'ECC / S/4HANA',
      module: 'MM',
      navigation: ['MM01 (TCode)', 'Enter Industry Sector', 'Select Material Type', 'Select Basic Data Views', 'Enter Material Text'],
      fields: [
        { field: 'Material Name', type: 'String', description: 'Short description text', mandatory: true },
        { field: 'Material Category', type: 'Category', description: 'Equipment vs Raw Material vs Finished Product', mandatory: true },
        { field: 'Base Unit', type: 'String', description: 'Base unit of measure (e.g. PC, KG)', mandatory: true },
        { field: 'Net Weight', type: 'String', description: 'Product net weight (e.g. 12.5 kg)', mandatory: true }
      ],
      points: ['Set Base Unit', 'Verify Valuation Segment', 'Calculate Price Valuation Class']
    }
  },
  'FREIGHT_ORDER': {
    display: {
      title: 'Fiori: Manage Freight Orders (TM)',
      fioriIntent: 'FreightOrder-manage',
      tCode: 'TM_FO',
      sapVersion: 'S/4HANA',
      module: 'TM',
      navigation: ['Transportation Management', 'Freight Order Management', 'Freight Order', 'Display'],
      fields: [
        { field: 'Freight Order ID', type: 'ID', description: 'Freight Order number', mandatory: true }
      ],
      points: ['Verify Carrier Assignment', 'Check Delay Alerts', 'Confirm Route Milestones']
    },
    create: {
      title: 'SAP GUI: Create Freight Order (TM_FO)',
      fioriIntent: 'FreightOrder-create',
      tCode: 'TM_FO',
      sapVersion: 'S/4HANA',
      module: 'TM',
      navigation: ['Transportation Management', 'Freight Order Management', 'Create Freight Order'],
      fields: [
        { field: 'Source Location', type: 'String', description: 'Departure Plant / Port', mandatory: true },
        { field: 'Destination', type: 'String', description: 'Arrival Customer / Warehouse', mandatory: true },
        { field: 'Carrier ID', type: 'ID', description: 'Authorized Logistics Carrier', mandatory: true },
        { field: 'Freight Price', type: 'Number', description: 'Estimated shipment cost', mandatory: true }
      ],
      points: ['Check route layout validity', 'Verify dangerous goods status', 'Confirm carrier quotation']
    }
  },
  'MAINTENANCE_ORDER': {
    display: {
      title: 'Fiori: Display Maintenance Order',
      fioriIntent: 'MaintenanceOrder-display',
      tCode: 'IW33',
      sapVersion: 'S/4HANA',
      module: 'PM',
      navigation: ['Plant Maintenance', 'Maintenance Processing', 'Order', 'Display'],
      fields: [
        { field: 'Order No', type: 'ID', description: 'Maintenance Order ID', mandatory: true }
      ],
      points: ['Verify Operation Steps', 'Check Component Allocations', 'Confirm Cost Estimates']
    },
    create: {
      title: 'SAP GUI: Create Maintenance Order (IW31)',
      fioriIntent: 'MaintenanceOrder-create',
      tCode: 'IW31',
      sapVersion: 'ECC / S/4HANA',
      module: 'PM',
      navigation: ['IW31 (TCode)', 'Enter Order Type', 'Select Equipment', 'Fill Planning Data'],
      fields: [
        { field: 'Description', type: 'String', description: 'Short work order description', mandatory: true },
        { field: 'Equipment ID', type: 'ID', description: 'SAP Asset Equipment Code', mandatory: true },
        { field: 'Functional Loc', type: 'String', description: 'Functional asset location', mandatory: true },
        { field: 'Work Center', type: 'String', description: 'Responsible Maintenance plant center', mandatory: true }
      ],
      points: ['Confirm Equipment ID validity', 'Define operation list/milestones', 'Save and allocate maintenance budget']
    }
  },
  'WORKFLOW_APPROVAL': {
    display: {
      title: 'Fiori: Inbox - My Approvals',
      fioriIntent: 'MyInbox-approve',
      tCode: 'SBWP',
      sapVersion: 'S/4HANA',
      module: 'Workflow',
      navigation: ['Fiori My Inbox', 'Filter Pending Approvals', 'Select Document to Release'],
      fields: [
        { field: 'Task ID', type: 'ID', description: 'Unique Workflow Task ID', mandatory: true }
      ],
      points: ['Verify Release Strategy', 'Read Sign-off History', 'Check Risk Score / Exceptions']
    }
  },
  'HR_ONBOARDING': {
    create: {
      title: 'SuccessFactors: HR Employee Onboarding',
      fioriIntent: 'Employee-onboard',
      tCode: 'HCM_ONB',
      sapVersion: 'S/4HANA',
      module: 'HCM',
      navigation: ['SuccessFactors Launchpad', 'Onboarding Dashboard', 'Add New Employee Profile'],
      fields: [
        { field: 'Employee Name', type: 'String', description: 'First and last name in passport', mandatory: true },
        { field: 'Business Role', type: 'Category', description: 'Job role classification', mandatory: true },
        { field: 'Department', type: 'String', description: 'Corporate business unit', mandatory: true }
      ],
      points: ['Verify contract terms', 'Configure basic payroll attributes', 'Trigger automatic IT profile provisioning']
    }
  }
};

export const buildGuiScreenCard = (objectType: string, action: 'display' | 'create', params: Record<string, string>, preferMode: 'link' | 'screenshot' | 'fields' | 'mock' = 'link'): GuiScreenCard => {
  const map = SCREEN_MAP[objectType]?.[action];
  
  const isS8h = typeof process !== 'undefined' && process.env && process.env.SAP_S8H_FIORI;
  const fioriBaseUrl = isS8h ? process.env.SAP_S8H_FIORI : TENANT_URL;
  const s8hUser = isS8h ? (process.env.SAP_S8H_USER || 'STUDENT069') : '';

  if (!map) {
    const webguiBase = isS8h ? process.env.SAP_S8H_WEBGUI : '';
    const link = isS8h && webguiBase ? webguiBase : TENANT_URL;
    return {
      title: `SAP UI: ${objectType} ${action}`,
      purpose: 'Verification required in S/4HANA backend.',
      fioriLink: link,
      tCode: 'N/A',
      parameters: params,
      verificationPoints: ['Manual object check'],
      notes: isS8h 
        ? `Live S8H ERP active! Direct routing mapping unavailable for this intent, but you can launch the live WebGUI with user ${s8hUser}.`
        : 'Standard mapping unavailable.',
      mode: 'link'
    };
  }

  const paramString = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  let fioriLink = '';
  if (isS8h && fioriBaseUrl) {
    const hashSeparator = fioriBaseUrl.includes('#') ? '' : '#';
    // Append intent to S8H FLP URL
    fioriLink = `${fioriBaseUrl}${hashSeparator}${map.fioriIntent}${paramString ? '?' + paramString : ''}`;
  } else {
    fioriLink = `${TENANT_URL}#${map.fioriIntent}${paramString ? '?' + paramString : ''}`;
  }

  const customNotes = isS8h
    ? `Live S8H SAP System Active. Authenticated with User: ${s8hUser} (Client 100). Use T-Code ${map.tCode} in WebGUI fallback.`
    : `Access requires S/4HANA ${map.sapVersion} SSO authorization.`;

  return {
    title: map.title,
    purpose: action === 'create' 
      ? `Finalize creation of ${objectType} in live system.` 
      : `Verify ${objectType} master data and transactional status.`,
    fioriLink,
    tCode: map.tCode,
    sapVersion: map.sapVersion,
    module: map.module,
    parameters: params,
    verificationPoints: map.points,
    navigationSteps: map.navigation,
    fieldMetadata: map.fields,
    notes: customNotes,
    mode: preferMode
  };
};
