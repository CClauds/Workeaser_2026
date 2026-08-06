import { api } from "@services/api";

interface FileResponse {
  file: string;
  id: number;
}

export const uploadImage = async (file: File) => {
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  const fd = new FormData();
  fd.append("photo", file);
  return await api
    .post("/photos", fd, config)
    .then((res) => res.data.result ?? res.data);
};

export const uploadDocument = async (file: File): Promise<FileResponse> => {
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  const fd = new FormData();
  fd.append("document", file);
  return await api
    .post("/documents", fd, config)
    .then((res) => res.data.result ?? res.data);
};

export const uploadFile = async (
  url: string,
  file: File
): Promise<FileResponse> => {
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  const fd = new FormData();
  fd.append("file", file);
  return await api
    .post(url, fd, config)
    .then((res) => res.data.result ?? res.data);
};
