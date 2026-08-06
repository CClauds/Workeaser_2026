import { ApiItemData, Fee, Photo, Price } from "types/cowork";
import { Location } from "types/cowork/locations";
import { AcceptedFiles, Tax, Pagination } from "types";

export interface MeetingRoomsResponse {
  result: MeetingRoom[];
  pagination: Pagination;
}
export interface MeetingRoom {
  id: number;
  location_id: number;
  name: string;
  description: string;
  measure_unit: string;
  measure_size: number;
  measure_occupancy: number;
  price: number;
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
  photos: Photo[];
  location: Location;
}
export interface MeetingRoomResponse {
  result: MeetingRoomData;
}
export type MeetingRoomData = {
  id: number;
  location_id: number;
  name: string;
  description: string;
  measure_unit: string;
  measure_size: number;
  measure_occupancy: number;
  price: number;
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
  photos: Photo[];
  location: Location;
  spaceRules: Spacerules[];
  taxes?: Tax[];
};

export type MeetingRoomFormData = {
  location_id: number;
  name: string;
  description: string;
  type: string;
  measure_unit: string;
  measure_size: number;
  measure_occupancy: number;
  rental_timeframe: number;
  minimum_rental: number;
  price: string;
  cancelation_full: number;
  cancelation_half: number;
  cancelation_no: number;
  discount_three: string;
  discount_half: string;
  discount_full: string;
  searchable: string;
  photos: AcceptedFiles[];
  space_rules: Spacerules[];
};

export type MeetingRoomPostData = {
  location_id: number;
  name: string;
  description: string;
  type: string;
  measure_unit: string;
  measure_size: number;
  measure_occupancy: number;
  rental_timeframe: number;
  minimum_rental: number;
  price: number;
  cancelation_full: number;
  cancelation_half: number;
  cancelation_no: number;
  discount_three: number;
  discount_half: number;
  discount_full: number;
  searchable: boolean;
  photos: AcceptedFiles[];
  space_rules: Spacerules[];
};

interface Spacerules {
  meetroom_question_id: number;
  answer: boolean | string;
}
export interface Tax {
  id?: number;
  name: string;
  value: number;
  type: string;
  method: string;
  recurring_type: string;
}
