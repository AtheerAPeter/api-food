export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  active?: boolean;
  invoices?: Invoice[];
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  description?: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  addedBy?: User;
}

interface Invoice {
  invoiceItems?: InvoiceItem[];
  total: number;
  user?: User;
  userId: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface InvoiceItem {
  product: Product;
  id: number;
  subTotal: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}
