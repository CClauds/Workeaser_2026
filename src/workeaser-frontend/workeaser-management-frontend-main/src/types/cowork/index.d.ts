export type ServiceData = {
  id: number;
  name: string;
};

export type Fee = {
  id?: number;
  name: string;
  description: string;
  amount: string;
};

export type ApiItemData = {
  id: number | number;
};

export type Price = {
  duration: string;
  monthly_price: string;
  full_price: string;
};

export type Photo = {
  id: string;
  file: string;
};

export interface DefaultService {
  id: string;
  date: string;
  name: string;
  description: string;
  quantity: string;
  unit_price: string;
  total: number;
  taxable: boolean;
  deleteId?: string;
  taxes: ServiceTax[];
}

export interface ServiceTax {
  id?: number;
  name: string;
  value: number;
  type: string;
  method: string;
  recurring_type: string;
}

export interface Resource {
  name: string;
  description: string;
  coworking_usage_mo: number;
  meetroom_usage_mo: number;
  fees: Fee[];
  prices: Price[];
  taxes?: Tax[];
}
