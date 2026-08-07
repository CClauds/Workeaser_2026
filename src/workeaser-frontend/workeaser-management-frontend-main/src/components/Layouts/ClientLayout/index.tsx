import { ClientHeader } from "@components/Client/Header";
import { AuthProvider } from "@contexts/AuthContext";
import { SpacesProvider } from "@contexts/SpacesContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { theme } from "@styles/themes";
import { PagesProps } from "pages/_app";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import styled, { ThemeProvider } from "styled-components";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface ClientLayoutProps {
  children: ReactNode;
  componentProps?: PagesProps;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({
  children,
  componentProps,
}) => {
  const Main = styled.main`
    display: block;
  `;

  return (
    <AuthProvider roles={componentProps?.authRoles}>
      <ThemeProvider theme={theme}>
        <Elements stripe={stripePromise} options={{ locale: "en" }}>
          <SpacesProvider>
            <ClientHeader />
            <Main>{children}</Main>
            <ToastContainer />
          </SpacesProvider>
        </Elements>
      </ThemeProvider>
    </AuthProvider>
  );
};
