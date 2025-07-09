
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  notes: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
}
