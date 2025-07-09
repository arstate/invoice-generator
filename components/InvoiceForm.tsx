
import React from 'react';
import { Invoice } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface InvoiceFormProps {
  invoice: Invoice;
  onInvoiceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onItemChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onPreview: () => void;
}

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string }> = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
  </div>
);

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onInvoiceChange, onItemChange, onAddItem, onRemoveItem, onPreview }) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const totalAmount = invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-400">ARSTATE CINEMA</h1>
        <p className="text-lg text-gray-300">Invoice Generator</p>
      </div>

      <div className="space-y-8">
        {/* Client Details */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Detail Klien</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nama Klien" name="clientName" value={invoice.clientName} onChange={onInvoiceChange} placeholder="John Doe" />
            <InputField label="Email Klien" name="clientEmail" value={invoice.clientEmail} onChange={onInvoiceChange} type="email" placeholder="john.doe@example.com" />
            <div className="md:col-span-2">
              <InputField label="Alamat Klien" name="clientAddress" value={invoice.clientAddress} onChange={onInvoiceChange} placeholder="Jl. Raya No. 123, Jakarta" />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Detail Invoice</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Nomor Invoice" name="invoiceNumber" value={invoice.invoiceNumber} onChange={onInvoiceChange} />
            <InputField label="Tanggal Diterbitkan" name="issueDate" value={invoice.issueDate} onChange={onInvoiceChange} type="date" />
            <InputField label="Tanggal Jatuh Tempo" name="dueDate" value={invoice.dueDate} onChange={onInvoiceChange} type="date" />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Rincian Pesanan</h2>
          <div className="space-y-4">
            {invoice.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  name="description"
                  value={item.description}
                  onChange={(e) => onItemChange(index, e)}
                  placeholder="Deskripsi layanan atau produk"
                  className="col-span-12 md:col-span-6 bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  name="quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onItemChange(index, e)}
                  placeholder="Jml"
                  className="col-span-3 md:col-span-2 bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  name="price"
                  type="number"
                  value={item.price}
                  onChange={(e) => onItemChange(index, e)}
                  placeholder="Harga"
                  className="col-span-6 md:col-span-3 bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className="col-span-3 md:col-span-1 text-red-500 hover:text-red-400 flex justify-center items-center"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddItem}
            className="mt-4 flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold"
          >
            <PlusIcon />
            Tambah Item
          </button>
          <div className="mt-6 border-t border-gray-700 pt-4 text-right">
            <p className="text-2xl font-bold text-white">Total: {formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Detail Pembayaran & Catatan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Bank" name="bankName" value={invoice.bankName} onChange={onInvoiceChange} placeholder="BCA" />
            <InputField label="Pemilik Rekening" name="accountHolder" value={invoice.accountHolder} onChange={onInvoiceChange} placeholder="A/N John Doe" />
            <InputField label="Nomor Rekening" name="accountNumber" value={invoice.accountNumber} onChange={onInvoiceChange} placeholder="1234567890" />
          </div>
          <div className="mt-4">
             <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Catatan</label>
             <textarea
                id="notes"
                name="notes"
                value={invoice.notes}
                onChange={onInvoiceChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Informasi tambahan..."
              ></textarea>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={onPreview}
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Preview Invoice
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
