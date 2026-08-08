import { api } from "@services/api";
import { swrMiddleware } from "@services/api/middleware";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import useSWR, { SWRConfiguration, useSWRConfig } from "swr";

// type ApiResponse = {
//   status: string;
//   result: any;
//   error: any;
// };

//prettier-ignore
export function useFetch<Data=any, Error=AxiosError>(url: string, options: SWRConfiguration = {}) {
  const source = axios.CancelToken.source();
  const router = useRouter();
  const { cache } = useSWRConfig() as any;

  // console.log({ options })
  
  // const { "user-token": token } = parseCookies();
  // console.log("USEFETCH user-token",token)
  // console.log({ url })
  // if (!token) {
  //   console.log("TOKEN NOT FOUND");
  // }

  const config = {
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
    cancelToken: source.token,
  };
  
 const { data, error, mutate,isValidating } = useSWR<Data, Error>(
   url,
   async (url) => {
     const response = await api.get(url, config);
     return response.data;
    //  return response.data.result ?? response.data;
   },
   options
 );

  if (axios.isCancel(error)) {
    console.log("Data fetching cancelled");
  } else {
    // Handle error
  }
  
  if (axios.isAxiosError(error))  {
    console.log({url});
    // console.log(error);
    if (error.response) {
      console.log(error.response);
      // 1B.2-httpOnly fix: Solo redirigir a /login si /me devuelve 401
      // (sesión realmente expirada). Un 401 en otros endpoints (ej. invoices
      // sin módulo FINANCES) es error de permisos, no de sesión.
      if (error.response.status === 401 && url === "/me") {
        cache.clear();
        router.push({
          pathname: "/login",
          query: { returnTo: router.asPath, expired: true },
        });
      }
    }
  }

  
  return { data, error, mutate, isLoading: !error && !data,isValidating };
}
