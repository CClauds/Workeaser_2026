import { LocationAddressRelation } from "types";
import { Location } from "types/locations";

export type LocationBody = {
  name: string;
  description: string;
  address: LocationAddressRelation;
  amenities: ApiItem[];
  photos: ApiItem[];
  services: ApiItem[];
};

type Address = {
  fulltext: string;
  fulltext2: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  state?: string;
  city?: string;
  zipcode?: string;
};

type ApiItem = {
  id: number | string;
};

export type LocationRes = {
  result: Location[];
};
