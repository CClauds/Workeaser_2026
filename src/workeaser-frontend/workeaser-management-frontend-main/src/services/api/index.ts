import { getAPIClient } from "@services/apiClient";

export const api = getAPIClient();

// import axios from "axios";
// import { parseCookies } from "nookies";

// // const { "user-token": token } = parseCookies();

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
// });

// // if (token) {
// //   console.log("Service Token", token);
// //   api.defaults.headers["Authorization"] = `Bearer ${token}`;
// // }

// api.interceptors.request.use(
//   (config) => {
//     if (config.url.startsWith("/auth")) {
//       return config;
//     }
//     const { "user-token": token } = parseCookies();
//     config.headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     return config;
//   },
//   function (error) {
//     console.log("ERRR0000000R");
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );
