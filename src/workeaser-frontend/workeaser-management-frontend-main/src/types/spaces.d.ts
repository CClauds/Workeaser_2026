import { CoworkAccountRelation, LocationAddressRelation } from "types";
import { TermSizeEnum } from "./enums";
import { RoomData } from "types/cowork/locations/rooms";
import { MeetingRoomData } from "types/cowork/locations/meetingRoom";
import { DeskData } from "types/cowork/locations/desks";
import { VirtualOfficeData } from "types/cowork/locations/virtualOffice";
import { Fee } from "./cowork";

type TermSize = keyof typeof TermSizeEnum;

export interface SpaceLocationsResponse {
  result: {
    id: number;
    name: string;
    description: string;
    email: string;
    phone: string;
    address: LocationAddressRelation;
    amenities: { id: number; name: string }[];
    photos: { file: string }[];
    meetrooms: MeetingRoomData[];
    coworkAccount: CoworkAccountRelation;
    rooms: RoomData[];
    desks: DeskData[];
    virtualOffices: VirtualOfficeData[];
    manager: {
      name: string;
      photo: string;
    };
  };
}
export interface SpaceResponse {
  result: {
    coworking_name: string;
    coworking_logo: string;
    space_host_photo: string;
    space_host_name: string;
    photos: string[];
    service_name: string;
    service_type: string;
    description: string;
    location_description: string;
    location_id: number;
    amenities: { id: number; name: string }[];
    address: LocationAddressRelation;
    contract_pricing?: ContractPricing[];
    price: number;
    renewal_tax: number;
    price_type: string;
    other_services: OtherService[];
    initial_fee: number;
    fees?: Fee[];
    cancelation_full: number;
    cancelation_half: number;
    cancelation_no: number;
    discount_three: number;
    discount_half: number;
    discount_full: number;
  };
}

interface OtherService {
  id: number;
  name: string;
  service_type: string;
  photo: string;
  price: number;
  price_type: string;
  qty_persons: number;
}

interface ContractPricing {
  term_size: TermSize;
  payment_full: number;
  initial_fee_full: number;
  payment_month: number;
  initial_fee_month: number;
}
