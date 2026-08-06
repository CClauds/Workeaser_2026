import { api } from "@services/api";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import { createContext, ReactNode, useEffect } from "react";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";
import { UserClient, UserCoworking } from "types/user";
import { useFetch } from "../hooks/useFetch";

type AuthContextDate = {
  isAuthenticated: boolean;
  user: UserCoworking & UserClient;
  signOut: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
  roles?: string[];
};

export const AuthContext = createContext({} as AuthContextDate);

export const AuthProvider = ({ children, roles }: AuthProviderProps) => {
  const { "user-token": token } = parseCookies();
  const { cache } = useSWRConfig() as any;

  const { data, error } = useFetch<{ result: UserCoworking[] & UserClient[] }>(
    token ? "/me" : null
  );

  let user = data ? data.result[0] : null;

  const isAuthenticated = !!user;

  let role = user?.role;
  let allowed = true;

  const router = useRouter();

  useEffect(() => {
    if (error) {
      signOut();
      return;
    }

    if (roles?.includes("UNAUTH")) {
      return;
    }

    let nextPath: string;
    if (role === "COWORKING") {
      nextPath = router.asPath === "/" ? "/dashboard" : router.asPath;
    } else if (role === "CLIENT") {
      nextPath = router.asPath === "/" ? "/spaces" : router.asPath;
    }

    if (!token) {
      toast.warn("Sorry, you are not authenticated.");
      cache.clear(); // ⚠️ Clear all the cache. SWR will revalidate upon re-render.
      router.push({
        pathname: "/login",
        query: nextPath ? { returnTo: nextPath, expired: true } : {},
      });
      return;
    }

    if (nextPath) {
      router.push(nextPath);
      return;
    }
  }, [role]);

  // if (router.pathname.startsWith("/client") && !roles?.includes(role)) {
  // console.log("CLUENTE<<<<<<<<<<<<<<<<<<<");
  //   if (role) {
  // console.log("allowed<<<<<<<<<<<<<<<<<<<FALSE");
  //     allowed = false;
  //     router.push("/login");
  //   }
  // }

  // useEffect(() => {
  //   const role = user?.role;
  // console.log("user Role", role);
  //   if (router.pathname.startsWith("/client") && role !== "CLIENT") {
  //     if (role) {
  // console.log(router.pathname.replace("client", role));
  //       // router.push(router.pathname.replace("client", role));
  //     } else {
  //       // router.push("/");
  //     }
  //   }
  // }, [user, router]);

  const signOut = async () => {
    cache.clear(); // ⚠️ Clear all the cache. SWR will revalidate upon re-render.
    await api.post("/auth/logout");
    destroyCookie(null, "user-token");
    router.push("/login");
  };

  // const ComponentToRender = allowed ? children : <Login />;

  const value = { isAuthenticated, user, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
