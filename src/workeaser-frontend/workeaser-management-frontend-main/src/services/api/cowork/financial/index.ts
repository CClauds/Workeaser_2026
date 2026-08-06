import { api } from "./../../index";

export const getTax = async () => {
  return await api.get("/cowork/Taxs").then((res) => res.data.result);
};

export const addTax = async (body) => {
  return await api.post("/cowork/Taxs", body).then((res) => res.data);
};

export const updateTax = async (id: number, body) => {
  return await api
    .put(`/cowork/Taxs/${id}`, body)
    .then((res) => res.data.result);
};

export const deleteTax = async (id: number) => {
  return await api.delete(`/cowork/Taxs/${id}`);
};
