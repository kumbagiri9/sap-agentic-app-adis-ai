import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportableReport {
  reportTitle: string;
  summaryStats?: { label: string; value: string }[];
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  note?: string;
}

const fileBase = (title: string) => `${title.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 80) || 'SAP_Report'}_${new Date().toISOString().slice(0, 10)}`;
const cell = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// jsPDF standard fonts cover Latin-1 only.
const pdfText = (s: unknown) => String(s ?? '').replace(/[\u2013\u2014]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[^\x00-\xFF]/g, '?');

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Every row of the report is exported, not just the page currently shown on screen.
export function downloadReportPdf(report: ExportableReport) {
  const doc = new jsPDF({ orientation: report.columns.length > 6 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
  doc.setFontSize(13);
  doc.text(pdfText(report.reportTitle), 40, 40);
  doc.setFontSize(8);
  doc.text(`Generated ${new Date().toLocaleString()} from live SAP data`, 40, 56);
  let y = 70;
  if (report.summaryStats?.length) {
    autoTable(doc, { startY: y, head: [report.summaryStats.map(s => pdfText(s.label))], body: [report.summaryStats.map(s => pdfText(s.value))], styles: { fontSize: 8 }, theme: 'grid' });
    y = (doc as any).lastAutoTable.finalY + 12;
  }
  autoTable(doc, {
    startY: y,
    head: [report.columns.map(c => pdfText(c.label))],
    body: report.rows.map(r => report.columns.map(c => pdfText(cell(r[c.key])))),
    styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [120, 53, 15] },
    theme: 'striped'
  });
  if (report.note) {
    const finalY = (doc as any).lastAutoTable.finalY + 14;
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(pdfText(report.note), doc.internal.pageSize.getWidth() - 80), 40, finalY);
  }
  doc.save(`${fileBase(report.reportTitle)}.pdf`);
}

export function downloadReportWord(report: ExportableReport) {
  const stats = report.summaryStats?.length
    ? `<table border="1" cellspacing="0" cellpadding="4"><tr>${report.summaryStats.map(s => `<th>${esc(s.label)}</th>`).join('')}</tr><tr>${report.summaryStats.map(s => `<td>${esc(s.value)}</td>`).join('')}</tr></table><br/>`
    : '';
  const head = report.columns.map(c => `<th style="background:#78350f;color:#fff">${esc(c.label)}</th>`).join('');
  const body = report.rows.map(r => `<tr>${report.columns.map(c => `<td>${esc(cell(r[c.key]))}</td>`).join('')}</tr>`).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(report.reportTitle)}</title>
<style>body{font-family:Calibri,Arial;font-size:10pt}table{border-collapse:collapse;font-size:8pt}td,th{border:1px solid #999;padding:3px}</style></head>
<body><h2>${esc(report.reportTitle)}</h2><p>Generated ${esc(new Date().toLocaleString())} from live SAP data</p>${stats}
<table border="1" cellspacing="0" cellpadding="3"><tr>${head}</tr>${body}</table>${report.note ? `<p><i>${esc(report.note)}</i></p>` : ''}</body></html>`;
  triggerDownload(new Blob(['\ufeff', html], { type: 'application/msword' }), `${fileBase(report.reportTitle)}.doc`);
}
