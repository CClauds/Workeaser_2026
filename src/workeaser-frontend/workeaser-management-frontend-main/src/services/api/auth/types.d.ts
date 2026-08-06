import { User } from "../../../types";

export interface SignInData {
  email: string;
  password: string;
  remember_me: boolean;
}

export type LoginResponse = {
  status: string;
  result: {
    type: string;
    token: string;
    expires_at: string;
    user: User;
  };
  error: any;
};
