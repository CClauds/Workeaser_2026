import { User } from "types/user";

export interface MessagesResponse<T> {
  result: T;
}

export interface LastMessages extends ChatMessage {
  chat: Chat;
}

export interface ChatMessage {
  message: string;
  created_at: string;
  updated_at: string;
  is_read: number;
  sent_by: string;
}

export interface Chat {
  uuid: string;
  clientAccount?: ClientAccount;
  coworkAccount?: CoworkAccount;
}

export interface ClientAccount {
  company_name: string;
  company_photo_id: number;
  id: number;
  user: User;
  companyPhoto: CompanyPhoto;
}
export interface CompanyPhoto {
  file: string;
  id: number;
}

export interface CoworkAccount {
  name: string;
  photo: Photo;
}

export interface Photo {
  file: string;
  id: number;
}
