import { AuthProvider } from "@contexts/AuthContext";
import { ErrorBoundary } from "@components/ErrorBoundary";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import { theme } from "@styles/themes";
import "mapbox-gl/dist/mapbox-gl.css";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
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
// HF-SPRINT-E-03: cookie consent banner LGPD montado globalmente
import { CookieBanner } from "@components/CookieBanner";

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
  const getLayout =
    Component.getLayout ??
    ((page) => (
      <AuthProvider roles={Component.authRoles}>
        <ThemeProvider theme={theme}>
          {stripePromise ? (
            <Elements stripe={stripePromise} options={{ locale: "en" }}>
              <MenuProvider>
                {page}
                <ToastContainer />
              </MenuProvider>
            </Elements>
          ) : (
            <MenuProvider>
              {page}
              <ToastContainer />
            </MenuProvider>
          )}
        </ThemeProvider>
      </AuthProvider>
    ));

  return (
    <ErrorBoundary>
      {getLayout(
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>,
        Component
      )}
      {/* HF-SPRINT-E-03: cookie banner LGPD (renderiza só se consent unknown — self-controlled via hook) */}
      <CookieBanner />
    </ErrorBoundary>
  );
};

export default MyApp;
