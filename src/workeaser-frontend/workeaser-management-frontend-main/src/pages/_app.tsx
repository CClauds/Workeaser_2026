import { AuthProvider } from "@contexts/AuthContext";
import { ErrorBoundary } from "@components/ErrorBoundary";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import "@styles/fonts.css";
import { theme } from "@styles/themes";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ReactElement, ReactNode } from "react";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { ThemeProvider } from "styled-components";
import { MenuProvider } from "../contexts/MenuContext";
import "../styles/calendar.scss";
import "../styles/globals.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

Modal.setAppElement("#__next");

const stripeKey = process.env.NEXT_PUBLIC_STRIPE;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export type PagesProps = NextPage & {
  getLayout?: (page: ReactElement, component?: PagesProps) => ReactNode;
  authRoles?: string[];
};

interface AppCustomProps extends AppProps {
  Component: PagesProps;
}

const MyApp = ({ Component, pageProps }: AppCustomProps) => {
  const router = useRouter();

  const getLayout =
    Component.getLayout ??
    ((page) => (
      <AuthProvider roles={Component.authRoles}>
        <ThemeProvider theme={theme}>
            <MenuProvider>
              {page}
              <ToastContainer />
            </MenuProvider>
        </ThemeProvider>
      </AuthProvider>
    ));

  return (
    <ErrorBoundary>
      {getLayout(
        <ErrorBoundary key={router.asPath}>
          <Component {...pageProps} />
        </ErrorBoundary>,
        Component
      )}
    </ErrorBoundary>
  );
};

export default MyApp;
