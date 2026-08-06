export interface SingleRequest<T> {
  status: string;
  result: T;
  error: any;
}

export interface DealAndOpportunity {
  id: number;
  client_account_id: number;
  location_id: number;
  service_type: string;
  resource_id: number;
  inquire_type: string;
  created_at: string;
  updated_at: string;
  potential_earnings: number;
  cowork_account_id: number;
  requested_date: string;
  initial_payment: string;
  term_size: "MONTH_1" | "MONTH_3" | "MONTH_6" | "YEAR_1" | "YEAR_2" | "YEAR_3";
  contract_recurring: "MONTHLY" | "TOTAL";
  auto_renew: string;
  service_name: string;
  requested_service: string;
  location_name: string;
  clientAccount: ClientAccount;
  location: Location;
}

export interface ClientAccount {
  id: number;
  company_name: string;
  company_email: any;
  company_phone: any;
  company_address_id: any;
  company_photo_id: any;
  created_at: string;
  updated_at: string;
  cowork_account_id: number;
  client_acc_local_account_id: any;
  uuid: string;
  companyAddress: any;
  user: User;
}

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  personal_phone: string;
  created_at: string;
  updated_at: string;
  uuid: string;
  photo: any;
}

export interface Location {
  id: number;
  name: string;
  description: string;
  address_id: number;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string;
  location_account_id: any;
  address: Address;
  photos: Photo[];
}

export interface Address {
  fulltext: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  country: string;
  city: string;
  state: string;
  uuid: string;
  short_address: string;
}

export interface Photo {
  id: number;
  user_id: number;
  file: string;
  created_at: string;
  updated_at: string;
}
