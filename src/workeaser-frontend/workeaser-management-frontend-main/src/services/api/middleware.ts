import { Middleware, SWRHook } from "swr";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import { api } from ".";

export const swrMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    // 1B.2-httpOnly fix: la cookie es httpOnly → parseCookies() cliente NO la lee.
    // El navegador envía la cookie automáticamente (withCredentials). CookieAuth
    // middleware en backend la inyecta como Bearer. NO setear Authorization header
    // desde JS — era `Bearer undefined` y pisaba el header correcto.
    const swr = useSWRNext(key, fetcher, config);
    return swr;
  };
};
