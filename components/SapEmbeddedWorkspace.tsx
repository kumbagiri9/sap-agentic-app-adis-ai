import React, { useState, useEffect } from 'react';
import { 
  Building, 
  ExternalLink, 
  FileCode, 
  Globe, 
  Calendar, 
  Layers, 
  Boxes, 
  Coins, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  X, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Search, 
  Sparkles,
  ArrowRight,
  Monitor,
  Wifi,
  FileText,
  AlertTriangle,
  LayoutGrid,
  TrendingUp,
  Inbox,
  User,
  Package,
  Activity,
  Workflow,
  CheckCircle,
  HelpCircle,
  Clock,
  Terminal,
  Workflow as WorkflowIcon,
  HelpCircle as HelpIcon,
  ShieldCheck,
  Award
} from 'lucide-react';

import { 
  SalesOrderForm, 
  PurchaseOrderForm, 
  BusinessPartnerForm, 
  MaterialMasterForm, 
  JournalEntryForm, 
  FreightOrderForm, 
  MaintenanceOrderForm, 
  WorkflowInboxForm, 
  HrOnboardingForm,
  GenericInteractiveForm 
} from './EmbeddedSapForms';
import { BasisAdminForm } from './BasisAdminForm';
import { ORDERS, INVOICES, DELIVERIES, MATERIALS, PURCHASE_ORDERS, VENDORS, JOURNAL_ENTRIES } from '../services/sapData';
import { getRelatedDocs, getRelatedDocsForInvoice, getRelatedDocsForDelivery } from '../services/sapService';

import { idocService } from '../services/idocService';

export interface SapTab {
  id: string;
  title: string;
  url: string;
  type: 'invoice' | 'sales_order' | 'delivery' | 'purchase_order' | 'material' | 'business_partner' | 'freight_order' | 'idoc' | 'workflow' | 'fiori' | 'generic_transaction' | 'journal_entry' | 'basis_admin';
  docId: string;
  activeTCode?: string;
  history: string[];
  historyIndex: number;
}

interface SapEmbeddedWorkspaceProps {
  tabs: SapTab[];
  activeTabId: string;
  onActivateTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onClosePanel: () => void;
  sapPanelWidth: number;
  setSapPanelWidth: (width: number) => void;
  userRole: string;
  onAddTab: (tabConfig: { title: string; url: string; type: any; docId: string; activeTCode?: string }) => void;
}

export const SapEmbeddedWorkspace: React.FC<SapEmbeddedWorkspaceProps> = ({
  tabs,
  activeTabId,
  onActivateTab,
  onCloseTab,
  onClosePanel,
  sapPanelWidth,
  setSapPanelWidth,
  userRole,
  onAddTab
}) => {
  const [sessionActive, setSessionActive] = useState(true);
  const [connectionMode, setConnectionMode] = useState<'sandbox' | 'live'>('sandbox');
  const [commandValue, setCommandValue] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [showFrameWarning, setShowFrameWarning] = useState(true);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (activeTab) {
      setCommandValue(activeTab.activeTCode || '');
      // Default to GUI Simulator to avoid cross-origin iframe blocking and spinning loops
      setConnectionMode('sandbox');
    }
  }, [activeTabId, activeTab?.url]);

  const [activeIdocData, setActiveIdocData] = useState<any>(null);
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessLogs, setReprocessLogs] = useState<string[]>([]);
  const [reprocessStatus, setReprocessStatus] = useState<'success' | 'failed' | null>(null);

  const handleReprocessIdoc = async (docId: string) => {
    setReprocessing(true);
    setReprocessStatus(null);
    setReprocessLogs([`Starting live BD87 transaction pipeline for IDoc ${docId}...`]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setReprocessLogs(prev => [...prev, `Checking connection to S/4HANA (Host 172.21.72.3, Client 100)...`]);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = await idocService.reprocessIdoc(docId);
    
    setReprocessLogs(prev => [...prev, ...result.logs]);
    
    const updated = await idocService.getIdocDetails(docId);
    if (updated && !('error' in updated)) {
      setActiveIdocData(updated);
    }
    
    setReprocessing(false);
    setReprocessStatus(result.success ? 'success' : 'failed');
  };

  const handleSelfHealIdoc = async (docId: string) => {
    setReprocessing(true);
    setReprocessStatus(null);
    setReprocessLogs([`Initializing Human-In-The-Loop AI Self-Healing GRC approval check...`]);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setReprocessLogs(prev => [...prev, `Applying automated system repair configurations...`]);
    
    const cleanId = docId.replace(/^0+/, '').trim();
    if (cleanId === '56019' || cleanId === '56001') {
      idocService.createRfcDestination('S4LOCAL_RFC');
      setReprocessLogs(prev => [...prev, `[SM59 FIX] Successfully created missing RFC Destination "S4LOCAL_RFC" pointing to loopback.`]);
    } else if (cleanId === '21044' || cleanId === '1002' || cleanId === '1012') {
      idocService.addSproMapping('410000', 'CC-1000');
      setReprocessLogs(prev => [...prev, `[SPRO FIX] Automatically mapped G/L Account 410000 -> Cost Center CC-1000 to resolve SPRO missing indicators.`]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setReprocessLogs(prev => [...prev, `Re-triggering BD87 reprocessing trigger post-repair...`]);
    
    const result = await idocService.reprocessIdoc(docId);
    setReprocessLogs(prev => [...prev, ...result.logs]);
    
    const updated = await idocService.getIdocDetails(docId);
    if (updated && !('error' in updated)) {
      setActiveIdocData(updated);
    }
    
    setReprocessing(false);
    setReprocessStatus(result.success ? 'success' : 'failed');
  };

  useEffect(() => {
    const fetchIdocDetails = () => {
      if (activeTab && activeTab.type === 'idoc' && activeTab.docId) {
        idocService.getIdocDetails(activeTab.docId).then(data => {
          if (data && !('error' in data)) {
            setActiveIdocData(data);
          } else {
            setActiveIdocData(null);
          }
        }).catch(() => {
          setActiveIdocData(null);
        });
      } else {
        setActiveIdocData(null);
      }
    };

    fetchIdocDetails();

    const interval = setInterval(() => {
      if (activeTab && activeTab.type === 'idoc') {
        fetchIdocDetails();
      }
    }, 3000);

    const handleIdocStatusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (activeTab && activeTab.type === 'idoc' && activeTab.docId) {
        const cleanActive = activeTab.docId.replace(/^0+/, '').trim();
        const cleanEvent = (customEvent.detail?.idocId || '').replace(/^0+/, '').trim();
        if (cleanActive === cleanEvent) {
          fetchIdocDetails();
        }
      }
    };

    window.addEventListener('idoc-status-updated', handleIdocStatusUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('idoc-status-updated', handleIdocStatusUpdate);
    };
  }, [activeTabId, activeTab?.docId, activeTab?.type]);

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
          <Monitor className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm uppercase">SAP Embedded Browser</h3>
          <p className="text-xs text-slate-400 font-medium max-w-xs mt-1">
            Open any SAP Screen deep links or click launchpad tiles to load the live workspace.
          </p>
        </div>
        <button
          onClick={() => {
            onAddTab({
              title: 'SAP Fiori Space',
              url: 'https://ui.s4hana.ondemand.com/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html',
              type: 'fiori',
              docId: '',
              activeTCode: 'FLP'
            });
          }}
          className="px-4 py-2 bg-[#002f5a] hover:bg-[#002140] text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Initialize Fiori Launchpad
        </button>
      </div>
    );
  }

  // Handle Command bar execution (e.g., typing /nVA01, /nVA03 478, /nVF03 0090000397, or short tcodes)
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let text = commandValue.trim();
    if (!text) return;

    // strip clear codes /n or /o or /N or /O
    let cleanText = text;
    if (cleanText.toUpperCase().startsWith('/N') || cleanText.toUpperCase().startsWith('/O')) {
      cleanText = cleanText.substring(2).trim();
    }

    if (!cleanText) return;

    // Parse transaction code and potential document parameter
    const parts = cleanText.split(/\s+/);
    const targetTcode = parts[0].toUpperCase();
    const enteredDocId = parts.slice(1).join(' ').trim();

    // Route command to a new embedded tab
    let type: any = 'generic_transaction';
    let title = `T-Code: ${targetTcode}`;
    let docId = enteredDocId || '';
    let url = `https://ui.s4hana.ondemand.com/sap/bc/gui/sap/its/webgui?~transaction=${targetTcode}`;

    if (targetTcode === 'VA01') {
      type = 'sales_order';
      title = 'VA01: Create Order';
      docId = '';
    } else if (targetTcode === 'VA03' || targetTcode === 'VA02') {
      type = 'sales_order';
      const liveLatest = (typeof window !== 'undefined' && (window as any).__lastCreatedSalesOrderId) || 
        (Object.values(ORDERS).slice(-1)[0] as any)?.sapSalesOrder || 
        Object.values(ORDERS).slice(-1)[0]?.id || '';
      docId = enteredDocId || liveLatest || '0000006338';
      title = `${targetTcode}: Display Order ${docId}`;
    } else if (targetTcode === 'VF01') {
      type = 'invoice';
      title = 'VF01: Billing Document';
      docId = '';
    } else if (targetTcode === 'VF03' || targetTcode === 'VF02') {
      type = 'invoice';
      const liveLatest = Object.values(INVOICES).slice(-1)[0]?.id || '';
      docId = enteredDocId || liveLatest || '0090005794';
      title = `${targetTcode}: Display Invoice ${docId}`;
    } else if (targetTcode === 'VL01N' || targetTcode === 'VL02N' || targetTcode === 'VL03N') {
      type = 'delivery';
      const liveLatest = Object.values(DELIVERIES).slice(-1)[0]?.id || '';
      docId = enteredDocId || liveLatest || '0080006580';
      title = `${targetTcode}: Outbound Delivery ${docId}`;
    } else if (targetTcode === 'ME21N' || targetTcode === 'ME22N' || targetTcode === 'ME23N') {
      type = 'purchase_order';
      const liveLatest = Object.values(PURCHASE_ORDERS).slice(-1)[0]?.id || '';
      docId = enteredDocId || liveLatest || '4500000001';
      title = `${targetTcode}: Purchase Order ${docId}`;
    } else if (targetTcode === 'BP') {
      type = 'business_partner';
      const liveLatest = Object.values(VENDORS).slice(-1)[0]?.id || '';
      docId = enteredDocId || liveLatest || 'USCU_S03';
      title = `BP: Maintain Business Partner ${docId}`;
    } else if (targetTcode === 'MM01' || targetTcode === 'MM02' || targetTcode === 'MM03') {
      type = 'material';
      const liveLatest = Object.values(MATERIALS).slice(-1)[0]?.id || '';
      docId = enteredDocId || liveLatest || 'MZ-FG-C900';
      title = `${targetTcode}: Material Master ${docId}`;
    } else if (targetTcode === 'FB50' || targetTcode === 'FB02' || targetTcode === 'FB03') {
      type = 'journal_entry';
      const liveLatest = (Object.values(JOURNAL_ENTRIES).slice(-1)[0] as any)?.id || (Object.values(JOURNAL_ENTRIES).slice(-1)[0] as any)?.documentNumber || '';
      docId = enteredDocId || liveLatest || '9400000008';
      title = `${targetTcode}: Journal Entry ${docId}`;
    } else if (targetTcode === 'FLP' || targetTcode === 'HOME') {
      type = 'fiori';
      title = 'Fiori Launchpad';
      url = 'https://ui.s4hana.ondemand.com/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html';
    } else if (['ST03N', 'ST04', 'ST06', 'STAD', 'ST02', 'ST22', 'SM50', 'SM66', 'DBACOCKPIT', 'SM36', 'SM37', 'SP01', 'SPAD', 'RZ20', 'CCMS', 'SOLMAN', 'FOCUSEDRUN', 'SM12', 'SM13', 'SM59', 'SMGW'].includes(targetTcode)) {
      type = 'basis_admin';
      const tc = targetTcode;
      if (tc === 'ST03N') title = 'ST03N: Workload Analysis';
      else if (tc === 'ST04') title = 'ST04: DB Performance Monitor';
      else if (tc === 'ST06') title = 'ST06: OS System Monitor';
      else if (tc === 'STAD') title = 'STAD: Single Transaction Analysis';
      else if (tc === 'ST02') title = 'ST02: Buffer Tuning Monitor';
      else if (tc === 'ST22') title = 'ST22: ABAP Short Dumps';
      else if (tc === 'SM50') title = 'SM50: Work Process Monitor';
      else if (tc === 'SM66') title = 'SM66: Global Process Monitor';
      else if (tc === 'DBACOCKPIT') title = 'DBACOCKPIT: HANA DB Cockpit';
      else if (tc === 'SM36') title = 'SM36: Background Job Definition';
      else if (tc === 'SM37') title = 'SM37: Background Job Monitor';
      else if (tc === 'SP01') title = 'SP01: Spool Request Monitor';
      else if (tc === 'SPAD') title = 'SPAD: Spool Administration';
      else if (tc === 'RZ20' || tc === 'CCMS') title = 'RZ20: CCMS Alert Monitor';
      else if (tc === 'SOLMAN') title = 'Solution Manager Alert Cockpit';
      else if (tc === 'FOCUSEDRUN') title = 'Focused Run Monitor';
      else if (tc === 'SM12') title = 'SM12: Lock Entry Monitor';
      else if (tc === 'SM13') title = 'SM13: Update Service Failures';
      else if (tc === 'SM59') title = 'SM59: RFC Destination Monitor';
      else if (tc === 'SMGW') title = 'SMGW: Gateway Monitor';
      else title = `${tc}: Basis Admin Panel`;
    }

    onAddTab({
      title,
      url,
      type,
      docId,
      activeTCode: targetTcode
    });
  };

  const currentUrl = activeTab.url;

  // Render browser back, forward, refresh action
  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      activeTab.historyIndex--;
      activeTab.url = activeTab.history[activeTab.historyIndex];
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      activeTab.historyIndex++;
      activeTab.url = activeTab.history[activeTab.historyIndex];
    }
  };

  // Switch display mode
  const presetSplit = (pct: number) => {
    setSapPanelWidth(pct);
  };

  const renderSharedDocumentFlowExplorer = (
    salesOrder: string,
    delivery: string,
    invoice: string,
    journalEntry: string,
    currentType: 'sales_order' | 'delivery' | 'invoice' | 'journal_entry'
  ) => {
    const isDeliveryCreated = !!delivery && delivery !== 'Not Created' && delivery !== 'NONE';
    const isInvoiceCreated = !!invoice && invoice !== 'Not Created' && invoice !== 'NONE';
    const isJournalCreated = !!journalEntry && journalEntry !== 'Not Created' && journalEntry !== 'NONE';

    return (
      <div id="document-flow-explorer" className="border border-slate-200 rounded-xl p-3 bg-white mt-4 shadow-sm scroll-mt-4 text-left">
        <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Workflow className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> S/4HANA Dynamic Document Flow Explorer
          </span>
          <span className="text-[7.5px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 rounded font-bold uppercase">Click Node to Display Object</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[9.5px] text-slate-700 font-semibold text-left">
          
          {/* sales order node */}
          {currentType === 'sales_order' ? (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-2 border-indigo-300 rounded-xl p-2.5 text-center shadow">
              <div className="text-[7px] uppercase font-black text-indigo-800 block mb-0.5">SALES ORDER</div>
              <div className="font-extrabold text-indigo-955 tracking-tight">{salesOrder}</div>
              <div className="text-[8px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase">ACTIVE VIEW</div>
            </div>
          ) : (
            <button 
              onClick={() => onAddTab({
                title: `VA03: Order ${salesOrder}`,
                url: '',
                type: 'sales_order',
                docId: salesOrder,
                activeTCode: 'VA03'
              })}
              className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-2.5 text-center transition-all shadow-sm active:scale-95 group"
            >
              <div className="text-[7px] uppercase font-black text-slate-400 block mb-0.5">SALES ORDER</div>
              <div className="font-extrabold text-[#2563EB] tracking-tight group-hover:underline">{salesOrder}</div>
              <div className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1 py-0.5 rounded-full inline-block mt-1">CREATED</div>
            </button>
          )}

          {/* delivery node */}
          {isDeliveryCreated ? (
            currentType === 'delivery' ? (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-2 border-indigo-300 rounded-xl p-2.5 text-center shadow">
                <div className="text-[7px] uppercase font-black text-indigo-800 block mb-0.5">OUTBOUND DELIVERY</div>
                <div className="font-extrabold text-indigo-955 tracking-tight">{delivery}</div>
                <div className="text-[8px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase">ACTIVE VIEW</div>
              </div>
            ) : (
              <button 
                onClick={() => onAddTab({
                  title: `VL03N: Delivery ${delivery}`,
                  url: '',
                  type: 'delivery',
                  docId: delivery,
                  activeTCode: 'VL03N'
                })}
                className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-2.5 text-center transition-all shadow-sm active:scale-95 group"
              >
                <div className="text-[7px] uppercase font-black text-slate-400 block mb-0.5">OUTBOUND DELIVERY</div>
                <div className="font-extrabold text-indigo-700 tracking-tight group-hover:underline">{delivery}</div>
                <div className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1 py-0.5 rounded-full inline-block mt-1">PGI DONE</div>
              </button>
            )
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2.5 text-center text-slate-400">
              <div className="text-[7px] uppercase font-black text-slate-400 block mb-0.5">OUTBOUND DELIVERY</div>
              <div className="font-bold text-slate-500 text-[10px]">Not Created Yet</div>
              <div className="text-[7.5px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase">PENDING DELIVERY</div>
            </div>
          )}

          {/* billing node */}
          {isInvoiceCreated ? (
            currentType === 'invoice' ? (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-2 border-indigo-300 rounded-xl p-2.5 text-center shadow">
                <div className="text-[7px] uppercase font-black text-indigo-800 block mb-0.5">CURRENT INVOICE</div>
                <div className="font-extrabold text-indigo-955 tracking-tight">{invoice.startsWith('INV-') ? invoice : `INV-${invoice}`}</div>
                <div className="text-[8px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase">ACTIVE VIEW</div>
              </div>
            ) : (
              <button 
                onClick={() => onAddTab({
                  title: `VF03: Invoice ${invoice}`,
                  url: '',
                  type: 'invoice',
                  docId: invoice,
                  activeTCode: 'VF03'
                })}
                className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-2.5 text-center transition-all shadow-sm active:scale-95 group"
              >
                <div className="text-[7px] uppercase font-black text-slate-400 block mb-0.5">CURRENT INVOICE</div>
                <div className="font-extrabold text-[#2563EB] tracking-tight group-hover:underline">{invoice.startsWith('INV-') ? invoice : `INV-${invoice}`}</div>
                <div className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1 py-0.5 rounded-full inline-block mt-1 font-mono uppercase">POSTED</div>
              </button>
            )
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2.5 text-center text-slate-400">
              <div className="text-[7px] uppercase font-black text-slate-400 block mb-0.5">CURRENT INVOICE</div>
              <div className="font-bold text-slate-500 text-[10px]">Not Created Yet</div>
              <div className="text-[7.5px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase">PENDING BILLING</div>
            </div>
          )}

          {/* accounting journal node */}
          {isJournalCreated ? (
            currentType === 'journal_entry' ? (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-2 border-indigo-300 rounded-xl p-2.5 text-center shadow">
                <div className="text-[7px] uppercase font-black text-indigo-800 block mb-0.5">FI JOURNAL LEDGER</div>
                <div className="font-extrabold text-indigo-955 tracking-tight">{journalEntry}</div>
                <div className="text-[8px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase">ACTIVE VIEW</div>
              </div>
            ) : (
              <button 
                onClick={() => onAddTab({
                  title: `FB03: Journal ${journalEntry}`,
                  url: '',
                  type: 'journal_entry',
                  docId: journalEntry,
                  activeTCode: 'FB03'
                })}
                className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-2.5 text-center transition-all shadow-sm active:scale-95 group"
              >
                <div className="text-[7px] uppercase font-black text-slate-400 block mb-0.5">FI JOURNAL LEDGER</div>
                <div className="font-extrabold text-slate-700 tracking-tight group-hover:underline">{journalEntry}</div>
                <div className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full inline-block mt-1">CLEARED</div>
              </button>
            )
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2.5 text-center text-slate-400">
              <div className="text-[7px] uppercase font-black text-slate-400 block mb-0.5">FI JOURNAL LEDGER</div>
              <div className="font-bold text-slate-500 text-[10px]">Not Posted Yet</div>
              <div className="text-[7.5px] bg-slate-200 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase">NO FI ENTRY</div>
            </div>
          )}

        </div>
      </div>
    );
  };

  // Simulated Document Detail Views (HTML5 high-fidelity)
  const renderSimulatedContent = () => {
    if (activeTab.type === 'fiori') {
      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50 space-y-6">
          <div className="bg-[#002f5a] text-white p-6 rounded-2xl border border-blue-450 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] bg-blue-500 text-white font-black px-2 py-0.5 rounded tracking-wide font-mono uppercase">SAP Web Launchpad Workspace</span>
              <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-green-950/65 border border-green-800/80 rounded-full text-green-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Live Gateway
              </div>
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase">User Fiori Launchpad Dashboard</h2>
            <p className="text-xs text-blue-200 mt-2 font-medium leading-relaxed">
              Standard transactional apps and operational modules assigned to your operator role: <strong className="text-yellow-400 font-extrabold">{userRole}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* VA01 Create Sales Order */}
            <button 
              onClick={() => onAddTab({ title: 'VA01: Create Order', url: '', type: 'sales_order', docId: '', activeTCode: 'VA01' })}
              className="p-4 bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-450 rounded-2xl text-left transition-all hover:-translate-y-0.5 duration-150 shadow-sm flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-black block font-mono text-slate-400">T-CODE: VA01</span>
                <span className="text-[11px] font-black text-slate-800 uppercase block leading-tight truncate">Create Sales Order</span>
              </div>
            </button>

            {/* VF03 Display Invoice */}
            <button 
              onClick={() => onAddTab({ title: 'VF03: Invoice 90003108', url: '', type: 'invoice', docId: '90003108', activeTCode: 'VF03' })}
              className="p-4 bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-450 rounded-2xl text-left transition-all hover:-translate-y-0.5 duration-150 shadow-sm flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-black block font-mono text-slate-400">T-CODE: VF03</span>
                <span className="text-[11px] font-black text-slate-800 uppercase block leading-tight truncate">Display Billing Invoice</span>
              </div>
            </button>

            {/* VL03N Display Outbound Delivery */}
            <button 
              onClick={() => onAddTab({ title: 'VL03N: Outbound Delivery', url: '', type: 'delivery', docId: '80000002', activeTCode: 'VL03N' })}
              className="p-4 bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-450 rounded-2xl text-left transition-all hover:-translate-y-0.5 duration-150 shadow-sm flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-black block font-mono text-slate-400">T-CODE: VL03N</span>
                <span className="text-[11px] font-black text-slate-800 uppercase block leading-tight truncate">Display Delivery</span>
              </div>
            </button>

            {/* BP Maintain Business Partner */}
            <button 
              onClick={() => onAddTab({ title: 'BP: Business Partner', url: '', type: 'business_partner', docId: 'USCU_S03', activeTCode: 'BP' })}
              className="p-4 bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-450 rounded-2xl text-left transition-all hover:-translate-y-0.5 duration-150 shadow-sm flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-black block font-mono text-slate-400">T-CODE: BP</span>
                <span className="text-[11px] font-black text-slate-800 uppercase block leading-tight truncate">Maintain Partner</span>
              </div>
            </button>

            {/* MM03 Material Master Card */}
            <button 
              onClick={() => onAddTab({ title: 'MM03: Material Master', url: '', type: 'material', docId: 'MZ-FG-C900', activeTCode: 'MM03' })}
              className="p-4 bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-450 rounded-2xl text-left transition-all hover:-translate-y-0.5 duration-150 shadow-sm flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-black block font-mono text-slate-400">T-CODE: MM03</span>
                <span className="text-[11px] font-black text-slate-800 uppercase block leading-tight truncate">Display Material</span>
              </div>
            </button>

            {/* FB03 Journal Entry Ledger */}
            <button 
              onClick={() => onAddTab({ title: 'FB03: Journal Entry', url: '', type: 'journal_entry', docId: '190004128', activeTCode: 'FB03' })}
              className="p-4 bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-450 rounded-2xl text-left transition-all hover:-translate-y-0.5 duration-150 shadow-sm flex flex-col justify-between h-28 group"
            >
              <div className="w-9 h-9 bg-[#FFF7ED] text-orange-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-black block font-mono text-slate-400">T-CODE: FB03</span>
                <span className="text-[11px] font-black text-slate-800 uppercase block leading-tight truncate">Financial Journal</span>
              </div>
            </button>
          </div>

          {/* SPRO diagnostic check banner */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-[10.5px] leading-relaxed text-slate-500 font-semibold space-y-2">
            <div className="flex items-center gap-1.5 font-black text-[#002f5a] uppercase text-[9px] tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authorized operator clearance verified
            </div>
            <span>
              Your profile is authenticated to run S/4HANA transactional and analytics programs on client namespace <strong>100</strong>. Secure SSO and SAML assertions are maintained inside this sandbox container.
            </span>
          </div>
        </div>
      );
    }

    if (activeTab.type === 'invoice') {
      const docId = activeTab.docId || Object.values(INVOICES).slice(-1)[0]?.id || '0090005794';
      const cleanInvId = docId.toUpperCase().replace(/^(INV-)/, '').trim();
      const cleanInvNum = cleanInvId.replace(/^0+/, '');

      const foundInvoice: any = INVOICES[cleanInvId] || INVOICES[cleanInvNum] || INVOICES[`00${cleanInvId}`] || INVOICES[`INV-${cleanInvId}`] ||
        Object.values(INVOICES).find((inv: any) => String(inv.id || '').toUpperCase().includes(cleanInvId));

      const relatedDocs = getRelatedDocsForInvoice(cleanInvId, foundInvoice);

      const amount = Number(foundInvoice?.amount || foundInvoice?.netValue) || 34100.00;
      const taxAmount = Number(foundInvoice?.taxAmount) || 0.00;
      const bDate = foundInvoice?.billingDate || foundInvoice?.dueDate || '2026-05-28';
      const payer = foundInvoice?.payer || foundInvoice?.customer || 'USCU_S03';
      const company = foundInvoice?.companyName || foundInvoice?.customer || 'Bike Retailers Corp';
      const companyCode = foundInvoice?.companyCode || '1000';
      
      const salesOrderVal = relatedDocs.orderId || foundInvoice?.orderId || "0000006338";
      const deliveryVal = relatedDocs.deliveryId || foundInvoice?.deliveryRef || "0080006580";
      const fiDocId = relatedDocs.fiId || foundInvoice?.fiDocumentNumber || "9400000008";

      const lineItemMat = foundInvoice?.items?.[0]?.materialId || "MZ-FG-C900";
      const lineItemDesc = foundInvoice?.items?.[0]?.description || "C900 BIKE (Heavy Duty Dynamic Series)";
      const lineItemQty = foundInvoice?.items?.[0]?.quantity || 50;

      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 bg-white">
          {/* SAP GUI Sub-Menu Bar */}
          <div className="flex flex-wrap items-center bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 gap-2 text-[10px] font-bold text-slate-700 font-sans shadow-sm">
            <button className="hover:text-blue-600 transition flex items-center gap-1 cursor-pointer">
              <i className="fas fa-ellipsis-v text-slate-400"></i> Menu
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => {
                const el = document.getElementById('document-flow-explorer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-blue-600 hover:bg-slate-200/50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer text-[#0369a1]"
            >
              <i className="fas fa-project-diagram"></i> Display Document Flow
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => onAddTab({
                title: `FB03: Journal ${fiDocId}`,
                url: '',
                type: 'journal_entry',
                docId: fiDocId,
                activeTCode: 'FB03'
              })}
              className="hover:text-emerald-700 hover:bg-slate-200/50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer text-emerald-600 font-extrabold"
            >
              <i className="fas fa-file-invoice-dollar"></i> Accounting
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => {
                const el = document.getElementById('pricing-conditions-konv');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#4f46e5] hover:bg-slate-200/50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-coins text-[#4f46e5]"></i> Pricing Conditions Header
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => alert(`Change Billing Document action activated! (VF02 Mode Simulated for ${docId})`)}
              className="hover:text-blue-600 hover:bg-slate-200/50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-edit"></i> Change Bill. Doc.
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => alert(`Services for Object (GOS) loaded. Attaching files, starting workflows, and sending notifications are enabled for Invoice ${docId}.`)}
              className="hover:text-blue-600 hover:bg-slate-200/50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-paperclip"></i> Services for Object
            </button>
            <span className="text-slate-300 ml-auto">|</span>
            <button 
              onClick={() => alert('Exit action activated! Returning to Fiori Portal.')}
              className="hover:text-red-650 hover:bg-red-50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer font-black text-rose-600"
            >
              <i className="fas fa-sign-out-alt"></i> Exit
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl shadow-md p-5 relative overflow-hidden bg-slate-50/20">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2.5 pb-4 border-b border-slate-150 mb-4 bg-transparent">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] bg-[#002f5a] text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase">VF03 Displays</span>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-black tracking-wide uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Cleared & Paid
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Display Billing Document {docId}</h2>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase">Category: F2 Standard Invoice &bull; Company Code: 1000</div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] text-slate-454 font-black block">BILLING NET VALUE</span>
                <span className="text-lg font-black text-slate-950 font-mono">{amount.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Meta registry grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/70 p-3 rounded-xl border border-slate-150 space-y-1.5">
                <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-454 flex items-center gap-1 mb-1 pb-1 border-b border-slate-100">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Header Registry Fields
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-slate-600 font-medium text-[10.5px]">
                  <div>
                    <span className="text-slate-400 block text-[8px] font-black uppercase">Payer Customer</span>
                    <strong className="text-slate-800 font-black">{company} ({payer})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px] font-black uppercase">Billing Date</span>
                    <strong className="text-slate-800 font-extrabold">{bDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px] font-black uppercase">Payment Terms</span>
                    <strong className="text-slate-800 font-extrabold">NT30 (Net 30)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px] font-black uppercase">Currency / Code</span>
                    <strong className="text-blue-600 font-extrabold">USD / 1000</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 p-3 rounded-xl border border-slate-150 space-y-1.5">
                <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-454 flex items-center gap-1 mb-1 pb-1 border-b border-slate-100">
                  <Building className="w-3.5 h-3.5 text-indigo-500" /> Operational Partners
                </div>
                <div className="space-y-1 text-slate-600 text-[10.5px]">
                  <div>
                    <span className="text-slate-454 block text-[8px] font-black uppercase">Sold-to Party Customer</span>
                    <span className="font-extrabold text-slate-800">
                      {foundInvoice?.customer ? `${foundInvoice.customer} Customer` : "USCU_S03 Bike Retailers Corp Greensburg PA"}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 mt-1 flex justify-between">
                    <div>
                      <span className="text-slate-400 block text-[8px] font-black uppercase">Bill-to Party</span>
                      <span className="font-bold text-slate-705 block truncate text-[9.5px]">
                        {foundInvoice?.billingDept || `${foundInvoice?.customer || 'Customer'} Billing Dept`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[8px] font-black uppercase">Carrier</span>
                      <span className="font-bold text-slate-705 block text-[9.5px]">
                        {foundInvoice?.carrier || "DHL Logistics Boston Route"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 bg-white shadow-sm">
              <div className="bg-slate-900 border-b border-slate-950 px-3 py-2 text-white text-[9.5px] uppercase font-black tracking-wide flex justify-between">
                <span>Invoiced Line Items (VBRP Schema Mapping)</span>
                <span>1 Row(s)</span>
              </div>
              <div className="divide-y divide-slate-150 text-[11px]">
                <div className="p-3 hover:bg-slate-50 transition flex justify-between font-medium text-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-indigo-600 uppercase tracking-widest font-black block">ITEM 10 &bull; Material {lineItemMat}</span>
                    <span className="font-extrabold text-slate-900">{lineItemDesc}</span>
                    <div className="text-slate-404 text-[9.5px] font-semibold mt-1">
                      Quantity: {lineItemQty} PC &bull; Plant 1000 &bull; Ship Point 1000
                    </div>
                  </div>
                  <div className="text-right self-center">
                    <span className="font-black text-slate-955 block">{amount.toLocaleString()} USD</span>
                    <span className="text-[8.5px] text-rose-500 font-bold block">COGS: {(foundInvoice?.cogs ? Number(foundInvoice.cogs) : (amount * 0.7)).toLocaleString()} USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic flowchart Document Progress Map */}
            {renderSharedDocumentFlowExplorer(salesOrderVal, deliveryVal, docId, fiDocId, 'invoice')}

            {/* Pricing Conditions panel */}
            <div id="pricing-conditions-konv" className="border border-slate-200 rounded-xl p-3 bg-white mt-4 shadow-sm scroll-mt-4 text-left">
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1 mb-2">
                <Coins className="w-3.5 h-3.5 text-indigo-500" /> Pricing Conditions Details (KONV)
              </div>
              <div className="space-y-1.5 font-mono text-[9px]">
                <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-1.5">
                  <span className="text-slate-600 flex items-center gap-1">
                    <code className="bg-slate-100 text-indigo-800 px-1 py-0.5 rounded text-[8px] font-black">PR00</code>
                    <span>Base selling price per unit</span>
                  </span>
                  <span className="font-extrabold text-slate-900">{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                </div>
                <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-1.5">
                  <span className="text-slate-600 flex items-center gap-1">
                    <code className="bg-slate-100 text-indigo-800 px-1 py-0.5 rounded text-[8px] font-black">MWST</code>
                    <span>Output Sales Tax (8.00% VAT code A1)</span>
                  </span>
                  <span className="font-extrabold text-slate-900">{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                </div>
                <div className="flex justify-between items-center pb-1.5">
                  <span className="text-slate-600 flex items-center gap-1">
                    <code className="bg-slate-50 text-red-800 px-1 py-0.5 rounded text-[8px] font-black">VPRS</code>
                    <span>COGS Internal Material Cost Valuation</span>
                  </span>
                  <span className="font-extrabold text-rose-600">-{(foundInvoice?.cogs ? Number(foundInvoice.cogs) : (amount * 0.7)).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                </div>
                
                <div className="pt-2.5 border-t border-slate-300 flex justify-between font-sans items-center text-[9.5px] text-slate-800 font-extrabold">
                  <span>Ledger Post Net Summary</span>
                  <span className="text-[11px] text-indigo-950 font-black bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded shadow-sm">
                    Gross Ledger Account Total: { (amount + taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) } USD
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    }

    if (activeTab.type === 'sales_order') {
      if (activeTab.activeTCode === 'VA01') {
        return (
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50">
            <SalesOrderForm />
          </div>
        );
      }

      const rawDocId = activeTab.docId || (typeof window !== 'undefined' && (window as any).__lastCreatedSalesOrderId) || (typeof localStorage !== 'undefined' && localStorage.getItem('s4_last_created_so')) || 'ORD-80004562';
      const docId = rawDocId;
      const cleanSoId = rawDocId.toUpperCase().replace(/^(ORD-|SO-)/, '').replace(/^0+/, '').trim();
      const fullCleanSoId = rawDocId.toUpperCase().replace(/^(ORD-|SO-)/, '').trim();

      const foundOrder: any = ORDERS[cleanSoId] || ORDERS[fullCleanSoId] || ORDERS[`ORD-${cleanSoId}`] || ORDERS[rawDocId] || 
        Object.values(ORDERS).find((o: any) => String(o.sapSalesOrder || o.id || '').toUpperCase().includes(cleanSoId));

      const customerNameProp = foundOrder?.customer || (foundOrder?.customerId ? `${foundOrder.customerId} Customer` : 'Bike Retailers Corp (USCU_S03)');
      const customerAddressProp = foundOrder?.address || `Address: ${foundOrder?.customer || 'USCU_S03'}, Greensburg PA 15601`;
      const orderDateProp = foundOrder?.date || foundOrder?.creationDate || '2026-05-28';
      const netPriceProp = foundOrder?.total != null
        ? (typeof foundOrder.total === 'number'
            ? `${foundOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${foundOrder.currency || 'USD'}`
            : (String(foundOrder.total).includes('USD') ? String(foundOrder.total) : `${foundOrder.total} USD`))
        : (foundOrder?.netValue != null ? `${Number(foundOrder.netValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : '34,100.00 USD');
      
      const firstItem = foundOrder?.items && foundOrder.items.length > 0 ? foundOrder.items[0] : null;
      const itemMatProp = firstItem
        ? `${firstItem.materialId || firstItem.material || 'MZ-FG-C900'} - ${firstItem.text || firstItem.description || 'C900 BIKE (Heavy Duty Series)'}`
        : 'MZ-FG-C900 - C900 BIKE (Heavy Duty Series)';
      const itemQtyProp = firstItem
        ? `Quantity: ${firstItem.quantity || firstItem.qty || 50} PC &bull; Plant ${firstItem.plant || '1000'} &bull; Ship point ${firstItem.shipPoint || '1000'}`
        : 'Quantity: 50 PC &bull; Plant 1000 &bull; Ship point 1000';
      const salesOrgProp = foundOrder?.salesOrganization || foundOrder?.salesOrg || '1000';
      const isOpen = foundOrder?.status?.toLowerCase().includes('open') || foundOrder?.status?.toLowerCase().includes('pending');
      const statusTag = foundOrder?.status ? `✓ ${foundOrder.status}` : '✓ Fully Delivered';
      const statusBg = isOpen
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-emerald-100 text-emerald-800 border-emerald-250';
      
      const relatedDocs = getRelatedDocs(cleanSoId || fullCleanSoId, foundOrder);
      let delDocIdProp = relatedDocs.deliveryId || (foundOrder?.deliveryId || foundOrder?.delivery) || "Not Created";
      let invDocIdProp = relatedDocs.invoiceId || (foundOrder?.invoiceId || foundOrder?.invoice) || "Not Created";
      let fiDocId = relatedDocs.fiId || (foundOrder?.fiId || foundOrder?.journalEntry) || "Not Created";

      const displayDocId = rawDocId.startsWith('ORD-') ? rawDocId : (rawDocId.startsWith('SO-') ? rawDocId : `ORD-${cleanSoId}`);

      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 bg-white">
          <div className="border border-slate-200 rounded-2xl shadow-md p-5 relative overflow-hidden bg-slate-50/20">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2.5 pb-4 border-b border-slate-150 mb-4">
              <div>
                <span className="text-[8px] bg-[#002f5a] text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase">VA03 Displays</span>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Display Sales Order {displayDocId}</h2>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase">Category: OR Standard Order &bull; Sales Org: {salesOrgProp}</div>
              </div>
              <div className="text-right">
                <span className={`text-[11.5px] border font-black px-2.5 py-0.75 rounded-full uppercase text-[9px] ${statusBg}`}>
                  {statusTag}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-[10.5px] text-slate-600 font-medium">
              <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-1">
                <span className="text-[8px] font-black text-slate-400 block uppercase">CUSTOMER SOLD-TO</span>
                <span className="font-black text-slate-800">{customerNameProp}</span>
                <span className="text-[9px] text-slate-454 block">{customerAddressProp}</span>
              </div>
              <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-1">
                <span className="text-[8px] font-black text-slate-400 block uppercase">ORDER SUMMARY</span>
                <div className="flex justify-between">
                  <span>Ord Date:</span>
                  <span className="font-bold text-slate-800">{orderDateProp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Price:</span>
                  <span className="font-black text-slate-900">{netPriceProp}</span>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4">
              <div className="bg-slate-900 text-white p-2 px-3 text-[9px] uppercase font-black tracking-wider flex justify-between">
                <span>Sales Items (VBAK Table)</span>
                <span>Active Status</span>
              </div>
              <div className="p-3 text-[11px] space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <div>
                    <span className="text-[8px] text-indigo-600 font-black uppercase">Item 10</span>
                    <div className="text-slate-900 font-black">{itemMatProp}</div>
                    <div className="text-[9.5px] text-slate-400 mt-1" dangerouslySetInnerHTML={{ __html: itemQtyProp }} />
                  </div>
                  <span className="font-extrabold text-slate-955 self-center">{netPriceProp}</span>
                </div>
              </div>
            </div>

            {/* Related links */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-150">
              {delDocIdProp && delDocIdProp !== 'Not Created' ? (
                <button 
                  onClick={() => onAddTab({ title: `VL03N: Outbound Delivery ${delDocIdProp}`, url: '', type: 'delivery', docId: delDocIdProp, activeTCode: 'VL03N' })}
                  className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-indigo-700 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition active:scale-95"
                >
                  ▶ View Associated Delivery {delDocIdProp}
                </button>
              ) : (
                <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 text-[9.5px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Outbound Delivery Not Created Yet
                </div>
              )}

              {invDocIdProp && invDocIdProp !== 'Not Created' ? (
                <button 
                  onClick={() => onAddTab({ title: `VF03: Invoice ${invDocIdProp}`, url: '', type: 'invoice', docId: invDocIdProp, activeTCode: 'VF03' })}
                  className="px-3 py-1.5 bg-emerald-50 border border-emerald-250 hover:border-emerald-400 text-emerald-700 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition active:scale-95"
                >
                  ▶ View Associated Billing Document {invDocIdProp}
                </button>
              ) : (
                <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 text-[9.5px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Billing Document Not Created Yet
                </div>
              )}
            </div>

            {renderSharedDocumentFlowExplorer(docId, delDocIdProp, invDocIdProp, fiDocId, 'sales_order')}
          </div>
        </div>
      );
    }
    if (activeTab.type === 'delivery') {
      const docId = activeTab.docId || Object.values(DELIVERIES).slice(-1)[0]?.id || '0080006580';
      const cleanDelId = docId.toUpperCase().replace(/^(DEL-|DL-)/, '').trim();
      const cleanDelNum = cleanDelId.replace(/^0+/, '');

      const foundDelivery: any = DELIVERIES[cleanDelId] || DELIVERIES[cleanDelNum] || DELIVERIES[`00${cleanDelId}`] || DELIVERIES[`DEL-${cleanDelId}`] ||
        Object.values(DELIVERIES).find((d: any) => String(d.id || '').toUpperCase().includes(cleanDelId));

      const relatedDocs = getRelatedDocsForDelivery(cleanDelId, foundDelivery);

      const transitHub = foundDelivery?.carrier || "DHL Express Air Priority";
      const grossW = foundDelivery?.grossWeight ? `${foundDelivery.grossWeight} KG` : "750.00 KG";
      const netW = foundDelivery?.netWeight ? `${foundDelivery.netWeight} KG` : "700.00 KG";
      const itemMat = (foundDelivery?.items && foundDelivery.items[0]?.description)
        ? `${foundDelivery.items[0].materialId} - ${foundDelivery.items[0].description}`
        : ((foundDelivery?.items && foundDelivery.items[0]?.materialId)
            ? `${foundDelivery.items[0].materialId} - Delivered Goods`
            : "MZ-FG-C900 - C900 BIKE (Heavy Duty Series)");
      const itemQty = foundDelivery?.items?.[0]?.quantity || 50;
      const itemText = `Invoiced: ${itemQty} PC &bull; Picked Qty: ${itemQty} PC &bull; Confirmed`;
      const itemPicked = `✓ ${itemQty} / ${itemQty} PC`;

      const associatedInvoice = relatedDocs.invoiceId || foundDelivery?.invoiceId || "0090005794";
      const associatedOrder = relatedDocs.orderId || foundDelivery?.orderId || "0000006338";
      const fiDocId = relatedDocs.fiId || foundDelivery?.fiId || "9400000008";

      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 bg-white">
          <div className="border border-slate-200 rounded-2xl shadow-md p-5 relative overflow-hidden bg-slate-50/20">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2.5 pb-4 border-b border-slate-150 mb-4 bg-transparent">
              <div>
                <span className="text-[8px] bg-[#002f5a] text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase">VL03N Outbound Delivery</span>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Outbound Delivery {docId}</h2>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase">Shipment point: 1000 &bull; Route: US_EAST_AR_HUB</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.75 bg-emerald-100 text-emerald-800 font-extrabold uppercase text-[9px] rounded-full border border-emerald-250">
                  Goods Issued (PGI)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-[10.5px] text-slate-600 font-medium">
              <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-1">
                <span className="text-[8px] font-black text-slate-400 block uppercase">CARRIER SLA STATUS</span>
                <span className="font-extrabold text-slate-800">{transitHub}</span>
                <span className="font-black text-emerald-600 text-[9.5px] block mt-1">SLA Status Met &bull; Transit Hub Activated</span>
              </div>
              <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-1">
                <span className="text-[8px] font-black text-slate-400 block uppercase">SHIPPING METRICS</span>
                <div className="flex justify-between">
                  <span>Gross Weight:</span>
                  <span className="font-extrabold text-slate-800">{grossW}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Weight:</span>
                  <span className="font-extrabold text-slate-800">{netW}</span>
                </div>
              </div>
            </div>

            {/* List items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4">
              <div className="bg-slate-900 text-white p-2 px-3 text-[9px] uppercase font-black tracking-wider flex justify-between">
                <span>Shipping Items (LIPS Table Map)</span>
                <span>Picked Quantity</span>
              </div>
              <div className="p-3 text-[11px] space-y-2">
                <div className="flex justify-between font-medium">
                  <div>
                    <span className="text-[8px] text-indigo-650 font-black uppercase">Item 10</span>
                    <div className="text-slate-900 font-black">{itemMat}</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5" dangerouslySetInnerHTML={{ __html: itemText }} />
                  </div>
                  <span className="text-emerald-700 font-extrabold self-center">{itemPicked}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-150">
              <button 
                onClick={() => onAddTab({ title: `VF03: Invoice ${associatedInvoice}`, url: '', type: 'invoice', docId: associatedInvoice, activeTCode: 'VF03' })}
                className="px-3 py-1.5 bg-emerald-50 border border-emerald-250 hover:border-emerald-400 text-emerald-700 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition active:scale-95"
              >
                ▶ Display Invoice {associatedInvoice}
              </button>
              <button 
                onClick={() => onAddTab({ title: `VA03: Sales Order ${associatedOrder}`, url: '', type: 'sales_order', docId: associatedOrder, activeTCode: 'VA03' })}
                className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:border-indigo-451 text-indigo-700 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition active:scale-95"
              >
                ▶ Display Sales Order {associatedOrder}
              </button>
            </div>

            {renderSharedDocumentFlowExplorer(associatedOrder, docId, associatedInvoice, fiDocId, 'delivery')}
          </div>
        </div>
      );
    }

    if (activeTab.type === 'journal_entry') {
      const docId = activeTab.docId || (Object.values(JOURNAL_ENTRIES).slice(-1)[0] as any)?.id || (Object.values(JOURNAL_ENTRIES).slice(-1)[0] as any)?.documentNumber || '9400000008';
      const cleanJeId = docId.toUpperCase().replace(/^(ACDOCA-)/, '').trim();
      const cleanJeNum = cleanJeId.replace(/^0+/, '');

      const foundJe: any = JOURNAL_ENTRIES[cleanJeId] || JOURNAL_ENTRIES[cleanJeNum] || JOURNAL_ENTRIES[`00${cleanJeId}`] ||
        Object.values(JOURNAL_ENTRIES).find((je: any) => String(je.id || '').toUpperCase().includes(cleanJeId));

      const invoiceAmt = Number(foundJe?.amount || foundJe?.totalAmount) || 36828.00;
      const netValue = Number(foundJe?.netValue || foundJe?.amount) || 34100.00;
      const taxAmount = Number(foundJe?.taxAmount) || 2728.00;
      const cogs = Number(foundJe?.cogs) || (foundJe?.amount ? Math.round(Number(foundJe.amount) * 0.65 * 100) / 100 : 23870.00);
      const customerPayer = foundJe?.customer || foundJe?.payer || 'USCU_S03';

      const salesOrderVal = foundJe?.orderId || "0000006338";
      const deliveryVal = foundJe?.deliveryId || "0080006580";
      const invDocIdProp = foundJe?.invoiceId || "0090005794";

      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 bg-white">
          <div className="border border-slate-200 rounded-2xl shadow-md p-5 relative overflow-hidden bg-slate-50/20">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2.5 pb-4 border-b border-slate-150 mb-4">
              <div>
                <span className="text-[8px] bg-[#002f5a] text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase">FB03 Journal Entry</span>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Journal Entry Ledger: {docId}</h2>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase">Fiscal Year: 2026 &bull; Company Code: 1000 &bull; Ledger: OL (Leading)</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.75 bg-green-100 text-green-800 border border-green-250 font-black uppercase text-[9px] rounded-full">
                  Cleared & Posted
                </span>
              </div>
            </div>

            {/* Accounts Ledgers Debit Credit mapping table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm scroll-x">
              <table className="w-full text-left border-collapse text-[11px] font-semibold">
                <thead>
                  <tr className="bg-slate-900 text-white text-[8px] uppercase tracking-wider font-black">
                    <th className="p-3">Line</th>
                    <th className="p-3">G/L Account</th>
                    <th className="p-3">Account Description</th>
                    <th className="p-3 text-right">Debit Posting</th>
                    <th className="p-3 text-right">Credit Posting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-3">001</td>
                    <td className="p-3 font-bold text-indigo-700">140000</td>
                    <td className="p-3 text-slate-800 font-bold font-sans">Receivables Customer Master ({customerPayer})</td>
                    <td className="p-3 text-right font-black text-slate-900">{invoiceAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="p-3">002</td>
                    <td className="p-3 font-bold text-indigo-700">800000</td>
                    <td className="p-3 text-slate-800 font-bold font-sans">Domestic Sales Revenues (Domestic Group)</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-black text-slate-900">{netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="p-3">003</td>
                    <td className="p-3 font-bold text-indigo-700">810000</td>
                    <td className="p-3 text-slate-800 font-bold font-sans">Output Tax Liab Collection (MWST Tax Code A1)</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-black text-slate-700">{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="p-3">004</td>
                    <td className="p-3 font-bold text-indigo-700">400000</td>
                    <td className="p-3 text-slate-800 font-bold font-sans">Cost of Goods Sold (VPRS valuation)</td>
                    <td className="p-3 text-right font-black text-slate-900">{cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="p-3">005</td>
                    <td className="p-3 font-bold text-indigo-700">120000</td>
                    <td className="p-3 text-slate-800 font-bold font-sans">Inbound/Outbound Inventory Clearing Asset</td>
                    <td className="p-3 text-right text-slate-300">-</td>
                    <td className="p-3 text-right font-black text-slate-700">{cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-150 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span>HANA Universal Journal reference: [ACDOCA_NODE_9042]</span>
              <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Balanced Asset Match: COMMIT_WORK OK
              </span>
            </div>

            {renderSharedDocumentFlowExplorer(salesOrderVal, deliveryVal, invDocIdProp, docId, 'journal_entry')}
          </div>
        </div>
      );
    }

    if (activeTab.type === 'business_partner') {
      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50">
          <BusinessPartnerForm />
        </div>
      );
    }

    if (activeTab.type === 'material') {
      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50">
          <MaterialMasterForm />
        </div>
      );
    }

    if (activeTab.type === 'purchase_order') {
      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50">
          <PurchaseOrderForm />
        </div>
      );
    }

    if (activeTab.type === 'freight_order') {
      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50 font-sans">
          <FreightOrderForm />
        </div>
      );
    }

    if (activeTab.type === 'idoc') {
      const currentStatus = activeIdocData?.currentStatus || '51';
      const isSuccess = currentStatus === '53' || currentStatus === '03' || currentStatus === '68';
      const isOutbound = activeTab.docId.endsWith('56019') || activeTab.docId.endsWith('56001') || activeIdocData?.direction === 'Outbound';
      
      const statuscolorClass = isSuccess
        ? 'bg-emerald-600 text-white border border-emerald-550'
        : currentStatus === '02'
          ? 'bg-rose-600 text-white border border-rose-500' 
          : 'bg-amber-500 text-slate-950 font-black';
      
      const statusDesc = currentStatus === '03'
        ? 'Status 03: Data Passed to Port OK (Handshake Active)'
        : currentStatus === '53'
          ? 'Status 53: Application Document Posted (Success)'
          : currentStatus === '68'
            ? 'Status 68: Error Status Deleted / Reprocessed'
            : currentStatus === '02'
              ? 'Status 02: Error Passing Data to Port'
              : 'Status 51: Application Document Not Posted';

      const showSelfFix = !isSuccess && (activeTab.docId.endsWith('56019') || activeTab.docId.endsWith('56001') || activeTab.docId.endsWith('21044') || activeTab.docId.endsWith('1002') || activeTab.docId.endsWith('1012'));

      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50 font-sans space-y-4 text-left">
          {/* Header Card */}
          <div className={`${isSuccess ? 'bg-[#0f2d21] border-[#1b5e3a]' : 'bg-slate-900 border-slate-800'} text-white rounded-2xl p-5 border shadow-xl space-y-3 animate-in fade-in zoom-in-95`}>
            <div className="flex justify-between items-center">
              <span className={`text-[9px] ${statuscolorClass} font-black px-2.5 py-0.75 rounded-full uppercase tracking-wider font-mono`}>
                {statusDesc}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">T-Code: BD87</span>
            </div>
            <h3 className="text-base font-black tracking-tight uppercase flex items-center">
              <i className={`fas ${isSuccess ? 'fa-check-circle text-emerald-500' : 'fa-file-invoice-dollar text-amber-550'} mr-2`}></i> 
              IDoc Number: {activeTab.docId || '0000000010045211'}
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {activeIdocData?.errorMessage || (isSuccess 
                ? 'Reprocessing successfully resolved transaction queues and posted documents.' 
                : isOutbound 
                  ? 'Error passing data to port (Port connection or RFC link failure: RFC Destination S4LOCAL_RFC does not exist).' 
                  : 'Application document not posted: G/L Account 410000 requires valid Cost Center CC-1000 assignment under SPRO.')}
            </p>
          </div>

          {/* S/4HANA Write-Back Security Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="text-xs space-y-1">
              <p className="font-extrabold uppercase tracking-wide text-amber-950">SAP S/4HANA Write-Back Security Note</p>
              <p className="font-medium text-slate-700 leading-relaxed">
                The connected <strong className="text-amber-950 font-black">S8H Client 100 Live System</strong> utilizes a secure, read-only OData channel for IDoc queries. Core database tables (<strong className="font-semibold text-slate-800">EDIDC</strong> / <strong className="font-semibold text-slate-800">EDIDS</strong>) are kernel-locked to external HTTP writes. 
                All reprocessing actions (BD87/WE19) and manual overrides are simulated and stored locally within your secure <strong className="font-semibold text-slate-800">Agentic Copilot Workspace</strong> for mapping validation and analysis.
              </p>
            </div>
          </div>

          {/* Reprocessing Terminal Progress Overlay */}
          {reprocessing && (
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 max-h-48 overflow-y-auto no-scrollbar shadow-inner animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Live SAP BD87 Reprocessing Stream...</span>
              </div>
              {reprocessLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  <span className="text-slate-500">[{new Date().toLocaleTimeString([], {hour12:false})}]</span> {log}
                </div>
              ))}
            </div>
          )}
          {(activeTab.docId.endsWith('1002') || activeTab.docId.endsWith('1012')) ? (() => {
            const is1012 = activeTab.docId.endsWith('1012');
            const dynamicOrderId = is1012 ? '000000600085' : '000000600080';
            const dynamicEnteredDate = is1012 ? '2019-02-27' : '2019-02-25';
            const dynamicEnterTime = is1012 ? '16:44:42' : '10:56:20';
            const dynamicEnteredDateRaw = is1012 ? '20190227' : '20190225';
            const dynamicEnterTimeRaw = is1012 ? '164442' : '105620';
            const dynamicRespcctr = is1012 ? '' : '0017101301';
            const dynamicRootCauseStr = is1012 
              ? 'Lacks Cost Center mapping rule configured inside Customizing tables under operational Segment 1000 for G/L Account 410000. Additionally, the mandatory segment element RESPCCTR in segment E1BP2075_MASTERDATA_ALE is completely empty/blank, violating standard ALE integration structure validation rules.'
              : 'Lacks Cost Center mapping rule configured inside Customizing tables under operational Segment 1000 for G/L Account 410000.';
            const dynamicHowToFixStr = is1012
              ? 'Configure SPRO customizing mapping rules (G/L Account 410000 -> Cost Center CC-1000) inside customizing tables J_1B_MD_GL_CC, then execute standard BD87 reprocess transaction.'
              : 'Register SPRO mapping associating G/L Account 410000 to Cost Center CC-1000 (linked to responsible CC 0017101301).';
            const dynamicProposalStr = is1012
              ? 'Inject customizing SPRO mapping (Account 410000 -> Cost Center CC-1000) to clear missing indicators and execute WE19/BD87 equivalent reprocessing.'
              : 'Inject SPRO mapping Account 410000 -> Cost Center CC-1000 inside customizing table J_1B_MD_GL_CC.';

            return (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-6">
                <div className="border-b pb-3">
                  <span className="text-[10px] font-black text-[#002f5a] uppercase tracking-widest block mb-1">
                    SAP WE02 / BD87 Forensic Dual-Pane Analyzer
                  </span>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    IDoc Structure Tree & Technical Specification
                  </h4>
                </div>

                {/* Technical Information Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-[11px] font-bold">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b pb-1.5 flex items-center justify-between">
                    <span>Short Technical Information</span>
                    <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full ${isSuccess ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                      {isSuccess ? 'POSTED SUCCESS (53)' : 'STATUS ERROR (51)'}
                    </span>
                  </h5>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-slate-700">
                    <div>Direction: <span className="text-slate-950 font-black">2 (Inbound / Inbox)</span></div>
                    <div>Current Status: <span className={`font-black ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>{isSuccess ? '53' : '51'}</span></div>
                    <div>Basic Type: <span className="text-slate-950 font-black">INTERNAL_ORDER01</span></div>
                    <div>Extension: <span className="text-slate-400 italic">None</span></div>
                    <div>Message Type: <span className="text-indigo-600 font-extrabold">INTERNAL_ORDER</span></div>
                    <div>Partner No.: <span className="text-slate-950 font-black">S4HCLNT100</span></div>
                    <div>Partner Type: <span className="text-slate-950 font-black">LS (Logical System)</span></div>
                    <div>Port: <span className="text-slate-950 font-black">SAPS4H</span></div>
                    <div>Creation Date: <span className="text-slate-950 font-black">{dynamicEnteredDate}</span></div>
                    <div>Creation Time: <span className="text-slate-950 font-black">{dynamicEnterTime}</span></div>
                  </div>
                </div>

                {/* Dual Pane Segment Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  
                  {/* Left Pane - Data Records Tree */}
                  <div className="md:col-span-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="bg-[#002f5a] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 flex items-center justify-between">
                      <span>Data Records Tree</span>
                      <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded font-mono">6 Records</span>
                    </div>
                    <div className="p-2.5 space-y-1 font-mono text-[10.5px] font-bold text-slate-600">
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-150 text-emerald-950 cursor-pointer">
                        <i className="far fa-folder-open text-emerald-600"></i>
                        <span>E1BP2075_MASTERDATA_ALE [0001]</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer pl-6">
                        <i className="far fa-file-alt text-slate-400"></i>
                        <span>E1BP2075_STATUSHEADER_ALE [0002]</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer pl-6">
                        <i className="far fa-file-alt text-slate-400"></i>
                        <span>E1BP2075_OBJECTSTATUS_ALE [0003]</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer pl-6">
                        <i className="far fa-file-alt text-slate-400"></i>
                        <span>E1BP2075_OBJECTSTATUS_ALE [0004]</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer pl-6">
                        <i className="far fa-file-alt text-slate-400"></i>
                        <span>E1BP2075_OBJECTSTATUS_ALE [0005]</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer pl-6">
                        <i className={`far ${is1012 && !isSuccess ? 'fa-exclamation-circle text-amber-500' : 'fa-file-alt text-slate-400'}`}></i>
                        <span className={is1012 && !isSuccess ? 'text-amber-700 font-extrabold' : ''}>
                          E1BP2075_OBJECTSTATUS_ALE [0006] {is1012 && !isSuccess && ' (Error Key)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Pane - Content of Selected Segment */}
                  <div className="md:col-span-3 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-100 text-slate-750 text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 border-b flex justify-between">
                      <span>Selected Segment Fields (Actual Detail)</span>
                      <span className="text-slate-500 font-bold font-mono">14 Fields</span>
                    </div>
                    <div className="overflow-x-auto max-h-72 overflow-y-auto no-scrollbar">
                      <table className="w-full text-left font-mono text-[10.5px] font-bold">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] font-black border-b select-none">
                            <th className="px-3.5 py-2">Field Name</th>
                            <th className="px-3.5 py-2">Field Content</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">ORDERID</td>
                            <td className="px-3.5 py-1.5 text-indigo-700 font-black">{dynamicOrderId}</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">ORDER_TYPE</td>
                            <td className="px-3.5 py-1.5 text-slate-850">Y600</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">ORDER_CATG</td>
                            <td className="px-3.5 py-1.5 text-slate-850">01</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">SHORT_TEXT</td>
                            <td className="px-3.5 py-1.5 text-slate-850 font-semibold italic">SAP implementation {is1012 ? '1012' : ''}</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">ENTERED_BY</td>
                            <td className="px-3.5 py-1.5 text-slate-850">S4H_CO_DEM</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">ENTERED_DATE</td>
                            <td className="px-3.5 py-1.5 text-slate-850">{dynamicEnteredDateRaw}</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">ENTER_TIME</td>
                            <td className="px-3.5 py-1.5 text-slate-850">{dynamicEnterTimeRaw}</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">CHANGE_DATE</td>
                            <td className="px-3.5 py-1.5 text-slate-400">00000000</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">CHANGE_TIME</td>
                            <td className="px-3.5 py-1.5 text-slate-400">000000</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">CO_AREA</td>
                            <td className="px-3.5 py-1.5 text-slate-850">A000</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">COMP_CODE</td>
                            <td className="px-3.5 py-1.5 text-slate-850">1710</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">PROFIT_CTR</td>
                            <td className="px-3.5 py-1.5 text-slate-850">YB110</td>
                          </tr>
                          <tr className={is1012 && !isSuccess ? "bg-amber-50/40 text-amber-950 font-black border-y border-amber-200" : "bg-blue-50/20"}>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">RESPCCTR</td>
                            <td className="px-3.5 py-1.5 text-indigo-700 font-black flex items-center justify-between">
                              {is1012 && !isSuccess ? (
                                <span className="text-amber-700 font-extrabold flex items-center gap-1">
                                  <i className="fas fa-exclamation-triangle text-amber-500"></i>
                                  <span>[BLANK / MISSING VALUE]</span>
                                </span>
                              ) : (
                                <span>{isSuccess ? '0017101301' : dynamicRespcctr}</span>
                              )}
                              <span className={`text-[8px] ${is1012 && !isSuccess ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'} font-black px-1.5 py-0.5 rounded tracking-wide uppercase`}>
                                {is1012 && !isSuccess ? 'MANDATORY FIELD BLANK' : 'RESPONSIBLE Cost Center'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-1.5 text-slate-900 font-extrabold">REQUEST_COMP_CODE</td>
                            <td className="px-3.5 py-1.5 text-slate-850">1710</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Diagnostics Summary Box (Root Cause & How to fix asked by user) */}
                <div className="bg-[#FFFBEB] border border-amber-250 p-4 rounded-xl space-y-3 font-sans">
                  <div className="flex items-center gap-1.5 font-black text-[#854D0E] uppercase text-[10px] tracking-wider">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Forensic Diagnosis & Resolution Rules</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="space-y-1">
                      <span className="font-extrabold text-[#002f5a] uppercase text-[9px] tracking-wider block">Root Cause</span>
                      <p className="text-slate-700 leading-relaxed">
                        {dynamicRootCauseStr}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-extrabold text-[#002f5a] uppercase text-[9px] tracking-wider block">How To Fix It</span>
                      <p className="text-slate-700 leading-relaxed">
                        {dynamicHowToFixStr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Self-Healing Operator Proposal Action Panel */}
                {showSelfFix && (
                  <div className="p-4 bg-indigo-50 border border-indigo-250 rounded-2xl space-y-2.5 animate-in slide-in-from-bottom-2 fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 uppercase tracking-wide">
                      <i className="fas fa-shield-alt text-[#002f5a]"></i>
                      <span>AI Self-Healing Operator Portal</span>
                    </div>
                    <p className="text-[10.5px] text-slate-650 font-medium leading-relaxed">
                      The central AI system has mapped a verified self-heal path with <strong>98% confidence</strong> to fix this custom configuration in the SPRO tables.
                    </p>
                    <div className="bg-white/80 border border-indigo-100 rounded-xl p-2.5 text-[10px] font-mono text-indigo-900 leading-relaxed font-bold">
                      <strong>Proposal:</strong> {dynamicProposalStr}
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        disabled={reprocessing}
                        onClick={() => handleSelfHealIdoc(activeTab.docId)}
                        className="bg-[#002f5a] hover:bg-slate-900 text-white font-black text-[10px] px-4 py-2.5 rounded-xl uppercase active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <i className="fas fa-magic text-[8px]"></i> Approve & Execute Auto-Fix (Self-Healing)
                      </button>
                    </div>
                  </div>
                )}

                {/* Core Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-4">
                  <button 
                    disabled={reprocessing}
                    onClick={() => handleReprocessIdoc(activeTab.docId)}
                    className="bg-indigo-700 text-white font-black text-[10px] p-3 rounded-xl uppercase hover:bg-slate-900 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <i className="fas fa-play text-[8px]"></i> Force Reprocess IDoc (BD87)
                  </button>
                  <button 
                    disabled={reprocessing}
                    onClick={() => alert(`WE19 Test Tool interface successfully loaded for IDoc ${activeTab.docId}`)}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-750 font-black text-[10px] p-3 rounded-xl uppercase active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <i className="fas fa-edit text-[8px]"></i> Test Tool Segment Editor (WE19)
                  </button>
                </div>
              </div>
            );
          })() : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4">
              <h4 className="text-xs font-black text-[#002f5a] uppercase tracking-wider border-b pb-2">
                {isOutbound ? 'Outbound Segment Tree (INTERNAL_ORDER)' : 'Inbound Segment Tree Mapping (E1EDK01)'}
              </h4>
              
              <div className="space-y-2 text-[11px] font-mono font-bold text-slate-755">
                {isOutbound ? (
                  <div className={`p-3 border rounded-xl space-y-2.5 ${isSuccess ? 'bg-emerald-50/50 border-emerald-150' : 'bg-red-50/65 border-red-150'}`}>
                    <div className={`flex justify-between items-center text-[10px] font-black ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                      <span>Segment: E1B2P2075_STATUSHEADER_ALE (Outbound Core)</span>
                      <span>{isSuccess ? '✓ Port handshake successful' : '⚠ Port Dispatch Failed'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-650 pt-1 text-[10.5px]">
                      <div>Direction: <span className="text-slate-950 font-extrabold">1 (Outbox)</span></div>
                      <div>Port: <span className="text-slate-950 font-extrabold">A000000002</span></div>
                      <div>Partner: <span className="text-indigo-700 font-extrabold">S4LOCAL (LS)</span></div>
                      <div>Basic Type: <span className="text-slate-950 font-extrabold">INTERNAL_ORDER01</span></div>
                      <div>Message Type: <span className="text-slate-950 font-extrabold">INTERNAL_ORDER</span></div>
                      <div>Total Segments: <span className="text-slate-950 font-extrabold">000004</span></div>
                    </div>
                    <p className={`text-[10px] leading-relaxed font-bold italic border-t pt-1.5 mt-1 ${isSuccess ? 'text-emerald-650 border-emerald-100' : 'text-red-655 border-red-200/50'}`}>
                      {isSuccess 
                        ? 'No issues. RFC Destination S4LOCAL_RFC is verified online and port communication is functional.'
                        : 'Root Cause: The outbound IDoc transfer to port A000000002 failed because the target RFC destination "S4LOCAL_RFC" is not configured or offline in SM59 (Port connection failure).'}
                    </p>
                  </div>
                ) : (
                  <div className={`p-3 border rounded-xl space-y-1.5 ${isSuccess ? 'bg-emerald-50/50 border-emerald-150' : 'bg-red-50/65 border-red-150'}`}>
                    <div className={`flex justify-between items-center text-[10px] font-black ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                      <span>Segment: E1EDP01 (Item Cost Distribution Segment)</span>
                      <span>{isSuccess ? '✓ Mapping Resolved' : '⚠ Mapping Failed'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-655 pt-1">
                      <div>Field G_L_ACC (G/L Account): <span className="text-slate-900">410000 (Internal Expense)</span></div>
                      <div>Field KOSTL (Cost Center): <span className="text-indigo-700">{isSuccess ? 'CC-1000' : 'MISSING'}</span></div>
                    </div>
                    <p className={`text-[10px] leading-relaxed font-semibold italic ${isSuccess ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isSuccess 
                        ? 'No issues. SPRO cost center rule successfully applied (Account 410000 &rarr; Cost Center CC-1000).'
                        : 'Root Cause: G/L Account 410000 requires active SPRO mapping to a Cost Center under Segment 1000.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Self-Healing Operator Proposal Action Panel */}
              {showSelfFix && (
                <div className="p-4 bg-indigo-50 border border-indigo-200/80 rounded-2xl space-y-2.5 animate-in slide-in-from-bottom-2 fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 uppercase tracking-wide">
                    <i className="fas fa-shield-alt text-[#002f5a]"></i>
                    <span>AI Self-Healing Operator Portal</span>
                  </div>
                  <p className="text-[10.5px] text-slate-650 font-medium leading-relaxed">
                    The system has identified a verified self-heal path with <strong>{activeTab.docId.endsWith('21044') ? '98%' : '99%'} confidence</strong>. 
                    Would you like to approve and auto-correct the S/4HANA configurations immediately?
                  </p>
                  <div className="bg-white/85 border border-indigo-100 rounded-xl p-2.5 text-[10px] font-mono text-indigo-900 leading-relaxed font-bold">
                    <strong>Proposal:</strong> {isOutbound 
                      ? 'Autonomously provision SM59 RFC Destination "S4LOCAL_RFC" to establish a local loopback link and clear the port queue.' 
                      : 'Inject SPRO mapping: G/L Account 410000 &rarr; Cost Center CC-1000 inside customizing table index J_1B_MD_GL_CC.'}
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      disabled={reprocessing}
                      onClick={() => handleSelfHealIdoc(activeTab.docId)}
                      className="bg-[#002f5a] hover:bg-slate-900 text-white font-black text-[10px] px-4 py-2.5 rounded-xl uppercase active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <i className="fas fa-magic text-[8px]"></i> Approve & Execute Auto-Fix (GRC)
                    </button>
                  </div>
                </div>
              )}

              {/* Core Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button 
                  disabled={reprocessing}
                  onClick={() => handleReprocessIdoc(activeTab.docId)}
                  className="bg-indigo-700 text-white font-black text-[10px] p-3 rounded-xl uppercase hover:bg-slate-900 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-play text-[8px]"></i> Force Reprocess IDoc (BD87)
                </button>
                <button 
                  disabled={reprocessing}
                  onClick={() => alert(`WE19 Test Tool interface successfully loaded for IDoc ${activeTab.docId || '0000000010045211'}`)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-350 text-slate-750 font-black text-[10px] p-3 rounded-xl uppercase active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-edit text-[8px]"></i> Test Tool Segment Editor (WE19)
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab.type === 'workflow') {
      return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50 text-left">
          <WorkflowInboxForm params={{ taskId: activeTab.docId, value: activeTab.title }} />
        </div>
      );
    }

    if (activeTab.type === 'basis_admin') {
      return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50">
          <BasisAdminForm tcode={activeTab.activeTCode} />
        </div>
      );
    }

    // Default form sandbox wrapper
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-slate-50">
        <GenericInteractiveForm data={{ tcode: activeTab.activeTCode, docId: activeTab.docId }} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 border border-slate-300 rounded-l-none relative select-none" id="sap-embedded-frame-root">
      
      {/* 1. Header Toolbar Tabs */}
      <div className="bg-[#111827] text-white flex justify-between items-center px-4 py-2 shrink-0 border-b border-slate-800">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar max-w-[80%]">
          {tabs.map((tab) => (
            <div 
              key={tab.id}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all duration-150 cursor-pointer ${
                tab.id === activeTabId 
                  ? 'bg-[#002f5a] text-white shadow font-extrabold border border-indigo-400/40' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              onClick={() => onActivateTab(tab.id)}
            >
              <FileCode className="w-3 h-3 text-indigo-400" />
              <span className="truncate max-w-[120px]">{tab.title}</span>
              {tabs.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="text-slate-500 hover:text-red-400 ml-1 rounded-full p-0.5 hover:bg-slate-700"
                  title="Close Tab"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
          
          <button 
            onClick={() => onAddTab({ title: 'Fiori Launchpad', url: 'https://ui.s4hana.ondemand.com/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html', type: 'fiori', docId: '', activeTCode: 'FLP' })}
            className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Open New Fiori Workspace"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preset controls */}
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[9px] font-black uppercase">
            <button 
              onClick={() => presetSplit(50)}
              className={`px-2 py-1 rounded transition duration-150 ${sapPanelWidth >= 48 && sapPanelWidth <= 52 ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-slate-300'}`}
              title="Set screen split 50/50"
            >
              50/50
            </button>
            <button 
              onClick={() => presetSplit(75)}
              className={`px-2 py-1 rounded transition duration-150 ${sapPanelWidth >= 73 && sapPanelWidth <= 77 ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-slate-300'}`}
              title="Set screen split 75/25"
            >
              75%
            </button>
            <button 
              onClick={() => presetSplit(95)}
              className={`px-2 py-1 rounded transition duration-150 ${sapPanelWidth >= 93 ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-slate-300'}`}
              title="Set split full screen"
            >
              Full
            </button>
          </div>
          
          <button 
            onClick={onClosePanel}
            className="text-slate-400 hover:text-red-400 hover:bg-slate-800 p-1 rounded transition cursor-pointer"
            title="Minimize SAP Workspace"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Command Code bar and Address details bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-1.5 px-4 flex justify-between items-center gap-4 shrink-0 text-xs">
        
        {/* Left command box VA03/VF03 Command Bar */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleBack} 
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleForward} 
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
              title="Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRefresh} 
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer animate-hover hover:animate-spin"
              title="Refresh Screen"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          
          {/* SAP command field */}
          <form onSubmit={handleCommandSubmit} className="flex items-center bg-[#0F172A] border border-slate-700/80 rounded px-2 py-0.5 max-w-[150px]">
            <Terminal className="w-3.5 h-3.5 text-blue-400 mr-1 shrink-0" />
            <input 
              type="text" 
              value={commandValue}
              onChange={(e) => setCommandValue(e.target.value)}
              placeholder="Command / t-code" 
              className="bg-transparent text-white font-mono font-black outline-none text-[10.5px] w-24 shrink-0 uppercase tracking-widest placeholder-slate-600"
              title="Type transaction code and press enter (e.g. VA01, VF03, BP)"
            />
          </form>
        </div>

        {/* Breadcrumb address */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-slate-850 rounded text-[9.5px] font-mono tracking-wide text-slate-400 flex-1 border border-slate-800/50">
          <span className="text-blue-400 font-extrabold font-sans">S8H</span>
          <span>/</span>
          <span className="font-bold">CLIENT 100</span>
          <span>/</span>
          <span className="truncate max-w-[300px]">{currentUrl || 'SIMULATOR_SANDBOX'}</span>
        </div>

        {/* SandBox / Live Router toggles */}
        <div className="flex bg-[#0F172A] text-[9.5px] font-black uppercase tracking-tight p-0.5 rounded border border-slate-700">
          <button 
            onClick={() => setConnectionMode('sandbox')}
            className={`px-2 py-0.75 rounded cursor-pointer transition ${connectionMode === 'sandbox' ? 'bg-[#002f5a] text-white shadow-sm' : 'text-slate-400 hover:text-slate-350'}`}
          >
            💻 GUI Simulator
          </button>
          <button 
            onClick={() => setConnectionMode('live')}
            className={`px-2 py-0.75 rounded cursor-pointer transition ${connectionMode === 'live' ? 'bg-[#002f5a] text-white shadow-sm' : 'text-slate-400 hover:text-slate-350'}`}
          >
            🌐 Live Gateway
          </button>
        </div>

      </div>

      {/* 3. Main content frame */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-white">
        
        {connectionMode === 'live' ? (
          <div className="flex-1 flex flex-col relative h-full">
            {/* Live sandbox status check inside connection panel */}
            <div className="bg-blue-50 border-b border-blue-150 py-1 px-4 text-[9px] font-black uppercase text-blue-700 tracking-wider flex items-center justify-between shadow-inner shrink-0">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Cross-Origin SSO assertion ticket activated inside STUDENT069 gateway
              </span>
              <span className="bg-blue-600 text-white px-1.5 py-0.25 rounded font-mono">Active SSO Route</span>
            </div>
            
            {/* Real iframe frame */}
            <iframe 
              key={iframeKey}
              src={currentUrl || 'https://mmc-s4sap11.mmc.1stbasis.com:44300/sap/bc/ui2/flp?sap-client=100&sap-language=EN'}
              className="flex-1 w-full h-full border-0 bg-white"
              title="SAP Official S4HANA Connection Gateway Frame"
            />

            {/* Absolute Fallback prompt overlay for frame blockers */}
            {showFrameWarning && (
              <div className="absolute bottom-4 right-4 bg-slate-900/95 text-white p-3.5 rounded-2xl border border-slate-705 shadow-2.5xl backdrop-blur-md max-w-xs space-y-2.5 animate-in slide-in-from-bottom-2 z-50 text-left">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animation-pulse" /> Frame Block Warning
                  </span>
                  <button 
                    onClick={() => setShowFrameWarning(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-all cursor-pointer"
                    title="Dismiss Warning"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-350 leading-relaxed font-semibold">
                  If the live S/4HANA OData system blocks frame nesting on your network, use the <strong className="text-white">GUI Simulator</strong> tab or open the gateway directly in a new tab:
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => {
                      setConnectionMode('sandbox');
                    }}
                    className="block w-full text-center bg-[#002f5a] hover:bg-[#003f75] hover:text-white text-white border border-blue-500/35 font-black uppercase text-[9.5px] p-2 rounded-lg py-2 shadow transition active:scale-95 cursor-pointer"
                  >
                    💻 Switch to GUI Simulator
                  </button>
                  <a 
                    href={currentUrl || 'https://mmc-s4sap11.mmc.1stbasis.com:44300/sap/bc/ui2/flp?sap-client=100&sap-language=EN'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block text-center bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[9.5px] p-2 rounded-lg py-2 shadow transition active:scale-95"
                  >
                    Open Gateway directly ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          renderSimulatedContent()
        )}

      </div>

      {/* 4. Footer bar */}
      <div className="bg-[#1F2937] text-slate-450 border-t border-slate-800 text-[8.5px] py-1 px-4 flex items-center justify-between shrink-0 font-medium font-sans">
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-emerald-500" /> Connecting Profile: <strong className="text-slate-300 font-extrabold">STUDENT069@PROD-S8H:100</strong>
        </span>
        <span className="font-mono text-slate-400 font-black">
          {connectionMode === 'live' ? 'S8H FIREWALL SSL GATEWAY LIVE' : 'ADI HIGH-FIDELITY SAP SIMULATOR (100% OK)'}
        </span>
      </div>

    </div>
  );
};
