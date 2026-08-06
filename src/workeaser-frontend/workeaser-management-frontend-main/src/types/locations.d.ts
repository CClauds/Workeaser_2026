import { LocationAddressRelation, Pagination, Tax } from "./index";

export type LocationData = {
  result: Location[];
  pagination: Pagination;
};
export type LocationResponse = {
  result: {
    location: LocationType;
    taxes_open_desk: Tax[];
    taxes_rooms: Tax[];
    taxes_meeting_room: Tax[];
    taxes_virtual_office: Tax[];
  };
};

interface MeetroomBaseService {
  name: string;
  description: string;
  price: number;
  prices?: never;
  id: number;
  service_type: string;
}
interface BaseServices {
  name: string;
  description: string;
  prices: {
    monthly_price: number;
    full_price: number;
    duration: string;
  }[];
  price?: never;
  id: number;
  service_type: string;
}
type LocationBaseService = MeetroomBaseService | BaseServices;

export interface Location {
  id: number;
  location_account_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  contracted_services: string[];
  active_members: number;
  open_balance: number;
  overdue_payments: number;
  photos: Photo[];
}
export interface LocationType {
  id: number;
  name: string;
  email: string;
  phone: string;
  description: string;
  photos: Photo[];
  address: LocationAddressRelation;
  amenities: ApiItem[];
  services: ApiItem[];
  active_members?: number;
  open_balance?: number;
  overdue_payments?: number;
  desks: LocationBaseService[];
  rooms: LocationBaseService[];
  meetrooms: LocationBaseService[];
  virtualOffices: LocationBaseService[];
}

export type ApiItem = {
  id: number;
  name?: string;
  active?: boolean;
  slug?: string;
  abbr?: string;
};

type Photo = {
  id: string;
  user_id: string;
  file: string;
};

export type Service = {
  id: string;
  active: boolean;
  tooltip?: string;
};

export type Member = {
  id: string;
  name: string;
  companyName: string;
  services: Service[];
  balanceStatus: string;
};

export type ProductsAndService = {
  id: string;
  name: string;
  clientName: string;
  servicesType: string;
  balanceStatus: string;
  endDate: string;
  autoRenewal: boolean;
};

export interface Address {
  fulltext: string;
  latitude: number;
  longitude: number;
}

export interface ServiceData {
  id: number;
  location_id: number;
  name: string;
  location: Location;
}

export interface PrivateRoomsResponse {
  result: PrivateRoom[];
  pagination: Pagination;
}
export interface PrivateRoom {
  id: number;
  room_local_account_id: number;
  name: string;
  location: string;
  location_id: number;
  address: string;
  shareability: number;
  open_balance: number;
  visibility: number;
  photo: string[];
  is_available: boolean;
  available: number;
  busy: number;
}
export interface OpenDesksResponse {
  result: OpenDesk[];
  pagination: Pagination;
}
export interface OpenDesk {
  id: number;
  desk_local_account_id: number;
  name: string;
  location: string;
  location_id: number;
  address: string;
  shareability: number;
  open_balance: number;
  visibility: number;
  photos: string[];
  is_available: boolean;
  available: number;
  busy: number;
  term_size?:
    | "MONTH_1"
    | "MONTH_3"
    | "MONTH_6"
    | "YEAR_1"
    | "YEAR_2"
    | "YEAR_3";
  auto_renewal?: boolean;
  initial_payment?: string;
  payment_recurring_style?: "MONTHLY" | "TOTAL";
}
export interface VirtualOfficesResponse {
  result: VirtualOffice[];
  pagination: Pagination;
}
export interface VirtualOffice {
  id: number;
  virt_office_local_account_id: number;
  name: string;
  address: string;
  location: string;
  location_id: number;
  active_members: number;
  inactive_members: number;
  open_balance: number;
  visibility: number;
  photos: string[];

  term_size?:
    | "MONTH_1"
    | "MONTH_3"
    | "MONTH_6"
    | "YEAR_1"
    | "YEAR_2"
    | "YEAR_3";
  auto_renewal?: boolean;
  initial_payment?: string;
  payment_recurring_style?: "MONTHLY" | "TOTAL";
}
export interface MeetRoomsResponse {
  result: MeetRoom[];
  pagination: Pagination;
}
export interface MeetRoom {
  id: number;
  meetroom_local_account_id: number;
  name: string;
  location: string;
  address: string;
  category: string;
  open_balance: number;
  visibility: number;
  photos: string[];
}
