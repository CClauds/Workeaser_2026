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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);

interface ClientLayoutProps {
  children: ReactNode;
  componentProps?: PagesProps;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({
  children,
  componentProps,
}) => {
  const Main = styled.main`
    height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
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
