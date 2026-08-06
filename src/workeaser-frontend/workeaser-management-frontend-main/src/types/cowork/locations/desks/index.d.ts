import { ApiItemData, Fee, Photo, Price } from "types/cowork";
import { Location } from "types/cowork/locations";
import { AcceptedFiles, Tax, Pagination } from "types";

export interface DesksResponse {
  result: Desk[];
  pagination: Pagination;
}
export interface Desk {
  id: number;
  location_id: number;
  name: string;
  description: string;
  shareable: number;
  searchable: number;
  quantity: number;
  minimum_rental_period: number;
  renewal_tax: number;
  photos: Photo[];
  location: Location;
}
export interface DeskResponse {
  result: DeskData;
}
export type DeskData = {
  id: number;
  location_id: number;
  name: string;
  description: string;
  shareable: number;
  searchable: number;
  quantity: number;
  minimum_rental_period: number;
  renewal_tax: number;
  day_price: number;
  is_daypass_enabled: number;
  photos: Photo[];
  location: Location;
  prices: Price[];
  fees: Fee[];
  taxes?: Tax[];
};

export type DeskFormData = {
  location_id: number;
  name: string;
  description: string;
  shareable: string;
  searchable: string;
  quantity: number;
  minimum_rental_period: number;
  renewal_tax: string;
  day_price: string;
  prices: Price[];
  fees: Fee[];
  photos: AcceptedFiles[];
};

export type DeskPostData = {
  location_id: number;
  name: string;
  description: string;
  shareable: boolean;
  searchable: boolean;
  quantity: number;
  minimum_rental_period: number;
  renewal_tax: number;
  day_price: string;
  is_daypass_enabled: number;
  prices: Price[];
  fees: Fee[];
  photos: ApiItemData[];
};
