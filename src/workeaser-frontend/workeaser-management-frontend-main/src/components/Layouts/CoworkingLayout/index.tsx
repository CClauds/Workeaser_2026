import { Header } from "@components/Header";
import { Sidebar } from "@components/Sidebar";
import { AuthProvider } from "@contexts/AuthContext";
import { MenuProvider } from "@contexts/MenuContext";
import { theme } from "@styles/themes";
import { PagesProps } from "pages/_app";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "styled-components";
import { Content } from "./styles";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { SpacesProvider } from "@contexts/SpacesContext";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface CoworkingLayoutProps {
  children: ReactNode;
  componentProps?: PagesProps;
}

export const CoworkingLayout: React.FC<CoworkingLayoutProps> = ({
  children,
  componentProps,
}) => {
  return (
    <AuthProvider roles={componentProps?.authRoles}>
      <ThemeProvider theme={theme}>
        <Elements stripe={stripePromise} options={{ locale: "en" }}>
          <MenuProvider>
            <Header />
            <Content>
              <Sidebar />
              <div>{children}</div>
            </Content>
            <ToastContainer />
          </MenuProvider>
        </Elements>
      </ThemeProvider>
    </AuthProvider>
  );
};
