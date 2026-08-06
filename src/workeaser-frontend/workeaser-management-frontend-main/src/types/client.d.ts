import {
  CoworkAccountRelation,
  LocationAddressRelation,
  Pagination,
} from "types";
import { ServicesAbbrEnum, ServicesSlugEnum } from "types/enums";

export type ServicesNameType = keyof typeof ServicesSlugEnum;
export type ServicesAbbr = `${ServicesAbbrEnum}`;

export interface MembershipResponse {
  result: Membership[];
}

export interface Membership {
  id: number;
  coworking_name: string;
  location_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  photos: string[];
  services: ServicesNameType[];
}

export interface SpacesResponse {
  pagination: Pagination;
  result: Space[];
}

export interface Space {
  id: number;
  title: string;
  coworking_name: string;
  price: number;
  price_type: string;
  coworking_services: ServicesAbbr[];
  cover_photo?: string;
  qty_persons?: number;
  available?: number;
  measure_size?: number;
  address: {
    fulltext: string;
    latitude: number;
    longitude: number;
    country: string;
  };
}

export interface MembershipResourceResponse {
  result: MembershipResource;
}
export interface MembershipResource {
  id: number;
  name: string;
  description: string;
  address_id: number;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string;
  address: LocationAddressRelation;
  photos: [
    {
      file: string;
    }
  ];
  coworkAccount: CoworkAccountRelation;
  status: "ACTIVE" | "INACTIVE";
  logo: string;
}
