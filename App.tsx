
import React, { useState, useCallback } from 'react';
import { Invoice, LineItem } from './types';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';

const initialInvoice: Invoice = {
  invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  clientName: 'Nama Klien',
  clientAddress: 'Jl. Contoh Alamat No. 123, Kota Klien',
  clientEmail: 'email@klien.com',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
  items: [
    { id: '1', description: 'Paket Video & Foto Pernikahan (Standard)', quantity: 1, price: 7500000 },
    { id: '2', description: 'Layanan Drone Tambahan (3 Jam)', quantity: 1, price: 1500000 },
  ],
  notes: 'Terima kasih atas kepercayaan Anda menggunakan jasa ARSTATE CINEMA. Pembayaran dapat dilakukan melalui transfer ke rekening di bawah.',
  bankName: 'BCA (Bank Central Asia)',
  accountHolder: 'A/N ARSTATE CINEMA INDONESIA',
  accountNumber: '123-456-7890',
};

function App() {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [view, setView] = useState<'form' | 'preview'>('form');

  const handleInvoiceChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleItemChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const items = [...invoice.items];
    const item = items[index];
    if (name === 'quantity' || name === 'price') {
        item[name] = parseFloat(value) || 0;
    } else {
        item[name as 'description'] = value;
    }
    setInvoice(prev => ({ ...prev, items }));
  }, [invoice.items]);

  const addItem = useCallback(() => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);
  
  const handlePreview = () => setView('preview');
  const handleEdit = () => setView('form');

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      {view === 'form' ? (
        <InvoiceForm
          invoice={invoice}
          onInvoiceChange={handleInvoiceChange}
          onItemChange={handleItemChange}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onPreview={handlePreview}
        />
      ) : (
        <InvoicePreview invoice={invoice} onEdit={handleEdit} />
      )}
    </div>
  );
}

export default App;
