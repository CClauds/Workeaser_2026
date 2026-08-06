import { Photo } from "types/locations";
import { Service } from "types/infos";
import { BookingTypeEnum, ContractStatusEnum } from "./enums";
import {
  ClientAccountRelation,
  ClientRelation,
  CoworkAccountRelation,
  DeliveryHistory,
  LocationAddressRelation,
  LocationRelation,
  Pagination,
} from "types";

export type BookingType = keyof typeof BookingTypeEnum;
export interface GenericBooking {
  id: number;
  type: BookingType;
  user_name: string;
  user_email: string;
  location_name: string;
  resource_name?: string;
  start_date: string;
  end_date: string;
}
export interface BookingsResponse {
  result: BookingsData[];
}
export interface BookingsData {
  id: number;
  user_name: string;
  user_email: string;
  booking_type: BookingType;
  service_type: string;
  resource_name: string;
  location_name: string;
  start_date: string;
  end_date: string;
  status: string;
  potential_earnings: number;
}
export interface ScheduleResponse {
  result: ScheduleData[];
}
export interface ScheduleData {
  id: number;
  type: BookingType;
  service_type: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  company_name: string;
  location_name: string;
  date_start: string;
  date_end: string;
}
export interface PersonasResponse {
  result: Lead[];
  pagination: Pagination;
}
export interface Lead {
  id: number;
  lead_local_account_id: number;
  cowork_account_id: number;
  client_account_id: number;
  status: string;
  last_contact: string;
  opportunities: Opportunity[];
  services: Service[];
  clientAccount: ClientAccount;
}
export interface Opportunity {
  id: number;
  lead_id: number;
  service_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  notes: string;
  service: Service;
}
export interface MailboxesResponse {
  result: MailboxData[];
  pagination: Pagination;
}
export interface MailboxResponse {
  result: MailboxData;
}
export interface MailboxData {
  id: number;
  delivery_id: string;
  delivery_date: string;
  requested_action: string;
  status: string;
  location_id: number;
  additional_information: string;
  forward_observation: string;
  created_at: string;
  historic: DeliveryHistory[];
  photos: Photo[];
  location: LocationRelation;
  clientAccount: ClientAccountRelation;
  coworkAccount: CoworkAccountRelation;
}
export interface Event {
  id: number;
  lead_id: number;
  status: string;
  space: string;
  location_id: number;
  created_at: string;
  updated_at: string;
  location: LocationRelation;
  lead: Lead;
}
export interface Tour extends Event {
  date_start: string;
  date_end: string;
}
export interface DayPass extends Event {
  date: string;
  space: string;
  user_type: string;
  client_id: number;
  payment_method: string;
  invoice_id: number;
  cowork_account_id: 1;
  resource_id: number;
  solicited_by: string;
  price_charged: number;
  client?: ClientRelation;
}
export interface OpenContractsResponse {
  result: ContractType[];
}
export interface ContractType {
  id: number;
  uuid: string;
  cowork_account_id: number;
  user_id: number;
  service_type: string;
  term_size: string;
  auto_renewal: number;
  payment_recurring_style: string;
  amount: number;
  cowork_usage_per_month: number;
  meeting_room_usage_per_month: number;
  location_id: number;
  contract_document_id: number;
  envelope_id: string;
  date_start: string;
  date_end: string;
  service_started_date: string;
  service_renew_cancel_date: string;
  resource_id: number;
  first_invoice_amount: number;
  status: ContractStatus;
  service_name: string;
  renew_date: string;
  document_file: {
    file: string;
  }[];
}
export interface ContractsResponse {
  result: Contract[];
  pagination: Pagination;
}
export interface Contract extends ContractType {
  user: User;
}
interface ClientAccount {
  // id: number;
  // user_id: number;
  uuid: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address_id: number;
  company_photo_id: number;
  created_at: string;
  updated_at: string;
  user: User;
}
interface User {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  personal_phone: string;
  created_at: string;
  updated_at: string;
  photo: {
    file: string;
  };
  clientAccount: {
    uuid: string;
    company_name: string;
    company_email: string;
    company_phone: string;
    company_address_id: number;
    company_photo_id: number;
  };
}
type ContractStatus = keyof typeof ContractStatusEnum;
export interface PipelineResponse {
  result: Pipeline;
}
export interface Pipeline {
  opportunity: PipelineItem[];
  contacted: PipelineItem[];
  requested: PipelineItem[];
  quoted: PipelineItem[];
  converted: PipelineItem[];
}
interface PipelineItem {
  id: number;
  name: string;
  type: string;
}
