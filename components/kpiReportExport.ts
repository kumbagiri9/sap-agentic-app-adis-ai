import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type KpiExportData = {
  title: string; subtitle: string;
  tiles: { label: string; value: string; hint?: string }[];
  trend?: { title: string; points: { period: string; amount: number; count: number }[]; amountLabel: string };
  top?: { title: string; items: { name: string; value: number }[]; valueLabel: string };
  share?: { title: string; slices: { name: string; value: number }[]; valueLabel: string };
  insights: string[]; note: string;
  meta?: { scope: string; totalRecords: number; recordLabel: string; filters: string[]; dateRange?: string; sourceSystem: string; dataTimestamp: string; detailShown: number };
  exportTable?: { columns: { key: string; label: string }[]; rows: Record<string, any>[]; caption: string };
};
export type ChartImage = { title: string; dataUrl: string; png: Uint8Array; width: number; height: number };

// Word and PDF are page documents; the full detail list is in the Excel and CSV files.
const DOC_DETAIL_LIMIT = 1000;

const fileBase = (title: string) => `${title.replace(/^KPI Dashboard\s*\W\s*/i, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 80) || 'SAP_KPI_Report'}_${new Date().toISOString().slice(0, 10)}`;
const xml = (s: unknown) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pdfText = (s: unknown) => String(s ?? '').replace(/\u2192/g, 'to').replace(/[\u2013\u2014]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[^\x00-\xFF]/g, '?');
const cellText = (v: unknown) => (v === null || v === undefined || v === '' ? '' : String(v).trim());
const numFmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const asNumber = (v: unknown): number | null => {
  const s = cellText(v);
  return /^-?\d+\.\d+$/.test(s) || /^-?[1-9]\d{0,6}$/.test(s) || s === '0' ? Number(s) : null;
};

function metaRows(d: KpiExportData): [string, string][] {
  const m = d.meta;
  if (!m) return [['Scope', d.subtitle]];
  return [
    ['Scope', m.scope], ['Total matching records', `${m.totalRecords.toLocaleString('en-US')} ${m.recordLabel}`],
    ['Applied filters', m.filters.join('; ')], ['Date range', m.dateRange || '\u2014'],
    ['Source system', m.sourceSystem], ['Data timestamp', new Date(m.dataTimestamp).toLocaleString()],
    ['Detail rows shown on screen', m.detailShown.toLocaleString('en-US')]
  ];
}
function breakdowns(d: KpiExportData): { sheet: string; title: string; head: string[]; rows: (string | number)[][] }[] {
  const out: { sheet: string; title: string; head: string[]; rows: (string | number)[][] }[] = [];
  if (d.trend?.points.length) out.push({ sheet: 'Trend', title: d.trend.title, head: ['Period', d.trend.amountLabel, 'Records'], rows: d.trend.points.map(p => [p.period, p.amount, p.count]) });
  if (d.top?.items.length) out.push({ sheet: 'Top 10', title: d.top.title, head: ['Rank', 'Name', d.top.valueLabel], rows: d.top.items.map((x, i) => [i + 1, x.name, x.value]) });
  if (d.share?.slices.length) {
    const total = d.share.slices.reduce((a, b) => a + b.value, 0) || 1;
    out.push({ sheet: 'Share', title: d.share.title, head: ['Value', d.share.valueLabel, 'Share %'], rows: d.share.slices.map(s => [s.name, s.value, Math.round(s.value / total * 1000) / 10]) });
  }
  return out;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ---------- chart capture (Recharts SVG -> PNG) ----------
export async function captureCharts(root: HTMLElement | null): Promise<ChartImage[]> {
  if (!root) return [];
  const out: ChartImage[] = [];
  for (const box of Array.from(root.querySelectorAll<HTMLElement>('[data-kpi-chart]'))) {
    const svg = box.querySelector<SVGSVGElement>('svg.recharts-surface');
    if (!svg) continue;
    const { width, height } = svg.getBoundingClientRect();
    if (!width || !height) continue;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width)); clone.setAttribute('height', String(height));
    clone.setAttribute('style', 'font-family: Arial, Helvetica, sans-serif; font-size: 10px; background: #fff');
    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const bin = atob(dataUrl.split(',')[1]);
      const png = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) png[i] = bin.charCodeAt(i);
      out.push({ title: box.dataset.kpiChart || 'Chart', dataUrl, png, width, height });
    } catch { /* a chart that cannot be rasterized is left out; its numbers are still in the tables */ }
  }
  return out;
}

// ---------- minimal ZIP (stored) for OOXML ----------
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b: Uint8Array) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(files: { name: string; data: Uint8Array | string }[], type: string): Blob {
  const enc = new TextEncoder();
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const name = enc.encode(f.name);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true); lv.setUint16(12, dosDate, true); lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, name.length, true);
    local.set(name, 30);
    const cen = new Uint8Array(46 + name.length);
    const cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
    cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true); cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
    cen.set(name, 46);
    parts.push(local, data); central.push(cen);
    offset += local.length + data.length;
  }
  const size = central.reduce((a, b) => a + b.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end] as BlobPart[], { type });
}

// ---------- Excel (XLSX) ----------
type XCell = string | number | { v: string | number; s: number };
const colName = (i: number) => { let s = ''; for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };
function sheetXml(rows: XCell[][], widths: number[]): string {
  const body = rows.map((r, ri) => `<row r="${ri + 1}">${r.map((c, ci) => {
    const ref = `${colName(ci)}${ri + 1}`;
    const v = typeof c === 'object' ? c.v : c;
    const s = typeof c === 'object' ? c.s : typeof c === 'number' ? 3 : 0;
    if (v === '' || v === null || v === undefined) return '';
    return typeof v === 'number' && Number.isFinite(v)
      ? `<c r="${ref}" s="${s}"><v>${v}</v></c>`
      : `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
  }).join('')}</row>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${body}</sheetData></worksheet>`;
}
export function downloadKpiXlsx(d: KpiExportData) {
  const H = (v: string) => ({ v, s: 1 });
  const T = (v: string) => ({ v, s: 2 });
  const sheets: { name: string; xml: string }[] = [];
  const summary: XCell[][] = [[T(d.title)], [d.subtitle], [], [H('Report information'), H('')], ...metaRows(d).map(([k, v]) => [k, v] as XCell[]), [], [H('KPI'), H('Value'), H('Note')],
    ...d.tiles.map(t => [t.label, t.value, t.hint || ''] as XCell[]), [], [H('Key insights')], ...d.insights.map(s => [s] as XCell[]), [], [d.note]];
  sheets.push({ name: 'Summary', xml: sheetXml(summary, [34, 60, 40]) });
  breakdowns(d).forEach(b => sheets.push({ name: b.sheet, xml: sheetXml([[T(b.title)], b.head.map(H), ...b.rows], [28, 26, 16]) }));
  if (d.exportTable?.rows.length) {
    const cols = d.exportTable.columns;
    sheets.push({
      name: 'Details',
      xml: sheetXml([[T(d.exportTable.caption)], cols.map(c => H(c.label)), ...d.exportTable.rows.map(r => cols.map(c => asNumber(r[c.key]) ?? cellText(r[c.key])))], cols.map(() => 18))
    });
  }
  const files = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/styles.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="14"/><color rgb="FF1E3A8A"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1D4ED8"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>` },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s.xml }))
  ];
  triggerDownload(zip(files, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), `${fileBase(d.title)}.xlsx`);
}

// ---------- Word (DOCX) ----------
export function downloadKpiDocx(d: KpiExportData, charts: ChartImage[]) {
  const run = (t: string, o: { b?: boolean; sz?: number; color?: string; i?: boolean } = {}) =>
    `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>${o.b ? '<w:b/>' : ''}${o.i ? '<w:i/>' : ''}${o.color ? `<w:color w:val="${o.color}"/>` : ''}<w:sz w:val="${o.sz || 20}"/></w:rPr><w:t xml:space="preserve">${xml(t)}</w:t></w:r>`;
  const para = (t: string, o: { b?: boolean; sz?: number; color?: string; i?: boolean; after?: number } = {}) => `<w:p><w:pPr><w:spacing w:after="${o.after ?? 80}"/></w:pPr>${run(t, o)}</w:p>`;
  const PAGE_W = 15398;
  const table = (head: string[], rows: (string | number)[][], fill = '1D4ED8', sz = 16) => {
    const w = Math.floor(PAGE_W / Math.max(1, head.length));
    const cell = (t: string | number, hdr: boolean) => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${hdr ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ''}</w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${run(typeof t === 'number' ? numFmt(t) : String(t), hdr ? { b: true, color: 'FFFFFF', sz } : { sz })}</w:p></w:tc>`;
    const border = (n: string) => `<w:${n} w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>`;
    return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(border).join('')}</w:tblBorders><w:tblCellMar><w:left w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${head.map(() => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`
      + `<w:tr><w:trPr><w:tblHeader/></w:trPr>${head.map(h => cell(h, true)).join('')}</w:tr>${rows.map(r => `<w:tr>${r.map(c => cell(c, false)).join('')}</w:tr>`).join('')}</w:tbl>${para('', { after: 120 })}`;
  };
  const image = (c: ChartImage, idx: number) => {
    const maxW = 8.6 * 914400;
    const cx = Math.min(maxW, Math.round(c.width * 9525));
    const cy = Math.round(cx * c.height / c.width);
    return para(c.title, { b: true, sz: 22, color: '1E3A8A' })
      + `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${idx + 1}" name="Chart ${idx + 1}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${idx + 1}" name="chart${idx + 1}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg${idx + 1}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  };
  const detail = d.exportTable;
  const detailRows = detail ? detail.rows.slice(0, DOC_DETAIL_LIMIT) : [];
  const body = [
    para(d.title, { b: true, sz: 32, color: '1E3A8A' }), para(d.subtitle, { i: true, sz: 18, color: '475569', after: 160 }),
    para('Report information', { b: true, sz: 24 }), table(['Item', 'Value'], metaRows(d), '334155', 18),
    para('Key performance indicators', { b: true, sz: 24 }), table(['KPI', 'Value', 'Note'], d.tiles.map(t => [t.label, t.value, t.hint || '']), '1D4ED8', 18),
    ...(d.insights.length ? [para('Key insights', { b: true, sz: 24 }), ...d.insights.map(s => para(`\u2022 ${s}`, { sz: 20 }))] : []),
    ...charts.map(image),
    ...breakdowns(d).flatMap(b => [para(b.title, { b: true, sz: 22 }), table(b.head, b.rows)]),
    ...(detail && detailRows.length ? [para(detailRows.length < detail.rows.length ? `${detail.caption} \u2014 first ${detailRows.length.toLocaleString('en-US')} rows here; the Excel/CSV download has ${detail.rows.length.toLocaleString('en-US')}` : detail.caption, { b: true, sz: 22 }),
      table(detail.columns.map(c => c.label), detailRows.map(r => detail.columns.map(c => cellText(r[c.key]))), '334155', 14)] : []),
    para(d.note, { i: true, sz: 16, color: '64748B' }),
    para(`Generated ${new Date().toLocaleString()} from live SAP data \u2014 SAP MINDS`, { sz: 16, color: '64748B' })
  ].join('');
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const files = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
    { name: 'word/_rels/document.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${charts.map((_, i) => `<Relationship Id="rIdImg${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/chart${i + 1}.png"/>`).join('')}</Relationships>` },
    { name: 'word/document.xml', data: doc },
    ...charts.map((c, i) => ({ name: `word/media/chart${i + 1}.png`, data: c.png }))
  ];
  triggerDownload(zip(files, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), `${fileBase(d.title)}.docx`);
}

// ---------- PDF ----------
export function downloadKpiPdf(d: KpiExportData, charts: ChartImage[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const after = () => (doc as any).lastAutoTable.finalY + 14;
  doc.setFillColor(29, 78, 216); doc.rect(0, 0, pageW, 54, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.text(pdfText(d.title), 30, 26);
  doc.setFontSize(9); doc.text(pdfText(d.subtitle), 30, 42);
  doc.setTextColor(0, 0, 0);
  autoTable(doc, { startY: 66, head: [['Report information', '']], body: metaRows(d).map(([k, v]) => [pdfText(k), pdfText(v)]), styles: { fontSize: 8 }, headStyles: { fillColor: [51, 65, 85] }, columnStyles: { 0: { cellWidth: 170, fontStyle: 'bold' } }, theme: 'grid' });
  autoTable(doc, { startY: after(), head: [d.tiles.map(t => pdfText(t.label))], body: [d.tiles.map(t => pdfText(t.value))], styles: { fontSize: 9, halign: 'center' }, headStyles: { fillColor: [29, 78, 216], fontSize: 7 }, theme: 'grid' });
  let y = after();
  if (d.insights.length) {
    doc.setFontSize(10); doc.text('Key insights', 30, y); y += 12;
    doc.setFontSize(8);
    for (const s of d.insights) { const lines = doc.splitTextToSize(pdfText(`- ${s}`), pageW - 60); doc.text(lines, 34, y); y += lines.length * 10; }
    y += 6;
  }
  for (const c of charts) {
    const w = Math.min(pageW - 60, c.width * 0.75);
    const h = w * c.height / c.width;
    if (y + h + 20 > pageH - 20) { doc.addPage(); y = 30; }
    doc.setFontSize(10); doc.text(pdfText(c.title), 30, y); y += 6;
    doc.addImage(c.dataUrl, 'PNG', 30, y, w, h); y += h + 16;
  }
  for (const b of breakdowns(d)) {
    autoTable(doc, { startY: y, head: [b.head.map(pdfText)], body: b.rows.map(r => r.map(v => typeof v === 'number' ? numFmt(v) : pdfText(v))), styles: { fontSize: 8 }, headStyles: { fillColor: [29, 78, 216] }, theme: 'striped', margin: { left: 30, right: 30 } });
    y = after();
  }
  const detail = d.exportTable;
  if (detail?.rows.length) {
    const rows = detail.rows.slice(0, DOC_DETAIL_LIMIT);
    doc.setFontSize(10);
    if (y > pageH - 60) { doc.addPage(); y = 30; }
    doc.text(pdfText(rows.length < detail.rows.length ? `${detail.caption} - first ${rows.length} rows here; Excel/CSV has ${detail.rows.length}` : detail.caption), 30, y);
    autoTable(doc, { startY: y + 6, head: [detail.columns.map(c => pdfText(c.label))], body: rows.map(r => detail.columns.map(c => pdfText(cellText(r[c.key])))), styles: { fontSize: 6.5, cellPadding: 2 }, headStyles: { fillColor: [51, 65, 85] }, theme: 'striped', margin: { left: 30, right: 30 } });
    y = after();
  }
  if (y > pageH - 40) { doc.addPage(); y = 30; }
  doc.setFontSize(7); doc.setTextColor(100, 116, 139);
  doc.text(doc.splitTextToSize(pdfText(`${d.note} Generated ${new Date().toLocaleString()} from live SAP data - SAP MINDS.`), pageW - 60), 30, y);
  triggerDownload(doc.output('blob'), `${fileBase(d.title)}.pdf`);
}

// ---------- CSV ----------
export function downloadKpiCsv(d: KpiExportData) {
  const q = (v: unknown) => { const s = cellText(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines: string[] = [q(d.title), q(d.subtitle), '', 'Report information', ...metaRows(d).map(r => r.map(q).join(',')), '', 'KPI,Value,Note', ...d.tiles.map(t => [t.label, t.value, t.hint || ''].map(q).join(','))];
  for (const b of breakdowns(d)) lines.push('', q(b.title), b.head.map(q).join(','), ...b.rows.map(r => r.map(q).join(',')));
  if (d.insights.length) lines.push('', 'Key insights', ...d.insights.map(q));
  if (d.exportTable?.rows.length) {
    const cols = d.exportTable.columns;
    lines.push('', q(d.exportTable.caption), cols.map(c => q(c.label)).join(','), ...d.exportTable.rows.map(r => cols.map(c => q(r[c.key])).join(',')));
  }
  lines.push('', q(d.note));
  triggerDownload(new Blob(['\ufeff', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${fileBase(d.title)}.csv`);
}
