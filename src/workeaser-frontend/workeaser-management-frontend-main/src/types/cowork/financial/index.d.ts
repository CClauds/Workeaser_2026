import { Pagination } from "types";

export interface BankingsResponse {
  result: Banking[];
}
export interface Banking {
  id: number;
  nickname: string;
  banking_name: string;
  last_digits: string;
  is_main_account: number;
}

export interface TransactionResponse {
  result: Transaction[];
  pagination: Pagination;
}
export interface Transaction {
  id: number;
  linked_bank_account_id: number;
  transaction_id: string;
  date: string;
  description: string;
  customer: string;
  category_plaid: string;
  category: string;
  spent: number;
  received: string;
  status: string;
}
