import { Address } from "@services/api/cowork/locations/types";

export interface ClientInfoResponse {
  result: ClientInfo;
}
export interface ClientInfo {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  personal_phone: string;
  phone: string;
  photo: string;
  company_name: string;
  location: string;
}

export interface LastInvoices {
  result: LastInvoice[];
}

export interface LastInvoice {
  id: number;
  uuid: string;
  date: string;
  status: string;
  amount: number;
  due_date: string;
  open_amount: number;
}

export interface ClientsResponse {
  result: Client[];
}
export interface Client extends ClientGeneric {
  id: number;
}

export interface ClientGeneric {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  role: string;
  personal_phone: string;
  phone: string;
  uuid: string;
  personal_address_id: number;
  photo_id: number;
  photo: { file: string };
  open_balance: number;
  contracted_services: string[];
  balance_status: string;
  next_due_date: string;
  personalAddress: Address;
  clientAccount: ClientAccount;
}

export interface ClientUpdated {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  personal_phone: string;
  uuid: string;
  personal_address_id: number;
  photo_id: number;
  photo: { file: string };
  open_balance: number;
  contracted_services: string[];
  balance_status: string;
  next_due_date: string;
  clientAccount: ClientAccount;
}

interface ClientAccount {
  id?: number;
  uuid?: string;
  client_acc_local_account_id?: number;
  // user_id: number;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address_id?: number;
  company_photo_id?: number;
}

export interface MailboxesResponse {
  result: MailboxData[];
}
export interface MailboxData {
  id: number;
  name: string;
  photo: string;
  location: string;
  action: string;
  status: string;
  received: string;
}

export interface BookingDataResponse {
  result: BookingData[];
}
export interface BookingData {
  id: number;
  name: string;
  type: string;
  date: string;
  status: string;
}

export interface InvoiceDataResponse {
  result: InvoiceData[];
}
export interface InvoiceData {
  id: number;
  uuid: string;
  user: {
    uuid: string;
  };
  date: string;
  status: string;
  amount: number;
  open_amount: number;
  due_date: string;
}

export interface ClientProductResponse {
  result: ClientProduct[];
}
export interface ClientProduct {
  id: number;
  type: string;
  status: string;
  name: string;
  service_started_date: string;
  service_renew_cancel_date: string;
  auto_renewal: number;
  document_file: string;
  documents: { file: string }[];
}

export interface OverviewResponse {
  result: OverviewData;
}
export interface OverviewData {
  [month: string]: {
    [day: string]: number;
  };
}

export interface BenefitsDataResponse {
  result: BenefitsData;
}

export interface BenefitsData {
  meetingHours: string;
  meetingHoursUsage: {
    paid: number;
    included: number;
    free: number;
  };
  deskTotalDaysUsage: number;
  deskDaysUsage: {
    paid: number;
    included: number;
    free: number;
  };
  totalCreditsUsage: number;
  creditsUsage: {
    included: number;
    free: number;
  };
}
