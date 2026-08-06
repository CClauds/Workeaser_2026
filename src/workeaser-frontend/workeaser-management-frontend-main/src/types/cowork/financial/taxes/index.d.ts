import { Pagination } from "types";
import { ServiceData } from "types/cowork";

export interface TaxesResponse {
  result: TaxData[];
  pagination: Pagination;
}

export interface TaxeResponse {
  result: TaxData;
}

export type TaxData = {
  id?: number;
  cowork_account_id?: number;
  name: string;
  type: string;
  method: string;
  recurring_type: string;
  value: number;
  services?: ServiceData[];
};
