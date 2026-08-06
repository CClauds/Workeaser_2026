import { ApiItemData, Fee, Photo, Price, DefaultService } from "types/cowork";
import { Location } from "types/locations";
import { AcceptedFiles, Tax, Pagination } from "types";

export interface VirtualOfficesResponse {
  result: VirtualOffice[];
  pagination: Pagination;
}
export interface VirtualOffice {
  id: number;
  location_id: number;
  name: string;
  description: string;
  has_dir_listing: number;
  has_mailing: number;
  has_phone_answer: number;
  has_voip: number;
  coworking_usage_mo: number;
  meetroom_usage_mo: number;
  searchable: number;
  renewal_tax: number;
  photos: Photo[];
  location: Location;
}
export interface VirtualOfficeResponse {
  result: VirtualOfficeData;
}

export interface VirtualOfficeData extends DefaultService {
  id: number;
  location_id: number;
  name: string;
  description: string;
  has_dir_listing: number;
  has_mailing: number;
  has_phone_answer: number;
  has_voip: number;
  coworking_usage_mo: number;
  meetroom_usage_mo: number;
  searchable: number;
  renewal_tax: number;
  prices: Price[];
  fees: Fee[];
  photos: Photo[];
  location: Location;
  taxes?: Tax[];
}

export type VirtualOfficeFormData = {
  location_id: number;
  name: string;
  description: string;
  has_dir_listing: string;
  has_mailing: string;
  has_phone_answer: string;
  has_voip: string;
  coworking_usage_mo: number;
  meetroom_usage_mo: number;
  searchable: string;
  renewal_tax: string;
  prices: Price[];
  fees: Fee[];
  photos: AcceptedFiles[];
};

export type VirtualOfficePostData = {
  location_id: number;
  name: string;
  description: string;
  has_dir_listing: boolean;
  has_mailing: boolean;
  has_phone_answer: boolean;
  has_voip: boolean;
  coworking_usage_mo: number;
  meetroom_usage_mo: number;
  searchable: boolean;
  renewal_tax: number;
  prices: Price[];
  fees: Fee[];
  photos: ApiItemData[];
};
