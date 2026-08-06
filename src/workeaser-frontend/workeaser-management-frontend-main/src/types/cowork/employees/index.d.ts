import { Pagination } from "../../index";

export interface MemberData {
  result: Member[];
  pagination: Pagination;
}

export interface Member {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  photo_id: number;
  photo: {
    file: string;
  };
}

export interface InviteData {
  result: Invite[];
}

export interface Invite {
  id: number;
  uuid: string;
  invitee_first_name: string;
  cowork_account_id: number;
  token: string;
  email: string;
  created_at: string;
  updated_at: string;
}
