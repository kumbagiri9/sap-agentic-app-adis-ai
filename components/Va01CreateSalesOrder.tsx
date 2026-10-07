import React, { useEffect, useMemo, useState } from 'react';

type Opt = { code: string; text: string };
type SalesArea = { salesOrg: string; distChannel: string; division: string; text: string };
type ValueHelps = { salesAreas: SalesArea[]; orderTypes: Opt[]; deliveryBlocks: Opt[]; billingBlocks: Opt[]; paymentTerms: Opt[]; incoterms: Opt[] };
type Item = { key: number; material: string; quantity: string; unit: string; description: string; plant: string; check: string; ok: boolean | null };
type Msg = { kind: 'error' | 'warning' | 'success' | 'info'; text: string };

const today = () => new Date().toISOString().slice(0, 10);
const emptyItem = (key: number): Item => ({ key, material: '', quantity: '', unit: '', description: '', plant: '', check: '', ok: null });
const odataToIso = (v: any) => { const m = /\/Date\((\d+)/.exec(String(v || '')); return m ? new Date(Number(m[1])).toISOString().slice(0, 10) : ''; };
const postJson = (url: string, body: any) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({ label, required, children, hint }) => (
  <div className="flex items-center gap-2 min-w-0">
    <label className="w-32 shrink-0 text-right text-[12px] text-slate-600">{label}:{required && <span className="text-rose-600">*</span>}</label>
    <div className="flex items-center gap-2 min-w-0 flex-1">{children}{hint && <span className="text-[11px] text-slate-500 truncate" title={hint}>{hint}</span>}</div>
  </div>
);
const inputCls = 'h-7 border border-slate-300 rounded-sm px-2 text-[12px] bg-white focus:outline-none focus:border-[#0a6ed1] focus:ring-1 focus:ring-[#0a6ed1] disabled:bg-slate-100 disabled:text-slate-500';

export const Va01CreateSalesOrder: React.FC<{ initial?: Record<string, any> }> = ({ initial = {} }) => {
  const [vh, setVh] = useState<ValueHelps | null>(null);
  const [vhError, setVhError] = useState('');
  const [orderType, setOrderType] = useState('');
  const [areaKey, setAreaKey] = useState('');
  const [soldTo, setSoldTo] = useState(String(initial.soldTo || initial.customerId || initial.customer || ''));
  const [soldToInfo, setSoldToInfo] = useState('');
  const [shipTo, setShipTo] = useState('');
  const [shipToInfo, setShipToInfo] = useState('');
  const [custRef, setCustRef] = useState(String(initial.poRef || ''));
  const [custRefDate, setCustRefDate] = useState('');
  const [reqDelivDate, setReqDelivDate] = useState(today());
  const [deliveryBlock, setDeliveryBlock] = useState('');
  const [billingBlock, setBillingBlock] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [incoterms, setIncoterms] = useState('');
  const [incoLocation, setIncoLocation] = useState('');
  const [items, setItems] = useState<Item[]>(() => {
    const first = emptyItem(1);
    if (initial.material) { first.material = String(initial.material); first.quantity = String(initial.quantity || ''); }
    return [first, emptyItem(2), emptyItem(3), emptyItem(4)];
  });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<any>(null);

  useEffect(() => {
    fetch('/api/s4/va01/value-help').then(r => r.json()).then(d => {
      if (!d.success) { setVhError(d.message || 'Value helps could not be read from S/4HANA.'); return; }
      setVh(d);
      if (initial.salesOrg) {
        const areas = (d.salesAreas as SalesArea[]).filter(a => a.salesOrg === String(initial.salesOrg));
        if (areas.length === 1) setAreaKey(`${areas[0].salesOrg}|${areas[0].distChannel}|${areas[0].division}`);
      }
    }).catch(e => setVhError(String(e?.message || e)));
  }, []);

  const area = useMemo(() => {
    const [salesOrg, distChannel, division] = areaKey.split('|');
    return areaKey ? { salesOrg, distChannel, division } : null;
  }, [areaKey]);

  const checkParty = async (id: string, setInfo: (s: string) => void, isSoldTo: boolean) => {
    if (!id.trim()) { setInfo(''); return; }
    const r = await postJson('/api/s4/va01/check', { kind: 'customer', id, ...(area || {}) });
    if (!r.found) { setInfo(''); setMessages(m => [...m.filter(x => !x.text.includes(id)), { kind: 'error', text: r.message }]); return; }
    setInfo([r.name, r.city].filter(Boolean).join(', '));
    setMessages(m => m.filter(x => !x.text.includes(id)).concat(r.message ? [{ kind: 'warning', text: r.message }] : []));
    if (isSoldTo) {
      if (!paymentTerms && r.paymentTerms) setPaymentTerms(r.paymentTerms);
      if (!incoterms && r.incoterms) setIncoterms(r.incoterms);
      if (!incoLocation && r.incotermsLocation) setIncoLocation(r.incotermsLocation);
    }
  };

  const checkItem = async (key: number) => {
    const it = items.find(i => i.key === key);
    if (!it || !it.material.trim()) return;
    const r = await postJson('/api/s4/va01/check', { kind: 'material', id: it.material, ...(area || {}) });
    setItems(prev => prev.map(i => i.key !== key ? i : r.found
      ? { ...i, description: r.description || '', unit: r.unit || '', plant: i.plant || r.plant || '', check: r.message || '', ok: !r.message }
      : { ...i, description: '', unit: '', check: r.message, ok: false }));
  };

  useEffect(() => { if (soldTo) checkParty(soldTo, setSoldToInfo, true); }, [areaKey]);
  useEffect(() => { if (initial.material) checkItem(1); }, [areaKey]);

  const updateItem = (key: number, patch: Partial<Item>) => setItems(prev => prev.map(i => i.key === key ? { ...i, ...patch } : i));

  const save = async () => {
    setSaving(true);
    setMessages([]);
    try {
      const r = await postJson('/api/s4/va01/create', {
        orderType, salesOrg: area?.salesOrg, distChannel: area?.distChannel, division: area?.division,
        soldTo, shipTo, custRef, custRefDate, reqDelivDate, deliveryBlock, billingBlock, paymentTerms, incoterms, incotermsLocation: incoLocation,
        items: items.filter(i => i.material.trim()).map(i => ({ material: i.material, quantity: i.quantity, plant: i.plant }))
      });
      if (r.success) {
        setCreated(r);
        setMessages([{ kind: 'success', text: r.message }]);
      } else {
        setMessages([{ kind: 'error', text: r.message }]);
      }
    } catch (e: any) {
      setMessages([{ kind: 'error', text: `The order could not be sent to S/4HANA: ${e?.message || e}` }]);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setCreated(null); setMessages([]); setSoldTo(''); setSoldToInfo(''); setShipTo(''); setShipToInfo(''); setCustRef(''); setCustRefDate('');
    setReqDelivDate(today()); setDeliveryBlock(''); setBillingBlock(''); setPaymentTerms(''); setIncoterms(''); setIncoLocation('');
    setItems([emptyItem(1), emptyItem(2), emptyItem(3), emptyItem(4)]);
  };

  const locked = !!created || saving;
  const createdItems: any[] = created?.items || [];
  const netValue = created ? `${Number(created.header?.TotalNetAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${created.header?.TransactionCurrency || ''}` : '';
  const msgColor = { error: 'bg-rose-50 border-rose-300 text-rose-800', warning: 'bg-amber-50 border-amber-300 text-amber-800', success: 'bg-emerald-50 border-emerald-300 text-emerald-800', info: 'bg-sky-50 border-sky-300 text-sky-800' };
  const msgIcon = { error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', success: 'fa-circle-check', info: 'fa-circle-info' };

  return (
    <div className="bg-white border border-slate-300 rounded-lg overflow-hidden text-left font-sans shadow-sm">
      {/* Shell bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <span className="bg-[#0a6ed1] text-white font-black text-[13px] italic px-2 py-0.5 rounded-sm">SAP</span>
          <span className="text-[14px] font-semibold text-slate-800">{created ? `Display Standard Order ${created.salesOrder}: Overview` : 'Create Standard Order: Overview'}</span>
        </div>
        <span className="text-[12px] text-[#0a6ed1] font-semibold">S8H (100) &middot; VA01</span>
      </div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-slate-200 bg-slate-50">
        <button type="button" disabled={locked} onClick={() => { checkParty(soldTo, setSoldToInfo, true); if (shipTo) checkParty(shipTo, setShipToInfo, false); items.forEach(i => i.material && checkItem(i.key)); }}
          className="h-7 px-3 border border-[#0a6ed1] text-[#0a6ed1] rounded text-[12px] hover:bg-sky-50 disabled:opacity-40">Check</button>
        <button type="button" disabled={locked} onClick={save}
          className="h-7 px-4 bg-[#0a6ed1] text-white rounded text-[12px] font-semibold hover:bg-[#0854a0] disabled:opacity-40">{saving ? 'Saving\u2026' : 'Save'}</button>
        {created && <button type="button" onClick={reset} className="h-7 px-3 border border-slate-300 text-slate-700 rounded text-[12px] hover:bg-white">Create Another Order</button>}
        <span className="ml-auto text-[11px] text-slate-500">Live S/4HANA &middot; API_SALES_ORDER_SRV</span>
      </div>

      {vhError && <div className="m-3 p-2 border rounded text-[12px] bg-rose-50 border-rose-300 text-rose-800">Value helps could not be read live from S/4HANA: {vhError}</div>}

      {/* Organizational data (VA01 initial screen) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 px-4 py-3 border-b border-slate-200 bg-slate-50/60">
        <Field label="Order Type" required>
          <select className={`${inputCls} w-full`} value={orderType} disabled={locked || !vh} onChange={e => setOrderType(e.target.value)}>
            <option value="">{vh ? 'Select order type' : 'Loading from S/4HANA\u2026'}</option>
            {vh?.orderTypes.map(o => <option key={o.code} value={o.code}>{o.code} - {o.text}</option>)}
          </select>
        </Field>
        <Field label="Sales Area" required>
          <select className={`${inputCls} w-full`} value={areaKey} disabled={locked || !vh} onChange={e => setAreaKey(e.target.value)}>
            <option value="">{vh ? 'Sales Org / Distr. Channel / Division' : 'Loading from S/4HANA\u2026'}</option>
            {vh?.salesAreas.map(a => { const k = `${a.salesOrg}|${a.distChannel}|${a.division}`; return <option key={k} value={k}>{a.salesOrg} / {a.distChannel} / {a.division} - {a.text}</option>; })}
          </select>
        </Field>
      </div>

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 px-4 py-3 border-b border-slate-200">
        <Field label="Standard Order"><input className={`${inputCls} w-36`} value={created?.salesOrder || ''} disabled /></Field>
        <Field label="Net Value"><input className={`${inputCls} w-44 text-right`} value={netValue} disabled /></Field>
        <div className="md:col-span-2"><Field label="Sold-to Party" required hint={soldToInfo}>
          <input className={`${inputCls} w-36`} value={soldTo} disabled={locked} onChange={e => setSoldTo(e.target.value)} onBlur={() => checkParty(soldTo, setSoldToInfo, true)} />
        </Field></div>
        <div className="md:col-span-2"><Field label="Ship-to Party" hint={shipToInfo}>
          <input className={`${inputCls} w-36`} value={shipTo} disabled={locked} onChange={e => setShipTo(e.target.value)} onBlur={() => checkParty(shipTo, setShipToInfo, false)} />
        </Field></div>
        <Field label="Cust. Reference"><input className={`${inputCls} w-full max-w-xs`} value={custRef} disabled={locked} onChange={e => setCustRef(e.target.value)} /></Field>
        <Field label="Cust. Ref. Date"><input type="date" className={`${inputCls} w-40`} value={custRefDate} disabled={locked} onChange={e => setCustRefDate(e.target.value)} /></Field>
      </div>

      {/* Sales tab */}
      <div className="flex gap-5 px-4 pt-2 border-b border-slate-200 text-[12px]">
        <span className="pb-1.5 border-b-2 border-[#0a6ed1] text-[#0a6ed1] font-semibold">Sales</span>
        {['Item Overview', 'Item detail', 'Ordering party', 'Procurement', 'Shipping', 'Reason for rejection'].map(t => <span key={t} className="pb-1.5 text-slate-400">{t}</span>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 px-4 py-3 border-b border-slate-200">
        <Field label="Req. Deliv.Date" required><input type="date" className={`${inputCls} w-40`} value={reqDelivDate} disabled={locked} onChange={e => setReqDelivDate(e.target.value)} /></Field>
        <div />
        <Field label="Delivery Block">
          <select className={`${inputCls} w-full max-w-xs`} value={deliveryBlock} disabled={locked} onChange={e => setDeliveryBlock(e.target.value)}>
            <option value="" />{vh?.deliveryBlocks.map(o => <option key={o.code} value={o.code}>{o.code} - {o.text}</option>)}
          </select>
        </Field>
        <Field label="Billing Block">
          <select className={`${inputCls} w-full max-w-xs`} value={billingBlock} disabled={locked} onChange={e => setBillingBlock(e.target.value)}>
            <option value="" />{vh?.billingBlocks.map(o => <option key={o.code} value={o.code}>{o.code} - {o.text}</option>)}
          </select>
        </Field>
        <Field label="Pyt Terms">
          <select className={`${inputCls} w-full max-w-xs`} value={paymentTerms} disabled={locked} onChange={e => setPaymentTerms(e.target.value)}>
            <option value="" />{vh?.paymentTerms.map(o => <option key={o.code} value={o.code}>{o.code}{o.text ? ` - ${o.text}` : ''}</option>)}
          </select>
        </Field>
        <Field label="Incoterms">
          <select className={`${inputCls} w-full max-w-xs`} value={incoterms} disabled={locked} onChange={e => setIncoterms(e.target.value)}>
            <option value="" />{vh?.incoterms.map(o => <option key={o.code} value={o.code}>{o.code} - {o.text}</option>)}
          </select>
        </Field>
        <Field label="Inco. Location1"><input className={`${inputCls} w-full max-w-xs`} value={incoLocation} disabled={locked} onChange={e => setIncoLocation(e.target.value)} /></Field>
      </div>

      {/* All Items */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-slate-800">All Items</span>
          {!locked && <button type="button" onClick={() => setItems(prev => [...prev, emptyItem(Date.now())])} className="text-[12px] text-[#0a6ed1] hover:underline">+ Add Item</button>}
        </div>
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full min-w-[760px] text-[12px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Item', 'Material', 'Order Quantity', 'Un', 'Item Description', 'Plnt', ...(created ? ['ItCa', 'Confirmed Qty', 'Net Value'] : [])].map(h => <th key={h} className="text-left font-semibold px-2 py-1.5 border-b border-slate-200">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(created ? createdItems.map((ci: any, idx: number) => ({ ...emptyItem(idx), material: ci.Material, quantity: String(Number(ci.RequestedQuantity)), unit: ci.RequestedQuantityUnit, description: ci.SalesOrderItemText, plant: ci.ProductionPlant, _c: ci })) : items).map((it: any, idx: number) => (
                <tr key={it.key} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-1 text-slate-500">{created ? it._c.SalesOrderItem : it.material.trim() ? (idx + 1) * 10 : ''}</td>
                  <td className="px-2 py-1">
                    <input className={`${inputCls} w-36 ${it.ok === false ? 'border-rose-400' : ''}`} value={it.material} disabled={locked}
                      onChange={e => updateItem(it.key, { material: e.target.value, ok: null, check: '' })} onBlur={() => checkItem(it.key)} />
                    {it.check && <div className={`text-[10px] mt-0.5 ${it.ok === false ? 'text-rose-600' : 'text-amber-700'}`}>{it.check}</div>}
                  </td>
                  <td className="px-2 py-1"><input type="number" min="0" className={`${inputCls} w-24 text-right`} value={it.quantity} disabled={locked} onChange={e => updateItem(it.key, { quantity: e.target.value })} /></td>
                  <td className="px-2 py-1 text-slate-600">{it.unit}</td>
                  <td className="px-2 py-1 text-slate-700">{it.description}</td>
                  <td className="px-2 py-1"><input className={`${inputCls} w-16`} value={it.plant} disabled={locked} onChange={e => updateItem(it.key, { plant: e.target.value })} /></td>
                  {created && <>
                    <td className="px-2 py-1">{it._c.SalesOrderItemCategory}</td>
                    <td className="px-2 py-1 text-right">{Number(it._c.ConfdDelivQtyInOrderQtyUnit || 0).toLocaleString('en-US')}</td>
                    <td className="px-2 py-1 text-right">{Number(it._c.NetAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {it._c.TransactionCurrency}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {created && <div className="mt-2 text-[11px] text-slate-500">
          Read back from S/4HANA: status {created.header?.OverallSDProcessStatus || '\u2014'}, credit check {created.header?.TotalCreditCheckStatus || 'not relevant'}
          {created.header?.CreatedByUser ? `, created by ${created.header.CreatedByUser}` : ''}{created.header?.RequestedDeliveryDate ? `, requested delivery ${odataToIso(created.header.RequestedDeliveryDate)}` : ''}.
        </div>}
      </div>

      {/* Status bar */}
      {messages.length > 0 && <div className="px-4 pb-3 space-y-1.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2 border rounded px-3 py-1.5 text-[12px] ${msgColor[m.kind]}`}>
            <i className={`fa-solid ${msgIcon[m.kind]} mt-0.5`} /><span className="whitespace-pre-wrap">{m.text}</span>
          </div>
        ))}
      </div>}
    </div>
  );
};
