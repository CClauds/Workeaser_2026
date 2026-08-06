import { ClientAccount } from "./user";

export type Dotsmenu = "view" | "edit" | "delete";
export type ApiItem = {
  id: number;
  name?: string;
  checked?: boolean;
};
export type AcceptedFiles = File & {
  id?: number;
  file?: string;
};
export type AccountCapability = {
  id: string;
  checked: boolean;
};
export type Service = {
  id: string;
  label: string;
  active: boolean;
};
type Suggestion = {
  id: string;
  fulltext: string;
  longitude: number;
  latitude: number;
  country?: string;
  city?: string;
  state?: string;
};
type CheckboxData = {
  id: string;
  active: boolean;
};
export type OptionType = {
  value: string | number;
  label: string;
};
type Role = "Company" | "Coworker" | "Coworking";
export type Pricing = {
  [key: string]: {
    month: string;
    full: string;
  };
};
export interface Fallback {
  [key: string]: any;
}
export interface Tax {
  name: string;
  value: number;
  type: string;
  method: string;
  recurring_type: string;
}
export interface CoworkAccount {
  id: nubmer;
  name: string;
  email: string;
  phone: string;
  photo_id: nubmer;
}
export interface SearchResponse {
  result: SearchResult[];
}
export interface SearchResult {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_type: string;
  photo: string;
  company_name: string;
}
export interface SearchResultDataResponse {
  result: SearchResultData;
}
export interface SearchResultData {
  invoices?: SearchInvoice[];
  mailboxes?: SearchMailbox[];
  bookings?: SearchBookings[];
}
interface SearchInvoice {
  id: number;
  status: string;
  client_name: string;
  due_date: string;
}
interface SearchMailbox {
  id: number;
  status: string;
  client_name: string;
  received_date: string;
}
interface SearchBookings {
  id: number;
  type: string;
  status: string;
  client_name: string;
  date: string;
}
export interface Pagination {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
}
export interface DashboardData {
  result: {
    active_locations: number;
    open_opportunities: number;
    active_members: number;
    receivable_income: number;
    total_occupancy: number;
    sales_pipeline: SalesPipelineData;
    clients_per_category: ClientsCategory;
    invoice_per_status: InvoiceStatus;
    upcoming_bookings: UpcomingBooking[];
    mailbox_requests: MailboxRequest[];
  };
  error: any;
}

interface SalesPipelineData {
  opportunity: number;
  contacted: number;
  requested: number;
  quoted: number;
  converted: number;
}
interface ClientsCategory {
  virtual_office: number;
  meeting_room: number;
  open_desk: number;
  private_room: number;
}
interface InvoiceStatus {
  partly_refunded: number;
  overdue: number;
  open: number;
  fully_paid: number;
  fully_refunded: number;
}
interface UpcomingBooking {
  id: number;
  reservation_type: string;
  name: string;
  datetime: string;
  user_type: string;
}
interface UpcomingRenewal {
  id: number;
  name: string;
  action: string;
  date: string;
}
interface MailboxRequest {
  id: number;
  name: string;
  activity_type: string;
  request: string;
}
export interface LocationsDashboardData {
  result: {
    spaces_occupancy: SpacesOccupancy[];
    units_location: UnitsLocation[];
    total_occupancy: number;
  };
}
export interface SpacesOccupancy {
  month: number;
  year: number;
  open_desk: number;
  private_room: number;
  meet_room: number;
}
export interface UnitsLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}
export interface ServiceDashboardData {
  result: {
    desk_occupancy: number;
    private_rooms_occupancy: number;
    virtual_office_plans: {
      fully_paid: number;
      partly_refunded: number;
      overdue: number;
      partly_paid: number;
    };
    clients_per_category: ClientsCategory;
    upcoming_bookings: UpcomingBooking[];
    upcoming_renewals: UpcomingRenewal[];
  };
}
export interface RelationshipDashboardData {
  result: {
    open_opportunities: number;
    active_members: number;
    lifetime_value: number;
    average_revenue: number;
    benefits_usage: number;
    sales_pipeline: SalesPipelineData;
    clients_per_category: ClientsCategory;
    average_value_per_category: AverageValuePerCategory;
    contracts_attention: {
      auto_renewal: number;
      cancelation: number;
    };
    mailbox_actions: MailboxActions;
    users_location: UnitsLocation[];
  };
}
interface AverageValuePerCategory {
  MEETING_ROOM: number;
  OPEN_DESK: number;
  PRIVATE_ROOM: number;
  VIRTUAL_OFFICE: number;
}
interface MailboxActions {
  picking_up: number;
  hold: number;
  forward: number;
  trash: number;
}
export interface DeliveryHistory {
  id: number;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
}
export interface FinancesDashboardData {
  result: {
    cashflow: Cashflow[];
    income_per_product_category: {
      [key: string]: number;
    };
    open_invoices_per_status: {
      open: number;
      partly_paid: number;
      overdue: number;
    };
    expenses_per_product_category: {
      [key: string]: number;
    };
  };
}
export interface Cashflow {
  month: string;
  income: number;
  expense: number;
  balance: number;
}
export interface NotificationsResponse {
  result: Notification[];
  pagination: Pagination;
}
export interface Notification {
  id: number;
  title: string;
  message: string;
  is_new: boolean;
  created_at: string;
  name: string;
  photo: string;
}
export interface LocationRelation {
  id: number;
  name: string;
  description: string;
  address_id: number;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string;
  address?: LocationAddressRelation;
}
export interface LocationAddressRelation {
  fulltext: string;
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  state?: string;
  short_address?: string;
}
export interface ClientRelation {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  personal_phone: string;
  personal_address_id: number;
  created_at: string;
  updated_at: string;
  photo_id: number;
  clientAccount?: ClientAccountRelation;
  personalAddress?: LocationAddressRelation;
}
export interface ClientAccountRelation {
  id: number;
  uuid: string;
  user_id: number;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address_id: number;
  company_photo_id: number;
  created_at: string;
  updated_at: string;
  companyAddress?: LocationAddressRelation;
}
export interface CoworkAccountRelation {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo_id: number;
  photo?: { file: string };
}
export interface UserRelation {
  // id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  clientAccount: ClientAccount;
}
export interface BookMeetroomResponse {
  result: BookMeetroom;
}
export interface BookMeetroom {
  id: number;
  user: UserRelation;
  location: LocationRelation;
  meetroom: BookMeetroomData;
  date_start: string;
  date_end: string;
  quantity_minutes: number;
  price_per_hour: number;
  amount_hours: number;
  fees: MeetroomFee[];
  total_minutes_billing: number;
  amount_discount: number;
  total: number;
  payment_method: string;
  status: string;
  invoice_id: number;
  additional_information: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
}
export interface MeetroomFee {
  id: number;
  meeting_id: number;
  name: string;
  type: string;
  value: number;
  method: string;
  recurring_type: string;
}
export interface BookMeetroomData {
  id: number;
  location_id: number;
  name: string;
  description: string;
  measure_unit: string;
  measure_size: number;
  measure_occupancy: number;
  price: number;
  created_at: string;
  updated_at: string;
  searchable: number;
  type: string;
  rental_timeframe: string;
  minimum_rental: string;
  cancelation_full: number;
  cancelation_half: number;
  cancelation_no: number;
  discount_three: number;
  discount_half: number;
  discount_full: number;
}
export interface AddDaypassResponse {
  result: {
    client_id: number;
    cowork_account_id: number;
    created_at: string;
    date: string;
    id: number;
    invoice_id: number;
    location_id: number;
    payment_method: string;
    price_charged: number;
    resource_id: number;
    solicited_by: string;
    space: string;
    status: string;
    updated_at: string;
    user_type: string;
  };
}
export interface SubscriptionsResponse {
  result: {
    locations: number;
    customers: number;
  };
}
export interface ContractResponse {
  result: Contract;
}

export interface Document {
  id: number;
  user_id: number;
  file: string;
  created_at: string;
  updated_at: string;
}
interface Contract {
  id: number;
  cowork_account_id: number;
  user_id: number;
  service_type: string;
  term_size: string;
  auto_renewal: number;
  payment_recurring_style: string;
  amount: number;
  cowork_usage_per_month: number;
  meeting_room_usage_per_month: number;
  created_at: string;
  updated_at: string;
  location_id: number;
  contract_document_id: number;
  envelope_id: string;
  date_start: string;
  date_end: string;
  resource_id: number;
  first_invoice_amount: number;
  status: string;
  activities: [
    {
      id: number;
      contract_id: number;
      type: string;
      value: number;
      created_at: string;
      updated_at: string;
    }
  ];
  documents: Document[];
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    personal_phone: string;
    personal_address_id: number;
    created_at: string;
    updated_at: string;
    photo_id: number;
    clientAccount: {
      id: number;
      user_id: number;
      company_name: string;
      company_email: string;
      company_phone: string;
      company_address_id: number;
      company_photo_id: number;
      created_at: string;
      updated_at: string;
    };
  };
  renew_date: string;
  service: {
    name: string;
    unitPrice: number;
  };
}
