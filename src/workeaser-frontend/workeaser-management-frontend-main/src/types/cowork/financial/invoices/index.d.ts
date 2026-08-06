import {
  Pagination,
  Tax,
  CoworkAccount,
  LocationRelation,
  UserRelation,
  ClientRelation,
} from "types";
import { User } from "types/user";

export interface InvoiceType {
  id: number;
  invoice_local_account_id: number;
  cowork_account_id: number;
  location_id: number;
  date: string;
  due_date: string;
  additional_notes: string;
  subtotal: number;
  total: number;
  total_taxes: number;
  open_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  total_taxes_overdue: number;
  user: User;
  // user_id: number;
  uuid: string;
}

export interface InvoicesResponse {
  result: Invoice[];
  pagination: Pagination;
}

export interface Invoice extends InvoiceType {
  activities?: InvoiceActivity[];
  coworkAccount?: CoworkAccount;
  user: UserRelation;
}

export interface InvoiceResponse {
  result: {
    invoice: InvoiceData;
    open_amount: number;
  };
}

export interface InvoiceData extends InvoiceType {
  location: LocationRelation;
  user: ClientRelation;
  items: InvoiceItem[];
}

export interface InvoiceInfoResponse {
  result: InvoiceInfo;
}
export interface InvoiceInfo extends InvoiceType {
  historic: InvoiceHistoric[];
  items: InvoiceItem[];
  payments: Payment[];
  location: LocationRelation;
  user: ClientRelation;
  is_invoice_overdue: boolean;
  total_invoice_paid: number;
  open_amount: number;
  iniFees: IniFeeItem[];
}

export interface Payment {
  id: number;
  amount: number;
  status: string;
  payment_available: number;
  created_at: string;
}

export interface InvoiceActivity {
  id: number;
  invoice_id: number;
  type: string;
  value: number;
}

export interface IniFeeItem {
  id: number;
  name: string;
  created_at: string;
  value: number;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  service_type: string;
  name: string;
  date: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit_taxes: number;
  total_taxes: number;
  total_amount: number;
  unit_taxes_overdue: number;
  total_taxes_overdue: number;
  resource_id: number;
  fees: InvoiceFee[];
  initial_fee: number;
}

export interface InvoiceFee {
  invoice_item_id: number;
  name: string;
  type: string;
  value: number;
  method: string;
  recurring_type: string;
  description: string;
  created_at: string;
  taxes: InvoiceFeeTax[];
}
export interface InvoiceFeeTax {
  id: number;
  invoice_item_fee_id: number;
  name: string;
  type: string;
  value: number;
  method: "FIXED" | "PERCENTAGE";
}

export interface InvoiceHistoric {
  payment_id: number;
  status: string;
  amount: number;
  payment_available: number;
  created_at: string;
}

export interface TableCellData {
  id: string;
  date: string;
  name: string;
  description: string;
  quantity: string;
  unit_price: string;
  total: string;
  taxable: boolean;
  deleteId: string;
  taxes: Tax[];
  initialInvoiceAmount?: boolean;
}
