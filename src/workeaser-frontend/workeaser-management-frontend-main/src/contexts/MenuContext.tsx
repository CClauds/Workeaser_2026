import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";

type PathHistory = {
  current: string;
  last: string;
};

interface MenuContextData {
  pathHistory: PathHistory;
  isOpen: boolean;
  handleSidebarToggle: () => void;
}

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuContext = createContext({} as MenuContextData);

export const MenuProvider = ({ children }: MenuProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pathHistory, setPathHistory] = useState({ current: "", last: "" });

  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const { "wkz.sidebaOpen": isSidebarOpen } = cookies;
    if (isSidebarOpen) setIsOpen(isSidebarOpen === "true" ? true : false);
  }, []);

  useEffect(() => {
    const path = router.asPath.split("/")[1];
    setPathHistory((oldPathHistory) => ({
      last: oldPathHistory.current ?? path,
      current: path,
    }));
  }, [router]);

  useEffect(() => {
    setCookie(null, "wkz.sidebaOpen", String(isOpen), {
      sameSite: "lax",
      path: "/",
    });
  }, [isOpen]);

  const handleSidebarToggle = () => setIsOpen(!isOpen);

  return (
    <MenuContext.Provider
      value={{
        pathHistory,
        isOpen,
        handleSidebarToggle,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
