export interface User {
  // id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "CLIENT" | "COWORKING" | "ADMIN";
  personal_phone: string;
  personalAddress: Address;
  photo: Photo;
}

export interface UserCoworking extends User {
  coworkUser: CoworkUser;
}
export interface UserClient extends User {
  clientAccount: ClientAccount;
}

export interface UserResponse {
  result: UserCoworking[] & UserClient[];
}

interface Address {
  fulltext: string;
  latitude: number;
  longitude: number;
  country: string;
}
interface Photo {
  file: string;
}
interface CoworkUser {
  uuid: string;
  role: CoworkUserRole;
  coworkAccount: CoworkAccount;
  coworkModules: CoworkModule[];
}

export interface CoworkModule {
  id: number;
  name: string;
  slug: CoworkModulesSlug;
  created_at: string;
  updated_at: string;
}

type CoworkModulesSlug = keyof typeof CoworkModulesEnum;

export enum CoworkModulesEnum {
  LOCATIONS = "LOCATIONS",
  SERVICES = "SERVICES",
  RELATIONSHIP = "RELATIONSHIP",
  FINANCES = "FINANCES",
  REPORTS = "REPORTS",
  ACCOUNT_SETTINGS = "ACCOUNT_SETTINGS",
  VIRTUAL_OFFICE = "VIRTUAL_OFFICE",
  MEETROOM = "MEETROOM",
}

export enum CoworkUserRole {
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEEE",
}

interface CoworkAccount {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  photo: Photo;
}
interface ClientAccount {
  // id: number;
  uuid: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  companyAddress: Address;
  companyPhoto: Photo;
}

export type UserCoworkFormData = {
  first_name: string;
  last_name: string;
  email: string;
  photo_id: File;
  personal_phone: string;
  personal_address: {
    fulltext: string;
  };
  cowork: {
    name: string;
    email: string;
    phone: string;
    photo_id: File;
  };
};
