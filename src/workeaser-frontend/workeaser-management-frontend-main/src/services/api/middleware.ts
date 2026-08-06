import { Middleware, SWRHook } from "swr";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import { api } from ".";

export const swrMiddleware: Middleware = (useSWRNext: SWRHook) => {
  // const router = useRouter();
  return (key, fetcher, config) => {
    // Before hook runs...
    // console.log("key", key);
    // console.log("fetcher", fetcher);
    // console.log("config", config);
    const { "user-token": token } = parseCookies();
    // console.log("TOKEN!", token);
    if (!token) {
      console.log("Session Expired");
      // console.log(router);
      // toast.error("Session Expired");
      // router.push("/login");
    }
    api.defaults.headers["Authorization"] = `Bearer ${token}`;
    // Handle the next middleware, or the `useSWR` hook if this is the last one.
    const swr = useSWRNext(key, fetcher, config);

    // After hook runs...
    return swr;
  };
};
