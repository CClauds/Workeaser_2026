export interface WalletResponse {
  result: WalletData;
}

export interface WalletData {
  cards: Card[];
  bank_accounts: BankAccount[];
}

export interface Card {
  id: number;
  user_id: number;
  cardholder_name: string;
  brand: string;
  country: string;
  exp_month: number;
  exp_year: number;
  last_digits: string;
  funding: string;
  nickname: string;
}

export interface BankAccount {
  id: number;
  user_id: number;
  holder_name: string;
  holder_type: string;
  bank_name: string;
  country: string;
  currency: string;
  last_digits: string;
  routing_number: string;
  nickname: string;
}
