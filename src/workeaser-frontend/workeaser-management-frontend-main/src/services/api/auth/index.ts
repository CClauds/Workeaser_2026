import { api } from "..";
import { LoginResponse, SignInData } from "./types";

export const signInRequest = async (data: SignInData) => {
  return await api
    .post<LoginResponse>("/auth/login", data)
    .then((response) => response);
};

export const logout = async () => {
  return await api.post("/auth/logout");
};
