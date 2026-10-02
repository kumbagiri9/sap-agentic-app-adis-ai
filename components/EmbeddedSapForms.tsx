import React, { useState } from 'react';
import { sapPlugin as sapService } from '../services/sapService';
import { ORDERS } from '../services/sapData';
import { 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  FileCheck2, 
  ArrowRight,
  TrendingUp,
  User,
  Package,
  FileSpreadsheet
} from 'lucide-react';

// Common visual success banner
const SuccessBanner: React.FC<{ title: string; message: string; docId: string; onReset: () => void }> = ({ title, message, docId, onReset }) => {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4 text-left space-y-4 animate-in fade-in zoom-in-95">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">{title}</h4>
          <p className="text-xs text-emerald-700 font-bold leading-relaxed">{message}</p>
        </div>
      </div>
      
      <div className="bg-white border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs font-mono font-black text-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block tracking-widest font-sans font-extrabold uppercase mb-0.5">GENERATED SAP DOCUMENT</span>
          <span className="text-emerald-700 text-sm select-all">{docId}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block tracking-widest font-sans font-extrabold uppercase mb-0.5">SSO CLIENT CLOUD</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] border border-emerald-200">100 - PROD-S8H</span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-1.5 text-[10px] font-mono font-medium text-slate-500">
        <div className="font-sans font-black text-slate-400 uppercase tracking-wider text-[8px] pb-1 border-b">HANA Audit Logs (ST03N / security)</div>
        <div className="flex justify-between">
          <span>EVENT_USER:</span>
          <span className="font-bold text-slate-800">STUDENT069</span>
        </div>
        <div className="flex justify-between">
          <span>POST_STATUS:</span>
          <span className="text-emerald-600 font-bold">COMMIT_WORK_OK</span>
        </div>
        <div className="flex justify-between">
          <span>SAP_S8H_GATEWAY:</span>
          <span className="font-bold text-slate-800">ODATA_V4_SECURE_SYNC</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <a 
          href={`https://ui.s4hana.ondemand.com/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#SalesOrder-display?SalesOrder=${docId}`}
          className="bg-[#002f5a] hover:bg-indigo-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center space-x-1.5"
        >
          <span>Launch S/4HANA Order #{docId} Experience</span>
          <i className="fas fa-external-link-alt text-[8px]"></i>
        </a>
        <button 
          onClick={onReset}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
        >
          Create New Document
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 1. SD: Sales Order Form (VA01)
// ==========================================
export const SalesOrderForm: React.FC<{ initialCustomer?: string; initialPoRef?: string; initialSalesOrg?: string }> = ({
  initialCustomer = 'USCU_L09',
  initialPoRef = 'PO-WAR-9903',
  initialSalesOrg = '1710'
}) => {
  const [soldTo, setSoldTo] = useState(initialCustomer);
  const [salesOrg, setSalesOrg] = useState(initialSalesOrg);
  const [poRef, setPoRef] = useState(initialPoRef);
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [atpStatus, setAtpStatus] = useState<'idle' | 'checking' | 'confirmed'>('idle');
  const [creditStatus, setCreditStatus] = useState<'idle' | 'checking' | 'passed'>('idle');
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [items, setItems] = useState<any[]>([
    { id: 1, materialId: 'MZ-TG-Y200', text: 'Trading Goods MZ-TG-Y200', qty: 10, price: 120.00 }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), materialId: 'MZ-TG-Y200', text: 'Trading Goods MZ-TG-Y200', qty: 5, price: 120.00 }
    ]);
  };

  const handleUpdateItem = (id: number, key: string, val: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAtpCheck = () => {
    setAtpStatus('checking');
    setTimeout(() => setAtpStatus('confirmed'), 1000);
  };

  const handleCreditCheck = () => {
    setCreditStatus('checking');
    setTimeout(() => setCreditStatus('passed'), 1000);
  };

  const handlePostOrder = async () => {
    setIsPosting(true);
    setErrorMessage('');
    try {
      const result = await sapService.executeCRUD('CREATE', 'SALES_ORDER', {
        customer: soldTo,
        soldToParty: soldTo,
        salesOrg: salesOrg,
        salesOrganization: salesOrg,
        poRef: poRef,
        items: items.map(i => ({
          materialId: i.materialId,
          quantity: Number(i.qty) || 1,
          price: Number(i.price) || 120.00
        }))
      });

      if (result.success && result.referenceId) {
        const refId = result.referenceId;
        setPostedId(refId);
        
        if (typeof window !== 'undefined') {
          (window as any).__lastCreatedSalesOrderId = refId;
        }
        try {
          localStorage.setItem('s4_last_created_so', refId);
        } catch(e) {}

        const cleanRef = refId.replace(/^ORD-/, '').replace(/^SO-/, '').trim();
        const createdRecord = {
          id: refId.startsWith('ORD-') ? refId : `ORD-${refId}`,
          sapSalesOrder: cleanRef,
          customer: soldTo,
          soldToParty: soldTo,
          date: new Date().toISOString().split('T')[0],
          status: 'Created / Open',
          total: netValue,
          salesOrganization: salesOrg,
          poRef: poRef,
          items: items.map(i => ({
            materialId: i.materialId,
            quantity: Number(i.qty) || 1,
            price: Number(i.price) || 120.00
          })),
          isLive: true
        };

        ORDERS[cleanRef] = createdRecord;
        ORDERS[refId] = createdRecord;
        ORDERS[`ORD-${cleanRef}`] = createdRecord;
      } else {
        setErrorMessage(result.message || 'S/4HANA Sales Order creation failed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to connect to S/4HANA OData service.');
    } finally {
      setIsPosting(false);
    }
  };

  const sumTotal = items.reduce((acc, item) => acc + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
  const estTax = sumTotal * 0.18; // 18% VAT
  const netValue = sumTotal + estTax;

  if (postedId) {
    return (
      <SuccessBanner 
        title="VA01: Sales Order Created in Live S/4HANA" 
        message={`Sales Order #${postedId} for customer ${soldTo} in Sales Org ${salesOrg} successfully created in live S/4HANA database.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
          setErrorMessage('');
          setAtpStatus('idle');
          setCreditStatus('idle');
          setItems([
            { id: 1, materialId: 'MZ-TG-Y200', text: 'Trading Goods MZ-TG-Y200', qty: 10, price: 120.00 }
          ]);
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase font-mono mr-2">SD Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: VA01</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Create Standard Sales Order (OR)</h3>
        </div>
        <div className="flex space-x-1">
          <button 
            type="button"
            onClick={handleAtpCheck}
            disabled={atpStatus === 'checking'}
            className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase flex items-center shrink-0 disabled:opacity-50"
          >
            {atpStatus === 'checking' ? '...' : atpStatus === 'confirmed' ? '✓ ATP Confirmed' : 'Check ATP'}
          </button>
          <button 
            type="button"
            onClick={handleCreditCheck}
            disabled={creditStatus === 'checking'}
            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase flex items-center shrink-0 disabled:opacity-50"
          >
            {creditStatus === 'checking' ? '...' : creditStatus === 'passed' ? '✓ Credit Approved' : 'Check Credit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Sold-To Customer</label>
          <input 
            type="text" 
            value={soldTo} 
            onChange={(e) => setSoldTo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Sales Org</label>
          <input 
            type="text" 
            value={salesOrg} 
            onChange={(e) => setSalesOrg(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">PO Reference No</label>
          <input 
            type="text" 
            value={poRef} 
            onChange={(e) => setPoRef(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Document Date</label>
          <input 
            type="date" 
            value={docDate} 
            onChange={(e) => setDocDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden" 
          />
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[10px] font-bold p-3 rounded-xl flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="whitespace-pre-wrap">{errorMessage}</div>
        </div>
      )}

      {atpStatus === 'confirmed' && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold p-2.5 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>REAL-TIME ATP CHECK: All materials are available at Plant 1000 (Houston). Scheduled dispatch confirmed.</span>
        </div>
      )}

      {creditStatus === 'passed' && (
        <div className="bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-bold p-2.5 rounded-xl flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>CREDIT CONTROL RECORD: Customer {soldTo} credit limit verified. Current exposure: $148K / $500K max. Approved.</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center pb-1 border-b">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
            <Package className="w-3 h-3 text-indigo-500 mr-2" />
            Standard Line Items Grid (OData Deep Insert)
          </span>
          <button 
            type="button"
            onClick={handleAddItem}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Material
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-bold text-slate-700 min-w-[450px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[8px] uppercase tracking-wider border-b font-black text-left">
                <th className="py-1.5 px-2 w-[110px]">Material ID</th>
                <th className="py-1.5 px-2">Description</th>
                <th className="py-1.5 px-2 w-[70px] text-right">Quantity</th>
                <th className="py-1.5 px-2 w-[90px] text-right">Price (USD)</th>
                <th className="py-1.5 px-2 w-[90px] text-right">Net Value</th>
                <th className="py-1.5 px-2 w-[40px] text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/40">
                  <td className="py-2 px-1">
                    <input 
                      type="text" 
                      value={item.materialId} 
                      onChange={(e) => handleUpdateItem(item.id, 'materialId', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs text-indigo-700 outline-hidden focus:bg-white" 
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input 
                      type="text" 
                      value={item.text} 
                      onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 description-field outline-hidden focus:bg-white text-[10px]" 
                    />
                  </td>
                  <td className="py-2 px-1 text-right">
                    <input 
                      type="number" 
                      value={item.qty} 
                      onChange={(e) => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-hidden focus:bg-white text-right font-semibold" 
                    />
                  </td>
                  <td className="py-2 px-1 text-right">
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-hidden focus:bg-white text-right font-semibold" 
                    />
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-mono">
                    ${((item.qty || 0) * (item.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Delete line item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center">
          <Clock className="w-3.5 h-3.5 text-slate-300 mr-2 shrink-0 animate-pulse" />
          <span>Interactive calculations active</span>
        </div>
        <div className="text-right text-xs space-y-1 font-bold w-full sm:w-auto self-end">
          <div className="flex justify-between sm:justify-end sm:space-x-4">
            <span className="text-slate-500">Gross Subtotal:</span>
            <span className="font-mono text-slate-950">${sumTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between sm:justify-end sm:space-x-4">
            <span className="text-slate-500">Estimated VAT (18%):</span>
            <span className="font-mono text-slate-950">${estTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between sm:justify-end sm:space-x-4 border-t pt-1 font-extrabold text-[#1E3B7B]">
            <span>Net Financial Impact:</span>
            <span className="font-mono text-sm">${netValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handlePostOrder}
          disabled={isPosting}
          className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-50"
        >
          {isPosting ? 'Processing S/4HANA Commit...' : 'Save & Post Sales Order'}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 2. MM: Purchase Order Form (ME21N)
// ==========================================
export const PurchaseOrderForm: React.FC = () => {
  const [vendor, setVendor] = useState('DE-100');
  const [purchOrg, setPurchOrg] = useState('1000');
  const [purchGrp, setPurchGrp] = useState('001');
  const [plant, setPlant] = useState('PL-HOU-01');
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');
  
  const [items, setItems] = useState<any[]>([
    { id: 1, materialId: 'MAT-A01', desc: 'Heavy Duty Bearings', quantity: 200, price: 38.00 },
    { id: 2, materialId: 'MAT-C03', desc: 'Stainless Steel Case 12in', quantity: 50, price: 125.00 }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), materialId: 'MAT-D04', desc: 'Secondary Rotor Assembly', quantity: 15, price: 310.00 }
    ]);
  };

  const handleUpdateItem = (id: number, key: string, val: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCreatePO = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`PO-${Math.floor(45000000 + Math.random() * 900000)}`);
    }, 1200);
  };

  const sumTotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0)), 0);

  if (postedId) {
    return (
      <SuccessBanner 
        title="ME21N: Purchase Order Created" 
        message={`Purchase Order successfully registered with Vendor ${vendor} and transmitted via ALE IDoc queue.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
          setItems([
            { id: 1, materialId: 'MAT-A01', desc: 'Heavy Duty Bearings', quantity: 200, price: 38.00 },
            { id: 2, materialId: 'MAT-C03', desc: 'Stainless Steel Case 12in', quantity: 50, price: 125.00 }
          ]);
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase font-mono mr-2">MM Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: ME21N</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Create Purchase Order (Standard)</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Supplier / Vendor</label>
          <input 
            type="text" 
            value={vendor} 
            onChange={(e) => setVendor(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Purch Org</label>
          <input 
            type="text" 
            value={purchOrg} 
            onChange={(e) => setPurchOrg(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Purch Group</label>
          <input 
            type="text" 
            value={purchGrp} 
            onChange={(e) => setPurchGrp(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Target Plant ID</label>
          <input 
            type="text" 
            value={plant} 
            onChange={(e) => setPlant(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 font-mono outline-hidden" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center pb-1 border-b">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
            <Package className="w-3 h-3 text-amber-500 mr-2" />
            PO Line Items Layout
          </span>
          <button 
            type="button"
            onClick={handleAddItem}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Line Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-bold text-slate-700 min-w-[450px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[8px] uppercase tracking-wider border-b font-black text-left">
                <th className="py-1.5 px-2 w-[110px]">Material ID</th>
                <th className="py-1.5 px-2">Material Description</th>
                <th className="py-1.5 px-2 w-[70px] text-right">Quantity</th>
                <th className="py-1.5 px-2 w-[90px] text-right">Net Price (USD)</th>
                <th className="py-1.5 px-2 w-[90px] text-right">Row Total</th>
                <th className="py-1.5 px-2 w-[40px] text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/40">
                  <td className="py-2 px-1">
                    <input 
                      type="text" 
                      value={item.materialId} 
                      onChange={(e) => handleUpdateItem(item.id, 'materialId', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs text-amber-700 outline-hidden focus:bg-white" 
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input 
                      type="text" 
                      value={item.desc} 
                      onChange={(e) => handleUpdateItem(item.id, 'desc', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 description-field outline-hidden focus:bg-white text-[10px]" 
                    />
                  </td>
                  <td className="py-2 px-1 text-right">
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-hidden focus:bg-white text-right font-semibold" 
                    />
                  </td>
                  <td className="py-2 px-1 text-right">
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-hidden focus:bg-white text-right font-semibold" 
                    />
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-mono">
                    ${((item.quantity || 0) * (item.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs font-bold border-t border-slate-100 font-mono text-slate-800">
        <span className="text-[10px] text-slate-400 font-sans font-black uppercase tracking-wider">Purchase Total:</span>
        <span className="text-amber-800 text-sm font-black">${sumTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handleCreatePO}
          disabled={isPosting}
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-50"
        >
          {isPosting ? 'Posting Purchase Order...' : 'Generate Purchase Order (Post)'}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 3. BP: Business Partner Form (BP)
// ==========================================
export const BusinessPartnerForm: React.FC = () => {
  const [partnerName, setPartnerName] = useState('Walmart Enterprise Corp');
  const [bpRole, setBpRole] = useState('FLCU01 Customer - FI Role');
  const [country, setCountry] = useState('US');
  const [city, setCity] = useState('Bentonville');
  const [postalCode, setPostalCode] = useState('72716');
  const [taxId, setTaxId] = useState('US-4491024-X');
  const [street, setStreet] = useState('702 SW 8th Street');
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');

  const handlePostBP = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`BP-001${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1100);
  };

  if (postedId) {
    return (
      <SuccessBanner 
        title="BP: Business Partner Created" 
        message={`Business Partner master record "${partnerName}" successfully stored in general client table BUT000.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase font-mono mr-2">Cross-App Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: BP</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Create Business Partner Master Record</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Partner Organisation Name</label>
          <input 
            type="text" 
            value={partnerName} 
            onChange={(e) => setPartnerName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">S/4HANA BP Role Group</label>
          <select 
            value={bpRole} 
            onChange={(e) => setBpRole(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-500 outline-hidden"
          >
            <option>FLCU01 Customer - FI Role</option>
            <option>FLVN01 Supplier - Purchasing Role</option>
            <option>FLCU00 Customer - General Ledger</option>
            <option>FLVN00 Supplier - Accounts Payable</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-2 space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">General Address & Financial Parameters</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-bold text-slate-700">
          <div>
            <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Street Address</label>
            <input 
              type="text" 
              value={street} 
              onChange={(e) => setStreet(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-500 outline-hidden" 
            />
          </div>
          <div>
            <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">City</label>
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-500 outline-hidden" 
            />
          </div>
          <div>
            <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Postal Code</label>
            <input 
              type="text" 
              value={postalCode} 
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-500 font-mono outline-hidden" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
          <div>
            <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Country Zone</label>
            <input 
              type="text" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-500 font-mono outline-hidden" 
            />
          </div>
          <div>
            <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Tax No / VAT ID</label>
            <input 
              type="text" 
              value={taxId} 
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-teal-500 font-mono outline-hidden" 
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 text-[10px] text-slate-500 font-medium space-y-1">
        <div className="font-sans font-black text-slate-400 uppercase tracking-wider text-[8px] pb-1 border-b mb-1">Mandatory SAP Verification Protocol</div>
        <div className="flex justify-between">
          <span>VAT ID Validation Rules:</span>
          <span className="text-emerald-600 font-bold">Standard Format OK</span>
        </div>
        <div className="flex justify-between">
          <span>Reconciliation Account Mapping:</span>
          <span className="font-bold text-slate-800">140000 (Receivables)</span>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handlePostBP}
          disabled={isPosting}
          className="bg-gradient-to-r from-teal-600 to-teal-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-50"
        >
          {isPosting ? 'Saving BP Segment...' : 'Save Business Partner Record'}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 4. MM: Material Master Form (MM01)
// ==========================================
export const MaterialMasterForm: React.FC = () => {
  const [matName, setMatName] = useState('Heavy Steel Shaft');
  const [matCat, setMatCat] = useState('ROH Raw Materials');
  const [baseUnit, setBaseUnit] = useState('PC');
  const [netWeight, setNetWeight] = useState('42 kg');
  const [valClass, setValClass] = useState('3000 Raw Materials');
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');

  const handlePostMat = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`MAT-${Math.floor(90000 + Math.random() * 9000)}`);
    }, 1200);
  };

  if (postedId) {
    return (
      <SuccessBanner 
        title="MM01: Material Registered" 
        message={`Material Master record "${matName}" added to MARA tables and synced across all storage points.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase font-mono mr-2">MM Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: MM01</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Create Material Master Data Record</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Material Name Descriptions</label>
          <input 
            type="text" 
            value={matName} 
            onChange={(e) => setMatName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">S/4HANA Material Type</label>
          <select 
            value={matCat} 
            onChange={(e) => setMatCat(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
          >
            <option>ROH Raw Materials</option>
            <option>HALB Semi-Finished Products</option>
            <option>FERT Finished Goods</option>
            <option>HAWA Trading Goods</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Base UoM</label>
          <input 
            type="text" 
            value={baseUnit} 
            onChange={(e) => setBaseUnit(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Net Product Weight</label>
          <input 
            type="text" 
            value={netWeight} 
            onChange={(e) => setNetWeight(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Valuation Class</label>
          <select 
            value={valClass} 
            onChange={(e) => setValClass(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
          >
            <option>3000 Raw Materials</option>
            <option>7920 Finished Goods</option>
            <option>3040 General Supplies</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handlePostMat}
          disabled={isPosting}
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-50"
        >
          {isPosting ? 'Registering MARA Segment...' : 'Post New Material Master'}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 5. FI: Post Journal Entry Form (FB50)
// ==========================================
export const JournalEntryForm: React.FC = () => {
  const [compCode, setCompCode] = useState('1000');
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [headerText, setHeaderText] = useState('GL Ledger Adjustments v2026');
  const [currency, setCurrency] = useState('USD');
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');
  
  const [items, setItems] = useState<any[]>([
    { id: 1, account: '113100', name: 'Cash at Bank', direction: 'Debit', amount: 12500.00 },
    { id: 2, account: '211100', name: 'Accounts Payable general', direction: 'Credit', amount: 12500.00 }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), account: '400000', name: 'Standard Sales Revenues', direction: 'Credit', amount: 0.00 }
    ]);
  };

  const handleUpdateItem = (id: number, key: string, val: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handlePostGL = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`FI-${Math.floor(10000000 + Math.random() * 9000000)}`);
    }, 1200);
  };

  const debitsTotal = items.filter(i => i.direction === 'Debit').reduce((acc, i) => acc + (parseFloat(i.amount || 0)), 0);
  const creditsTotal = items.filter(i => i.direction === 'Credit').reduce((acc, i) => acc + (parseFloat(i.amount || 0)), 0);
  const balance = debitsTotal - creditsTotal;
  const isBalanced = Math.abs(balance) < 0.01;

  if (postedId) {
    return (
      <SuccessBanner 
        title="FB50: Journal Entry Posted" 
        message={`Financial Document successfully allocated on General Ledger BKPF segment for Company Code ${compCode}.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
          setItems([
            { id: 1, account: '113100', name: 'Cash at Bank', direction: 'Debit', amount: 12500.00 },
            { id: 2, account: '211100', name: 'Accounts Payable general', direction: 'Credit', amount: 12500.00 }
          ]);
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase font-mono mr-2">FI/CO Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: FB50</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Post General Ledger Journal Document</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Company Code</label>
          <input 
            type="text" 
            value={compCode} 
            onChange={(e) => setCompCode(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Posting Date</label>
          <input 
            type="date" 
            value={docDate} 
            onChange={(e) => setDocDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Document Header Text</label>
          <input 
            type="text" 
            value={headerText} 
            onChange={(e) => setHeaderText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Currency Code</label>
          <input 
            type="text" 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 font-mono outline-hidden" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center pb-1 border-b">
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-2" />
            General Ledger Allocation Rows
          </span>
          <button 
            type="button"
            onClick={handleAddItem}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Account Segment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-bold text-slate-700 min-w-[450px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[8px] uppercase tracking-wider border-b font-black text-left">
                <th className="py-1.5 px-2 w-[110px]">G/L Account</th>
                <th className="py-1.5 px-2">Account Description</th>
                <th className="py-1.5 px-2 w-[90px] text-center">T-Debit/Credit</th>
                <th className="py-1.5 px-2 w-[100px] text-right">Segment Value</th>
                <th className="py-1.5 px-2 w-[40px] text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/40">
                  <td className="py-2 px-1">
                    <input 
                      type="text" 
                      value={item.account} 
                      onChange={(e) => handleUpdateItem(item.id, 'account', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs text-rose-700 outline-hidden focus:bg-white" 
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-hidden focus:bg-white text-[10px]" 
                    />
                  </td>
                  <td className="py-2 px-1 text-center">
                    <select 
                      value={item.direction} 
                      onChange={(e) => handleUpdateItem(item.id, 'direction', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded py-0.5 px-1 text-[10px] outline-hidden focus:bg-white font-extrabold text-[#1E3B7B]"
                    >
                      <option>Debit</option>
                      <option>Credit</option>
                    </select>
                  </td>
                  <td className="py-2 px-1 text-right">
                    <input 
                      type="number" 
                      value={item.amount} 
                      onChange={(e) => handleUpdateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-hidden focus:bg-white text-right font-semibold font-mono" 
                    />
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 border rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-[10px] space-y-1 font-semibold text-slate-500">
          <div><span className="font-extrabold text-slate-700">Total Debits:</span> <span className="font-mono">${debitsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
          <div><span className="font-extrabold text-slate-700">Total Credits:</span> <span className="font-mono">${creditsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        </div>
        <div className="text-right">
          {isBalanced ? (
            <span className="inline-flex items-center text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" /> BALANCED ($0.00 DIFFERENCE)
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-black text-red-800 bg-red-100 border border-red-200 px-3 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 mr-1 shrink-0" /> UNBALANCED: DIFF ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handlePostGL}
          disabled={isPosting || !isBalanced}
          className="bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-40"
        >
          {isPosting ? 'Posting BKPF Document...' : 'Post to General Ledger'}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 6. TM: Freight Order Form (TM_FO)
// ==========================================
export const FreightOrderForm: React.FC = () => {
  const [source, setSource] = useState('Plant Houston PL-1000');
  const [dest, setDest] = useState('Rotterdam Port Logistics Hub');
  const [carrier, setCarrier] = useState('DHL Global Forwarding (DHL_GL)');
  const [price, setPrice] = useState('11450.00');
  const [weight, setWeight] = useState('18500 kg');
  const [cargoType, setCargoType] = useState('Dangerous Goods Class 9');
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');

  const handlePostFO = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`FO-${Math.floor(88124000 + Math.random() * 9000)}`);
    }, 1100);
  };

  if (postedId) {
    return (
      <SuccessBanner 
        title="TM: Freight Order Registered" 
        message={`Transportation plan assigned. Dangerous goods clearance successfully synchronized with shipper.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded uppercase font-mono mr-2">TM Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: TM_FO</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Create Transportation Freight Plan Order</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Source Depot / Plant Location</label>
          <input 
            type="text" 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-sky-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Destination Port / Warehouse</label>
          <input 
            type="text" 
            value={dest} 
            onChange={(e) => setDest(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-sky-500 outline-hidden" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-bold text-slate-700">
        <div className="col-span-2">
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Assigned Logistics Carrier</label>
          <input 
            type="text" 
            value={carrier} 
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-sky-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Total Cargo Weight</label>
          <input 
            type="text" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-sky-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Quotation Freight Cost</label>
          <input 
            type="text" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-sky-500 font-mono outline-hidden" 
          />
        </div>
      </div>

      <div>
        <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Cargo Classifications</label>
        <input 
          type="text" 
          value={cargoType} 
          onChange={(e) => setCargoType(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-sky-500 outline-hidden" 
        />
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handlePostFO}
          disabled={isPosting}
          className="bg-gradient-to-r from-sky-600 to-sky-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-50"
        >
          {isPosting ? 'Scheduling TM milestones...' : 'Post Freight Routing'}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 7. PM: Plant Maintenance Order (IW31)
// ==========================================
export const MaintenanceOrderForm: React.FC = () => {
  const [desc, setDesc] = useState('Repair Boiler No. 3 Leakage');
  const [equip, setEquip] = useState('EQ-BLR-003');
  const [funcLoc, setFuncLoc] = useState('PL10-BOILER-ROOM');
  const [workCenter, setWorkCenter] = useState('MECH-PL-HOU');
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');

  const [ops, setOps] = useState<any[]>([
    { id: 1, step: 'Safety Lockout Tagout Procedure', duration: '1 hr' },
    { id: 2, step: 'Replace Damaged Hydro-Valve Gaskets', duration: '4 hr' }
  ]);

  const handleAddOp = () => {
    setOps([...ops, { id: Date.now(), step: 'Pressure Integrity Diagnostics', duration: '1.5 hr' }]);
  };

  const handleSaveOrder = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`WO-${Math.floor(77180000 + Math.random() * 9000)}`);
    }, 1100);
  };

  if (postedId) {
    return (
      <SuccessBanner 
        title="IW31: Maintenance Order Generated" 
        message={`Industrial maintenance work order successfully registered. Budget allocated on cost center CC-PM01.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase font-mono mr-2">PM Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: IW31</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Create Equipment Maintenance Order</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Work Description Summary</label>
          <input 
            type="text" 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 outline-hidden" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Equipment Code Code</label>
          <input 
            type="text" 
            value={equip} 
            onChange={(e) => setEquip(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 font-mono outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Functional Location</label>
          <input 
            type="text" 
            value={funcLoc} 
            onChange={(e) => setFuncLoc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Responsible Work Center</label>
          <input 
            type="text" 
            value={workCenter} 
            onChange={(e) => setWorkCenter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-rose-500 outline-hidden" 
          />
        </div>
      </div>

      <div className="space-y-2 border-t pt-2">
        <div className="flex justify-between items-center pb-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
            PM Operation Milestones Tasks
          </span>
          <button 
            type="button" 
            onClick={handleAddOp} 
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 px-2 py-0.5 rounded-lg"
          >
            + Add Operation
          </button>
        </div>

        <div className="space-y-1.5">
          {ops.map((op, i) => (
            <div key={op.id} className="flex space-x-2 text-[11px] font-bold text-slate-700 items-center">
              <span className="text-indigo-600 font-mono text-[10px]">00{i+1}0</span>
              <input 
                type="text" 
                value={op.step} 
                onChange={(e) => setOps(ops.map(o => o.id === op.id ? { ...o, step: e.target.value } : o))}
                className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-hidden focus:bg-white" 
              />
              <input 
                type="text" 
                value={op.duration} 
                onChange={(e) => setOps(ops.map(o => o.id === op.id ? { ...o, duration: e.target.value } : o))}
                className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-center outline-hidden focus:bg-white" 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handleSaveOrder}
          disabled={isPosting}
          className="bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-50"
        >
          {isPosting ? 'Allocating resource units...' : 'Commit Work Order (IW31)'}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 8. Workflow: Multi-Agent Inbox / Approvals (SBWP)
// ==========================================
export const WorkflowInboxForm: React.FC<{ params: Record<string, string> }> = ({ params }) => {
  const [approverNotes, setApproverNotes] = useState('');
  const [escalateTo, setEscalateTo] = useState('FI_MANAGER');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'escalated'>('pending');
  const [loading, setLoading] = useState(false);

  const docNo = params.taskId || params.orderId || params.poId || params.documentNo || 'PO-45001249';
  const supplier = params.vendor || params.supplier || 'DE-100 (Walmart Logistics)';
  const amount = params.amount || params.value || '$42,850.00 USD';
  const riskScore = params.riskScore || '12% (Low Risk)';
  const module = params.module || 'MM';

  const handleApprove = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('approved');
    }, 1000);
  };

  const handleReject = () => {
    if (!approverNotes) {
      alert(' re-check request: Please enter notes detailing the reason for rejection first.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('rejected');
    }, 1000);
  };

  const handleEscalate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('escalated');
    }, 1000);
  };

  if (status === 'approved') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4 text-left space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest block font-mono">WORKFLOW STATE: APPROVED & CLOSED</h4>
            <p className="text-xs text-emerald-700 font-bold mt-1">
              Decision released in Client 100 on S/4HANA Workflow Engine. G/L Accounts, postings and goods clearances triggered.
            </p>
          </div>
        </div>
        {approverNotes && (
          <div className="bg-white border rounded-xl p-3 text-[11px] text-slate-700 italic font-medium">
            <span className="font-extrabold text-[9px] uppercase tracking-wider block text-slate-400 not-italic mb-1 font-sans">Approver Comments</span>
            "{approverNotes}"
          </div>
        )}
        <div className="text-[9px] font-mono font-semibold text-slate-400 flex justify-between uppercase">
          <span>Sign-off: STUDENT069</span>
          <span>Timestamp: {new Date().toLocaleTimeString()} UTC</span>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4 text-left space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-300">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-red-900 uppercase tracking-widest block font-mono">WORKFLOW STATE: REJECTED</h4>
            <p className="text-xs text-red-700 font-bold mt-1">
              Document rejected and locked from posting. Originating department notified immediately for corrections.
            </p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-3 text-[11px] text-slate-700 italic font-medium">
          <span className="font-extrabold text-[9px] uppercase tracking-wider block text-slate-400 not-italic mb-1 font-sans">Rejection Reason Specified</span>
          "{approverNotes}"
        </div>
        <div className="text-[9px] font-mono font-semibold text-slate-400 flex justify-between uppercase">
          <span>Rejected By: STUDENT069</span>
          <span>Lock Token: REJ-LOCK-OK</span>
        </div>
      </div>
    );
  }

  if (status === 'escalated') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-left space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300">
            <Clock className="w-5 h-5 text-amber-600 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest block font-mono">WORKFLOW STATE: ESCALATED</h4>
            <p className="text-xs text-amber-700 font-bold mt-1">
              Decision task delegated to group {escalateTo}. Overriding locks established.
            </p>
          </div>
        </div>
        <div className="text-[9px] font-mono font-semibold text-slate-400 flex justify-between uppercase">
          <span>Delegated By: STUDENT069</span>
          <span>Forwarding Status: SUCCESS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase font-mono mr-2">Workflow</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: SBWP</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">S/4HANA Centralized Decision Inbox</h3>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block">Document ID Target</span>
          <span className="text-slate-900 font-mono text-xs">{docNo}</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block">Line module Origin</span>
          <span className="text-[#1E3B7B] text-xs uppercase">{module} Department</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block">Supplier / Vendor context</span>
          <span className="text-slate-900 text-xs truncate block">{supplier}</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block">Financial net Amount</span>
          <span className="text-emerald-700 font-mono text-xs block">{amount}</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block">Governance Risk Score</span>
          <span className="text-amber-700 text-[10px] font-black block">{riskScore}</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block">Decision status</span>
          <span className="bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 text-[9px] uppercase font-black tracking-wider inline-block">Pending Approval</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block">Approver Remarks / Action Comments</label>
        <textarea
          rows={2}
          value={approverNotes}
          onChange={(e) => setApproverNotes(e.target.value)}
          placeholder="Enter notes detailing approval/rejection decision (mandatory for Rejections)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-3">
        <div className="flex items-center space-x-2">
          <select 
            value={escalateTo} 
            onChange={(e) => setEscalateTo(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-hidden focus:bg-white"
          >
            <option value="FI_MANAGER">Finance G/L Controller</option>
            <option value="PROC_DIR">Director of Global Procurement</option>
            <option value="AUDIT_TEAM">Secondary Audit Group</option>
          </select>
          <button 
            type="button"
            onClick={handleEscalate}
            disabled={loading}
            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-black uppercase px-3 py-2 rounded-lg"
          >
            Escalate Task
          </button>
        </div>
        <div className="flex justify-end space-x-2">
          <button 
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[9px] font-black uppercase px-4 py-2 rounded-xl"
          >
            Reject / Deny
          </button>
          <button 
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] px-5 py-2.5 rounded-xl uppercase shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center"
          >
            {loading ? 'Releasing...' : 'Approve & Release'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 9. SuccessFactors: HR Onboarding Form
// ==========================================
export const HrOnboardingForm: React.FC = () => {
  const [empName, setEmpName] = useState('Sarah Jenkins');
  const [role, setRole] = useState('Senior Solutions Architect');
  const [dept, setDept] = useState('Technology Services FICO');
  const [salary, setSalary] = useState('145000');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sysProfile, setSysProfile] = useState<string[]>(['ERP_S8H', 'SF_CENTRAL']);
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');

  const handlePostSF = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`EMP-${Math.floor(880000 + Math.random() * 90000)}`);
    }, 1100);
  };

  const handleToggleSys = (prof: string) => {
    if (sysProfile.includes(prof)) {
      setSysProfile(sysProfile.filter(p => p !== prof));
    } else {
      setSysProfile([...sysProfile, prof]);
    }
  };

  if (postedId) {
    return (
      <SuccessBanner 
        title="SuccessFactors: Employee Registered" 
        message={`Onboarding flow established for "${empName}". Automated system accounts created and credentials locked.`}
        docId={postedId}
        onReset={() => {
          setPostedId('');
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left p-4 space-y-4 font-sans max-w-full overflow-hidden">
      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-3 pr-4 rounded-t-2xl">
        <div>
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono mr-2">HCM Module</span>
          <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wide">T-Code: SF_ONB</span>
          <h3 className="text-xs font-black text-slate-800 mt-1 uppercase">Enterprise Onboard Employee Profile</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">New Employee Full Name</label>
          <input 
            type="text" 
            value={empName} 
            onChange={(e) => setEmpName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Business Role Placement</label>
          <input 
            type="text" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-hidden" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-bold text-slate-700 font-mono">
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Allocation Unit</label>
          <input 
            type="text" 
            value={dept} 
            onChange={(e) => setDept(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-500 font-sans outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Annual salary package</label>
          <input 
            type="text" 
            value={salary} 
            onChange={(e) => setSalary(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-hidden" 
          />
        </div>
        <div>
          <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">Timeline Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-hidden" 
          />
        </div>
      </div>

      <div className="border-t pt-2 space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Automated Security Profile Provisioning</span>
        <div className="flex flex-wrap gap-2">
          {['ERP_S8H', 'SF_CENTRAL', 'BTP_PROD', 'CPI_MONITOR'].map((prof) => {
            const active = sysProfile.includes(prof);
            return (
              <button
                type="button"
                key={prof}
                onClick={() => handleToggleSys(prof)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all ${active ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                {prof} {active && '✓'}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handlePostSF}
          disabled={isPosting}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-[10px] px-6 py-2.5 rounded-xl uppercase shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center disabled:opacity-50"
        >
          {isPosting ? 'Writing SF profile record...' : 'Onboard Employee via SF'}
        </button>
      </div>
    </div>
  );
};

export const GenericInteractiveForm: React.FC<{ data: any }> = ({ data }) => {
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const res: Record<string, string> = {};
    if (data.fieldMetadata) {
      data.fieldMetadata.forEach((f: any) => {
        res[f.field] = data.parameters[f.field] || '';
      });
    }
    Object.entries(data.parameters || {}).forEach(([k, v]) => {
      if (!res[k]) res[k] = v as string;
    });
    if (Object.keys(res).length === 0) {
      res['Document / Object ID'] = '100492';
      res['Target System'] = 'S8H Client 100';
    }
    return res;
  });
  const [isPosting, setIsPosting] = useState(false);
  const [postedId, setPostedId] = useState('');

  const handlePost = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostedId(`${data.module || 'SAP'}-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1100);
  };

  if (postedId) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4 text-left space-y-4 animate-in fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-300 shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider font-mono">TRANSACTION COMMITTED</h4>
            <p className="text-xs text-emerald-700 font-bold mt-0.5">Custom master/transaction data synchronized over standard OData gateway.</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-3 font-mono text-xs text-slate-800 flex justify-between">
          <span>GENERATED ID:</span>
          <span className="font-bold text-emerald-700">{postedId}</span>
        </div>
        <div className="flex justify-end pt-1">
          <button onClick={() => setPostedId('')} className="bg-white border text-slate-600 font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase">Create New</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left space-y-4">
      <div className="border-b pb-1.5 flex justify-between items-center text-xs font-bold text-slate-800">
        <span>DYNAMIC FORM OVERVIEW</span>
        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] uppercase font-mono">{data.module || 'GENERIC'}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(fields).map(([k, v]) => (
          <div key={k} className="text-[11px] font-bold">
            <label className="text-slate-400 font-mono text-[8px] uppercase tracking-wider block mb-1">{k}</label>
            <input 
              type="text" 
              value={v} 
              onChange={(e) => setFields({ ...fields, [k]: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden" 
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button 
          onClick={handlePost} 
          disabled={isPosting}
          className="bg-indigo-700 text-white font-black text-[10px] px-5 py-2.5 rounded-xl uppercase shadow-md hover:bg-indigo-800 transition-all"
        >
          {isPosting ? 'Posting Transaction...' : 'Submit Transaction'}
        </button>
      </div>
    </div>
  );
};
