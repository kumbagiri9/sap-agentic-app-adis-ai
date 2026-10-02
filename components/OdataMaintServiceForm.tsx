import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Play, 
  Check, 
  Activity, 
  Terminal, 
  Settings, 
  Layers, 
  ShieldCheck,
  Server,
  ToggleLeft,
  ToggleRight,
  Radio,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ADDITIONAL_RAW_SERVICES } from './sapOdataServicesData';
import { ADDITIONAL_RAW_SERVICES_2 } from './sapOdataServicesData2';
import { ADDITIONAL_RAW_SERVICES_3 } from './sapOdataServicesData3';

interface ODataServiceConfig {
  service: string;
  entity: string;
  label: string;
  description: string;
  version: string;
  alias: string;
  icfStatus: 'Green' | 'Red';
  v2v4: 'v2' | 'v4';
}

const REGISTERED_SERVICES: ODataServiceConfig[] = [
  { 
    service: 'API_OUTBOUND_DELIVERY_SRV', 
    entity: 'A_OutbDeliveryHeader', 
    label: 'Outbound Delivery API', 
    description: 'Enables outbound delivery scheduling, picking, and PGI synchronization across warehouses.',
    version: '0001', 
    alias: 'S8H_CLNT100', 
    icfStatus: 'Green', 
    v2v4: 'v2' 
  },
  { 
    service: 'API_SALES_ORDER_SRV', 
    entity: 'A_SalesOrder', 
    label: 'Sales Order API', 
    description: 'Supports full lifecycle sales orders processing, reservation, pricing condition injection, and credit checks.',
    version: '0001', 
    alias: 'S8H_CLNT100', 
    icfStatus: 'Green', 
    v2v4: 'v2' 
  },
  { 
    service: 'API_BILLING_DOCUMENT_SRV', 
    entity: 'A_BillingDocument', 
    label: 'Billing Document (Invoice) API', 
    description: 'Enables customer billing document extraction, domestic tax mappings, and invoice posting verification.',
    version: '0001', 
    alias: 'S8H_CLNT100', 
    icfStatus: 'Green', 
    v2v4: 'v2' 
  },
  { 
    service: 'API_MATERIAL_STOCK_SRV', 
    entity: 'A_MaterialStock', 
    label: 'Material Stock Inventory API', 
    description: 'Live physical material balances, batch details, and reorder threshold parameters extraction.',
    version: '0001', 
    alias: 'S8H_CLNT100', 
    icfStatus: 'Green', 
    v2v4: 'v2' 
  },
  { 
    service: 'API_BUSINESS_PARTNER', 
    entity: 'A_BusinessPartner', 
    label: 'Business Partner Directory API', 
    description: 'Extracts customer accounts, credit classifications, supplier address cards, and billing roles.',
    version: '0001', 
    alias: 'S8H_CLNT100', 
    icfStatus: 'Green', 
    v2v4: 'v2' 
  },
  {
    service: 'API_SLSPRICINGCONDITIONRECORD_SRV',
    entity: 'A_SlsPrcgConditionRecord',
    label: 'Sales Pricing Condition Record API',
    description: 'Retrieves and maintains SD pricing condition records used for customer/material pricing and discounts.',
    version: '0001',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  },
  {
    service: 'API_CUSTOMER_RETURNS_SRV',
    entity: 'A_CustomerReturn',
    label: 'Customer Returns API',
    description: 'Supports customer returns document processing, status tracking, and return-related document flow.',
    version: '0001',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  },
  { 
    service: 'API_CUSTOMER_INVOICE_SRV', 
    entity: 'A_CustomerInvoice', 
    label: 'Customer Financial Invoices API', 
    description: 'Exposes financial sub-ledger receivables balances, matching open items against general ledger postings.',
    version: '0001', 
    alias: 'S8H_CLNT100', 
    icfStatus: 'Green', 
    v2v4: 'v2' 
  },
  {
    service: 'API_IDOC_PROCESS_SRV',
    entity: 'A_IDoc',
    label: 'IDoc Processing API',
    description: 'Coordinates inbound and outbound Intermediate Documents (IDocs) monitoring, reprocessing, and self-healing.',
    version: '0001',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  },
  {
    service: 'API_PRODUCT_SRV',
    entity: 'A_Product',
    label: 'Product Master API',
    description: 'Exposes product catalog information, stock keeping units (SKUs), and storage dimensions from Material Master.',
    version: '0001',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  },
  {
    service: 'API_COMPANYCODE_SRV',
    entity: 'A_CompanyCode',
    label: 'Company Code API',
    description: 'Retrieves financial organizational units, local currency configurations, and general ledger chart of accounts.',
    version: '0001',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  },
  {
    service: 'API_PURCHASEREQ_PROCESS_SRV',
    entity: 'A_PurchaseRequisition',
    label: 'Purchase Requisition Process API',
    description: 'Supports creating and querying procurement purchase requisitions, supplier item demands, and release workflows.',
    version: '0001',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  },
  {
    service: 'API_PURCHASEORDER_PROCESS_SRV',
    entity: 'A_PurchaseOrder',
    label: 'Purchase Order Process API',
    description: 'Enables complete purchase order lifecycle management, line items, pricing conditions, and goods receipt tracking.',
    version: '0001',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  },
  {
    service: 'API_BUSINESS_PARTNER_SRV',
    entity: 'A_BusinessPartner',
    label: 'Business Partner Directory API (Legacy Alias)',
    description: 'Legacy alias retained for compatibility where Business Partner APIs are referenced with _SRV suffix.',
    version: '0002',
    alias: 'S8H_CLNT100',
    icfStatus: 'Green',
    v2v4: 'v2'
  }
];

// Dynamically construct and enrich additional services from our imports
const buildFullServicesList = (): ODataServiceConfig[] => {
  const list = [...REGISTERED_SERVICES];
  const existingSet = new Set(list.map(s => s.service));
  const rawList = [
    ...ADDITIONAL_RAW_SERVICES,
    ...ADDITIONAL_RAW_SERVICES_2,
    ...ADDITIONAL_RAW_SERVICES_3
  ];

  rawList.forEach(serviceName => {
    if (serviceName && !existingSet.has(serviceName)) {
      let entity = 'A_DataEntity';
      let cleanLabel = serviceName
        .replace(/_SRV$/, '')
        .replace(/_CDS$/, '')
        .split('_')
        .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
        .join(' ');
      let label = `${cleanLabel} API`;
      let description = `Standard SAP Gateway OData API exposing operational, transactional, and catalog database entity structures of ${serviceName}.`;

      if (serviceName.endsWith('_CDS') || serviceName.startsWith('C_') || serviceName.startsWith('I_') || serviceName.startsWith('UI_')) {
        entity = serviceName.replace(/_CDS$/, '');
        label = `CDS View / Operational View (${serviceName})`;
        description = `Core Data Services (CDS) view exposed as OData service endpoint ${serviceName} for real-time reporting, analytics, and transactional processing.`;
      } else if (serviceName.includes('BP') || serviceName.includes('PARTNER') || serviceName.includes('CUSTOMER') || serviceName.includes('CUST')) {
        entity = 'A_BusinessPartner';
        label = `Business Partner Data API (${serviceName})`;
      } else if (serviceName.includes('PRODUCT') || serviceName.includes('MATERIAL') || serviceName.includes('MAT')) {
        entity = 'A_Product';
        label = `Material Master Domain API (${serviceName})`;
      } else if (serviceName.includes('ORDER') || serviceName.includes('SALES') || serviceName.includes('SD_') || serviceName.includes('PURCHASE')) {
        entity = 'A_SalesOrder';
        label = `Enterprise Orders Operations API (${serviceName})`;
      } else if (serviceName.includes('INVOICE') || serviceName.includes('BILLING') || serviceName.includes('TAX')) {
        entity = 'A_BillingDocument';
        label = `Billing & Financial Invoicing API (${serviceName})`;
      } else if (serviceName.includes('STOCK') || serviceName.includes('INVENTORY') || serviceName.includes('WAREHOUSE')) {
        entity = 'A_MaterialStock';
        label = `Inventory & Stock Ledger API (${serviceName})`;
      }

      list.push({
        service: serviceName,
        entity,
        label,
        description,
        version: '0001',
        alias: 'S8H_CLNT100',
        icfStatus: 'Green',
        v2v4: serviceName.endsWith('_CDS') ? 'v4' : 'v2'
      });
      existingSet.add(serviceName);
    }
  });

  return list;
};

const FULL_SERVICES_LIST = buildFullServicesList();

export const OdataMaintServiceForm: React.FC = () => {
  const [services, setServices] = useState<ODataServiceConfig[]>(FULL_SERVICES_LIST);
  const [selectedService, setSelectedService] = useState<ODataServiceConfig>(FULL_SERVICES_LIST[0]);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [gatewayClientOpen, setGatewayClientOpen] = useState(false);
  const [uriQuery, setUriQuery] = useState('/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV/$metadata');
  
  // Filtering and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Computations for filtering and pagination
  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return services;
    return services.filter(s => 
      s.service.toLowerCase().includes(q) || 
      (s.label && s.label.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  }, [services, searchQuery]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalItems = filteredServices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredServices, currentPage]);

  // Load initial active statuses from localStorage
  useEffect(() => {
    const states: Record<string, boolean> = {};
    FULL_SERVICES_LIST.forEach(srv => {
      if (typeof window !== 'undefined') {
        const cachedVal = localStorage.getItem(`odata_service_active_${srv.service}`);
        // Default to active unless explicitly set to inactive
        states[srv.service] = cachedVal === null ? true : cachedVal === 'true';
      } else {
        states[srv.service] = true;
      }
    });
    setActiveStates(states);
    
    setActionLog([
      `[${new Date().toLocaleTimeString()}] S8H Gateway Service Catalog connected.`,
      `[${new Date().toLocaleTimeString()}] Checked /IWFND/MAINT_SERVICE registry. All ICF routes verified.`,
    ]);
  }, []);

  const handleToggleService = (serviceName: string) => {
    setIsProcessing(true);
    const currentStatus = activeStates[serviceName] !== false;
    const nextStatus = !currentStatus;
    
    setTimeout(() => {
      const newStates = { ...activeStates, [serviceName]: nextStatus };
      setActiveStates(newStates);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`odata_service_active_${serviceName}`, nextStatus ? 'true' : 'false');
        // Dispatch custom event to notify other components of the OData status update
        window.dispatchEvent(new Event('odata_services_updated'));
      }
      
      const logMessage = nextStatus 
        ? `[${new Date().toLocaleTimeString()}] Service '${serviceName}' successfully activated on S/4HANA Gateway node S8H.`
        : `[${new Date().toLocaleTimeString()}] Service '${serviceName}' deactivated. Endpoints will fall back to local ERP simulation mode.`;
        
      setActionLog(prev => [logMessage, ...prev]);
      setIsProcessing(false);
      
      // Update selected service reference if it matches
      if (selectedService.service === serviceName) {
        setUriQuery(`/sap/opu/odata/sap/${serviceName}/$metadata`);
      }
    }, 400);
  };

  const handleVerifyICFNode = (srv: ODataServiceConfig) => {
    setIsProcessing(true);
    setTimeout(() => {
      const isActive = activeStates[srv.service] !== false;
      const logMsg = `[${new Date().toLocaleTimeString()}] ICF Node check for '${srv.service}' -> ${isActive ? 'ACTIVE & ONLINE (HTTP 200 OK)' : 'OFFLINE (HTTP 404/503 Service Inactive)'}. Ping duration: 42ms.`;
      setActionLog(prev => [logMsg, ...prev]);
      setIsProcessing(false);
    }, 300);
  };

  const handleExecuteGatewayRequest = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const serviceName = selectedService.service;
      const isActive = activeStates[serviceName] !== false;
      
      if (!isActive) {
        setTestResponse(JSON.stringify({
          error: {
            code: "IWFND/MED_RESOURCES/004",
            message: {
              lang: "en",
              value: `OData Service '${serviceName}' is INACTIVE. ICF node path is locked on /IWFND/MAINT_SERVICE gateway.`
            },
            innererror: {
              application: {
                component: "OPU-BND-ADD",
                service_id: serviceName,
                version: "0001"
              },
              transaction_id: "78F9A0C3B29140FA9C31C76542019A81",
              timestamp: new Date().toISOString()
            }
          }
        }, null, 2));
      } else {
        // Success payload
        setTestResponse(JSON.stringify({
          d: {
            __metadata: {
              id: `https://mmc-s4sap11.mmc.1stbasis.com:44300/sap/opu/odata/sap/${serviceName}`,
              type: "OData.ServiceDocument"
            },
            EntitySets: [
              selectedService.entity,
              `${selectedService.entity}Items`,
              "A_ServiceStatistics"
            ]
          }
        }, null, 2));
      }
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden font-sans text-slate-800 shadow-inner flex flex-col max-h-[80vh]">
      {/* Title & Status Header */}
      <div className="bg-slate-100 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="text-left">
          <span className="text-[8px] bg-slate-700 text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase font-mono">
            T-Code: /IWFND/MAINT_SERVICE
          </span>
          <h2 className="text-base font-black text-[#002f5a] uppercase tracking-tight flex items-center mt-1">
            <Radio className="w-4 h-4 text-sky-600 mr-1.5 animate-pulse" />
            SAP Gateway Service Maintenance
          </h2>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
            Administer and activate standard NetWeaver OData API service nodes inside S/4HANA Enterprise core.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              setIsProcessing(true);
              setTimeout(() => {
                const updatedStates: Record<string, boolean> = {};
                services.forEach(srv => {
                  updatedStates[srv.service] = true;
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(`odata_service_active_${srv.service}`, 'true');
                  }
                });
                setActiveStates(updatedStates);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('odata_services_updated'));
                }
                setActionLog(prev => [`[${new Date().toLocaleTimeString()}] Mass Activation Completed. All OData services forced to ACTIVE.`, ...prev]);
                setIsProcessing(false);
              }, 400);
            }}
            disabled={isProcessing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            Force Activate All
          </button>
          
          <button
            onClick={() => {
              setIsProcessing(true);
              setTimeout(() => {
                handleVerifyICFNode(selectedService);
              }, 200);
            }}
            disabled={isProcessing}
            className="bg-slate-700 hover:bg-slate-800 text-white font-black uppercase text-[9px] px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
          >
            Verify Node
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-y-auto flex-1">
        
        {/* Services Table List */}
        <div className="lg:col-span-2 p-4 flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-[60vh]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">
              Registered Service Catalog ({filteredServices.length} of {services.length} items)
            </h3>
            
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search service name, label..."
                className="w-full bg-white border border-slate-200 text-slate-700 placeholder-slate-400 text-[11px] rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-t-xl overflow-hidden bg-white shadow-sm flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse text-[11px] font-bold">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[8px] font-mono tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-2.5 pl-3">Service Name</th>
                  <th className="p-2.5">Version</th>
                  <th className="p-2.5">Alias</th>
                  <th className="p-2.5">ICF Status</th>
                  <th className="p-2.5 text-center">Gateway Status</th>
                  <th className="p-2.5 text-center pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {paginatedServices.map((srv) => {
                  const isActive = activeStates[srv.service] !== false;
                  const isSelected = selectedService.service === srv.service;
                  
                  return (
                    <tr 
                      key={srv.service}
                      onClick={() => {
                        setSelectedService(srv);
                        setUriQuery(`/sap/opu/odata/sap/${srv.service}/$metadata`);
                      }}
                      className={`hover:bg-slate-50/70 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : ''}`}
                    >
                      <td className="p-2.5 pl-3">
                        <span className="font-mono text-xs font-black block text-slate-850 truncate max-w-[180px]">
                          {srv.service}
                        </span>
                        <span className="text-[9px] text-slate-450 block font-semibold truncate max-w-[180px]">
                          {srv.label}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-500">{srv.version}</td>
                      <td className="p-2.5 font-mono text-[9px] text-slate-500">{srv.alias}</td>
                      <td className="p-2.5">
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                          <span className="text-[9px] font-bold text-slate-600">{isActive ? 'ONLINE' : 'LOCKED'}</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                          isActive 
                            ? 'bg-green-100 text-green-800 border border-green-250' 
                            : 'bg-red-100 text-red-800 border border-red-250'
                        }`}>
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center pr-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleService(srv.service)}
                          disabled={isProcessing}
                          className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg transition-all active:scale-95 flex items-center justify-center mx-auto gap-1 ${
                            isActive 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-250 hover:bg-emerald-100 font-extrabold'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate Service'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-slate-150 px-3 py-2 border-t border-slate-200 text-[10px] font-bold text-slate-600 select-none rounded-b-xl">
              <div>
                Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Service Information & Testing Card */}
        <div className="p-4 flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-[60vh] bg-white lg:bg-transparent">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 text-left">
            Service Metadata Details &amp; Control
          </h3>
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs font-semibold text-slate-600 space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="pb-2.5 border-b border-slate-150">
                <span className="text-[8px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-black tracking-wider block uppercase w-fit mb-1 font-mono">
                  Type: {selectedService.v2v4.toUpperCase()}
                </span>
                <span className="text-sm font-black text-slate-900 block font-mono break-all leading-tight">
                  {selectedService.service}
                </span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{selectedService.label}</span>
              </div>
              
              <div className="space-y-2 text-slate-700">
                <p className="text-[10px] leading-relaxed font-medium text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-left">
                  {selectedService.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div className="p-2 bg-slate-50/50 border border-slate-150 rounded-lg text-left">
                    <span className="text-[7.5px] text-slate-400 block font-black uppercase">ICF System Path</span>
                    <span className="font-mono text-slate-800 break-all">/sap/opu/odata/sap/</span>
                  </div>
                  <div className="p-2 bg-slate-50/50 border border-slate-150 rounded-lg text-left">
                    <span className="text-[7.5px] text-slate-400 block font-black uppercase">Standard Entity</span>
                    <span className="font-mono text-indigo-700 truncate block">{selectedService.entity}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-150 space-y-2 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span>Registration Status:</span>
                <span className="inline-flex items-center gap-1.5 font-black uppercase text-[10px]">
                  {activeStates[selectedService.service] !== false ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> ACTIVE & ONLINE
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1 animate-pulse">
                      <XCircle className="w-3.5 h-3.5" /> INACTIVE / LOCKED
                    </span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleToggleService(selectedService.service)}
                  disabled={isProcessing}
                  className={`w-full font-black text-[10px] uppercase p-2 rounded-xl transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
                    activeStates[selectedService.service] !== false
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#002f5a] hover:bg-blue-900 text-white font-extrabold'
                  }`}
                >
                  <span>{activeStates[selectedService.service] !== false ? 'Deactivate Node' : 'Activate Node'}</span>
                </button>
                
                <button
                  onClick={() => setGatewayClientOpen(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-800 font-black text-[10px] uppercase p-2 rounded-xl transition duration-150 flex items-center justify-center space-x-1.5"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Gateway Client</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Gateway Client Testing Overlay */}
      {gatewayClientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 rounded-t-3xl">
              <div className="flex items-center space-x-2 text-left">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span className="font-extrabold text-xs uppercase tracking-wider">SAP Gateway HTTP Client</span>
              </div>
              <button 
                onClick={() => {
                  setGatewayClientOpen(false);
                  setTestResponse(null);
                }}
                className="text-slate-400 hover:text-white hover:bg-white/15 p-1 rounded-lg transition"
              >
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1.5 text-left text-xs font-bold">
                <label className="text-slate-400 uppercase tracking-wider text-[8px] font-mono">Service REST URI Target</label>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 font-mono text-[10.5px]">
                  <span className="bg-slate-200 p-2.5 px-3 text-slate-700 uppercase font-black tracking-wider text-[9px] shrink-0 self-center">GET</span>
                  <input 
                    type="text" 
                    value={uriQuery}
                    onChange={(e) => setUriQuery(e.target.value)}
                    className="flex-1 p-2 bg-transparent outline-none text-slate-800 font-bold"
                  />
                  <button
                    onClick={handleExecuteGatewayRequest}
                    disabled={isProcessing}
                    className="bg-[#002f5a] hover:bg-blue-900 text-white font-black px-4 text-[10px] uppercase transition cursor-pointer"
                  >
                    Send Query
                  </button>
                </div>
              </div>

              {testResponse && (
                <div className="space-y-1.5 text-left">
                  <span className="text-slate-400 uppercase tracking-wider text-[8px] font-mono font-bold block">HTTP Gateway Response Payload</span>
                  <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-[9.5px] overflow-x-auto max-h-[250px] border border-slate-800 shadow-inner">
                    <code>{testResponse}</code>
                  </pre>
                  <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mt-1 flex justify-between">
                    <span>Protocol: HTTP/1.1</span>
                    <span className={testResponse.includes('error') ? 'text-red-500 font-black' : 'text-emerald-500 font-black'}>
                      Status: {testResponse.includes('error') ? '403 Forbidden' : '200 OK'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-end gap-2 rounded-b-3xl shrink-0">
              <button
                onClick={() => {
                  setGatewayClientOpen(false);
                  setTestResponse(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 text-xs font-black uppercase rounded-xl transition"
              >
                Close Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Active Actions Activity Logger console */}
      <div className="bg-slate-900 text-slate-300 p-3 px-4 border-t border-slate-800 font-mono text-[9px] shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex-1 text-left">
          <span className="text-sky-400 font-bold block mb-0.5 select-none uppercase tracking-wider text-[7.5px]">&#62;_ Active Gateway Operations Log:</span>
          <div className="max-h-[50px] overflow-y-auto no-scrollbar space-y-0.5">
            {actionLog.map((log, i) => (
              <p key={i} className="leading-tight truncate">
                <span className="text-slate-500 select-none mr-1.5">●</span>
                {log}
              </p>
            ))}
          </div>
        </div>
        
        <div className="shrink-0 flex items-center space-x-2 text-slate-400 font-bold">
          <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[8.5px] uppercase">Node: LOCAL_S4H_DEV_CLIENT100</span>
        </div>
      </div>

    </div>
  );
};
