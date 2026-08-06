import { ApiItemData, Fee, Photo, Price } from "types/cowork";
import { Location } from "types/cowork/locations";
import { AcceptedFiles, Tax, Pagination } from "types";

export interface RoomsResponse {
  result: Room[];
  pagination: Pagination;
}
export interface Room {
  id: number;
  location_id: number;
  name: string;
  description: string;
  space_size_unit: string;
  space_size: number;
  room_capacity: number;
  shareable: number;
  searchable: number;
  minimum_rental_period: number;
  renewal_tax: number;
  day_price: number;
  is_daypass_enabled: number;
  photos: Photo[];
  photo: Photo[];
  location: Location;
}
export interface RoomResponse {
  result: RoomData;
}
export interface RoomData extends Room {
  prices: Price[];
  fees: Fee[];
  taxes?: Tax[];
}

export type RoomFormData = {
  location_id: number;
  name: string;
  description: string;
  space_size_unit: string;
  space_size: number;
  room_capacity: number;
  shareable: string;
  searchable: string;
  minimum_rental_period: number;
  renewal_tax: string;
  day_price: string;
  prices: Price[];
  fees: Fee[];
  photos: AcceptedFiles[];
};

export type RoomPostData = {
  location_id: number;
  name: string;
  description: string;
  space_size_unit: string;
  space_size: number;
  room_capacity: number;
  shareable: boolean;
  searchable: boolean;
  minimum_rental_period: number;
  renewal_tax: number;
  day_price: string;
  is_daypass_enabled: number;
  prices: Price[];
  fees: Fee[];
  photos: ApiItemData[];
};
