
import React from 'react';
import { Invoice } from '../types';
import { DownloadIcon, EditIcon } from './icons';

declare const jspdf: any;

interface InvoicePreviewProps {
  invoice: Invoice;
  onEdit: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onEdit }) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
  }

  const totalAmount = invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  const handleDownload = () => {
    setIsDownloading(true);

    try {
        const { jsPDF } = jspdf;
        // A4 landscape width is 297mm.
        const L_A4_WIDTH = 297;
        const margin = 15;
        const contentWidth = L_A4_WIDTH - margin * 2;
        
        // --- 1. Calculate Total Height ---
        // Use a temporary doc for measurements
        const tempDoc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
        let calculatedHeight = 0;
        
        // Redefine column widths for better layout
        const qtyColWidth = 25;
        const priceColWidth = 40;
        const totalColWidth = 40;
        const rightMarginGap = 0; // Pushed to the far right
        const numberColsWidth = qtyColWidth + priceColWidth + totalColWidth;
        const descColWidth = contentWidth - numberColsWidth - rightMarginGap;

        calculatedHeight += margin; // Top margin
        calculatedHeight += 27; // Header section

        const clientAddressLines = tempDoc.splitTextToSize(invoice.clientAddress, (contentWidth / 2) - 10);
        calculatedHeight += Math.max(25, (clientAddressLines.length * 5) + 15); // Client info
        calculatedHeight += 10; // Space after

        calculatedHeight += 10; // Table Header
        
        tempDoc.setFontSize(10);
        invoice.items.forEach(item => {
            const descriptionLines = tempDoc.splitTextToSize(item.description || ' ', descColWidth - 2);
            const rowHeight = descriptionLines.length * 5 + 6;
            calculatedHeight += rowHeight;
        });

        calculatedHeight += 5; // Space after table
        calculatedHeight += 25; // Totals section
        calculatedHeight += 10; // Space after totals

        const notesLines = tempDoc.splitTextToSize(invoice.notes || ' ', contentWidth);
        calculatedHeight += 10; // "Detail Pembayaran:"
        calculatedHeight += 15; // 3 lines for bank details
        calculatedHeight += 5;  // Space
        calculatedHeight += 5;  // "Catatan:"
        calculatedHeight += notesLines.length * 5; // Height for notes
        calculatedHeight += 15; // Footer text
        calculatedHeight += margin; // Bottom margin

        // --- 2. Create Final PDF with dynamic height ---
        const doc = new jsPDF({
            orientation: 'l',
            unit: 'mm',
            format: [L_A4_WIDTH, calculatedHeight]
        });

        let y = margin;
        
        // --- 3. Draw Content ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(20, 20, 20);
        doc.text('ARSTATE CINEMA', margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('fotografer, videografer event, wedding, dll', margin, y + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(150, 150, 150);
        doc.text('INVOICE', L_A4_WIDTH - margin, y, { align: 'right' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`# ${invoice.invoiceNumber}`, L_A4_WIDTH - margin, y + 7, { align: 'right' });

        y += 20;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, L_A4_WIDTH - margin, y);
        y += 10;

        const detailsStartY = y;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 150);
        doc.text('DITAGIHKAN KEPADA:', margin, y);
        
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(20, 20, 20);
        doc.text(invoice.clientName, margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(clientAddressLines, margin, y + 5);
        const leftHeight = (clientAddressLines.length * 5) + 10;
        doc.text(invoice.clientEmail, margin, y + leftHeight);

        let rightY = detailsStartY;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 150);
        doc.text('DETAIL INVOICE:', L_A4_WIDTH / 2 + 10, rightY);
        rightY += 5;

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);

        doc.setFont('helvetica', 'normal');
        doc.text('Tanggal Terbit:', L_A4_WIDTH / 2 + 10, rightY);
        doc.setFont('helvetica', 'bold');
        doc.text(formatDate(invoice.issueDate), L_A4_WIDTH - margin, rightY, { align: 'right' });
        rightY += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.text('Jatuh Tempo:', L_A4_WIDTH / 2 + 10, rightY);
        doc.setFont('helvetica', 'bold');
        doc.text(formatDate(invoice.dueDate), L_A4_WIDTH - margin, rightY, { align: 'right' });

        y += leftHeight + 10;

        // Table
        const tableColumnPositions = {
            desc: margin,
            // All numeric columns are right-aligned now for consistency
            qty: L_A4_WIDTH - margin - rightMarginGap - totalColWidth - priceColWidth,
            price: L_A4_WIDTH - margin - rightMarginGap - totalColWidth,
            total: L_A4_WIDTH - margin - rightMarginGap
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setFillColor(242, 242, 242);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setTextColor(100, 100, 100);
        doc.text('Deskripsi', tableColumnPositions.desc + 2, y + 6);
        doc.text('Jumlah', tableColumnPositions.qty, y + 6, {align: 'right'});
        doc.text('Harga', tableColumnPositions.price, y + 6, {align: 'right'});
        doc.text('Subtotal', tableColumnPositions.total, y + 6, { align: 'right' });
        y += 10;
      
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(20, 20, 20);

        invoice.items.forEach(item => {
            const descriptionLines = doc.splitTextToSize(item.description || ' ', descColWidth - 2);
            const rowHeight = descriptionLines.length * 5 + 6;

            doc.text(descriptionLines, tableColumnPositions.desc + 2, y + 4);
            doc.text(item.quantity.toString(), tableColumnPositions.qty, y + 4, {align: 'right'});
            doc.text(formatCurrency(item.price), tableColumnPositions.price, y + 4, {align: 'right'});
            doc.text(formatCurrency(item.price * item.quantity), tableColumnPositions.total, y + 4, { align: 'right' });
            
            y += rowHeight - 2;
            doc.setDrawColor(230, 230, 230);
            doc.line(margin, y, L_A4_WIDTH - margin, y);
            y += 2;
        });
        
        y += 5;
        const totalX = L_A4_WIDTH - margin;
        const totalLabelX = totalX - 50;
        
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text('Subtotal', totalLabelX, y);
        doc.text(formatCurrency(totalAmount), totalX, y, { align: 'right' });
        y += 7;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setDrawColor(20, 20, 20);
        doc.line(totalLabelX - 5, y, totalX, y);
        y += 5;
        doc.text('Total', totalLabelX, y);
        doc.setTextColor(202, 138, 4); // amber-600
        doc.text(formatCurrency(totalAmount), totalX, y, { align: 'right' });
        
        y += 15;

        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, L_A4_WIDTH - margin, y);
        y += 8;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(20, 20, 20);
        doc.text('Detail Pembayaran:', margin, y);
        y += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Bank: ${invoice.bankName}`, margin, y);
        y += 5;
        doc.text(`Nomor Rekening: ${invoice.accountNumber}`, margin, y);
        y += 5;
        doc.text(`Atas Nama: ${invoice.accountHolder}`, margin, y);
        y += 10;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(20, 20, 20);
        doc.text('Catatan:', margin, y);
        y += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const pdfNotesLines = doc.splitTextToSize(invoice.notes || ' ', contentWidth);
        doc.text(pdfNotesLines, margin, y);

        doc.save(`invoice-${invoice.invoiceNumber || 'draft'}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-amber-400">Preview Invoice</h1>
        <div className="flex gap-4">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <EditIcon />
            Kembali Edit
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition disabled:bg-amber-800 disabled:cursor-not-allowed"
          >
            <DownloadIcon />
            {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
          </button>
        </div>
      </div>

      <div id="invoice-preview" className="bg-white text-gray-800 p-10 rounded-lg shadow-2xl">
        <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">ARSTATE CINEMA</h1>
            <p className="text-gray-600 mt-1">fotografer, videografer event, wedding, dll</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold uppercase text-gray-500">Invoice</h2>
            <p className="text-gray-600 mt-1"># {invoice.invoiceNumber}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Ditagihkan Kepada:</h3>
            <p className="font-bold text-lg text-gray-900">{invoice.clientName}</p>
            <p className="text-gray-600">{invoice.clientAddress}</p>
            <p className="text-gray-600">{invoice.clientEmail}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Detail Invoice:</h3>
            <div className="flex justify-between items-center">
                <p className="text-gray-700">Tanggal Terbit:</p>
                <p className="text-gray-700 font-semibold">{formatDate(invoice.issueDate)}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
                <p className="text-gray-700">Jatuh Tempo:</p>
                <p className="text-gray-700 font-semibold">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </section>
        
        <section className="mt-10">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                <th className="p-3 font-semibold">Deskripsi</th>
                <th className="p-3 font-semibold text-right w-[100px]">Jumlah</th>
                <th className="p-3 font-semibold text-right w-[160px]">Harga</th>
                <th className="p-3 font-semibold text-right w-[160px]">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="p-3 break-words">{item.description}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex justify-end mt-8">
          <div className="w-5/12 text-right">
             <div className="flex justify-between items-center text-lg text-gray-600 py-2">
                <span>Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
             </div>
             <div className="flex justify-between items-center text-2xl font-bold text-gray-900 border-t-2 border-gray-300 mt-2 pt-2">
                <span>Total</span>
                <span className="text-amber-600">{formatCurrency(totalAmount)}</span>
             </div>
          </div>
        </section>

        <footer className="mt-12 border-t-2 border-gray-200 pt-6 text-sm text-gray-600">
          <div>
            <div>
              <h3 className="font-bold text-base text-gray-800 mb-2">Detail Pembayaran:</h3>
              <p>Bank: {invoice.bankName}</p>
              <p>Nomor Rekening: {invoice.accountNumber}</p>
              <p>Atas Nama: {invoice.accountHolder}</p>
            </div>
             <div className="mt-6">
              <h3 className="font-bold text-base text-gray-800 mb-2">Catatan:</h3>
              <p>{invoice.notes}</p>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500">
            <p>Terima kasih telah melakukan bisnis dengan kami!</p>
            <p className="font-bold">ARSTATE CINEMA</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default InvoicePreview;
