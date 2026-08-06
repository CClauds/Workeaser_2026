import { api } from "./../../index";
import { LocationBody, LocationRes } from "./types";

export const getLocation = async () => {
  return await api
    .get<LocationRes>("/cowork/locations")
    .then((res) => res.data.result);
};

export const addLocation = async (body: LocationBody) => {
  const res = await api.post("/cowork/locations", body);
  return res.data;
};

export const updateLocation = async (id: number, body: LocationBody) => {
  return await api
    .put(`/cowork/locations/${id}`, body)
    .then((res) => res.data.result);
};

export const deleteLocation = async (id: number) => {
  return await api.delete(`/cowork/locations/${id}`);
};
