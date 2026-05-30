import type { ReactElement } from 'react';
import type { FeeInvoice, ReportCard } from '@/types/models';

/**
 * On-demand PDF generators. Everything under @react-pdf/renderer and the PDF
 * document components is dynamically imported here so none of it ships in the
 * initial bundle — it loads only when a user actually exports.
 */
async function render(doc: ReactElement, filename: string): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function generateInvoicePdf(invoice: FeeInvoice, schoolName: string): Promise<void> {
  const { InvoicePDF } = await import('./InvoicePDF');
  await render(<InvoicePDF invoice={invoice} schoolName={schoolName} />, `${invoice.invoiceNumber}.pdf`);
}

export async function generateReportCardPdf(data: ReportCard): Promise<void> {
  const { ReportCardPDF } = await import('./ReportCardPDF');
  await render(<ReportCardPDF data={data} />, `report-card-${data.student.studentNumber}-${data.term}.pdf`);
}
