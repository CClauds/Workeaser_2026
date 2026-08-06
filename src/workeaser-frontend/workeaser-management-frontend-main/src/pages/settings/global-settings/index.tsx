import { Icomoon } from "@components/Icomoon";
import { Download } from "@components/Icons";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { AuthContext } from "@contexts/AuthContext";
import { Agendas } from "@features/GlobalSettings/Agendas";
import { Banking } from "@features/GlobalSettings/Banking";
import { ExternalServices } from "@features/GlobalSettings/ExternalServices";
import { ImportExport } from "@features/GlobalSettings/ImportExport";
import { Invoicing } from "@features/GlobalSettings/Invoicing";
import { Payments } from "@features/GlobalSettings/Payments";
import { api } from "@services/api";
import {
  Container,
  Content,
  Navigation,
  NavigationButton,
} from "@styles/pages/settings/global-settings/styles";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { PagesProps } from "pages/_app";
import { ReactElement, useContext, useEffect } from "react";
import { useTheme } from "styled-components";
import { mutate } from "swr";

const TabComponents = {
  AGENDAS: Agendas,
  INVOICING: Invoicing,
  BANKING: Banking,
  PAYMENTS: Payments,
  IMPORT: ImportExport,
  EXTERNAL_SERVICES: ExternalServices,
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { tab, validation } = context.query;

  return {
    props: {
      tab: validation ? "PAYMENTS" : tab ?? "AGENDAS",
      validation: validation ?? null,
    },
  };
};

interface GlobalSettingsProps {
  tab: string;
  validation: string;
}
const GlobalSettings = ({ tab, validation }: GlobalSettingsProps) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const router = useRouter();
  const { query } = router;

  useEffect(() => {
    const updateValidationStatus = async () => {
      await api.put("/cowork/status", {
        status: "VALID",
      });
      mutate("/cowork/status");
      router.push({
        pathname: "/settings/global-settings",
        query: { tab: "PAYMENTS" },
      });
    };
    if (query?.validation === "succeed" && user) {
      updateValidationStatus();
    }
  }, [query, user]);

  const activeLink = tab;

  const handleNavigate = (link: string) => () => {
    router.push({
      pathname: "/settings/global-settings",
      query: { tab: link },
    });
  };

  const RenderTabContent = TabComponents[activeLink];

  return (
    <Container>
      <Navigation>
        <NavigationButton
          onClick={handleNavigate("AGENDAS")}
          isActive={activeLink === "AGENDAS"}
        >
          <Icomoon iconName="calendar" size={16} />
          AGENDAS
        </NavigationButton>
        <NavigationButton
          onClick={handleNavigate("INVOICING")}
          isActive={activeLink === "INVOICING"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(335 260)"
                  fill="#00a2dd"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-335 -260)" clipPath="url(#clipPath)">
              <g transform="translate(333 258.4)">
                <path
                  d="M5.6,11.6a.4.4,0,0,1,.4-.4h8a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,11.6Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M5.6,14a.4.4,0,0,1,.4-.4h8a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,14Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M5.6,9.2A.4.4,0,0,1,6,8.8h8a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,9.2Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M5.6,6.8A.4.4,0,0,1,6,6.4H9.2a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,6.8Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M4.4,2.4a.4.4,0,0,0-.4.4V16.4a.4.4,0,0,0,.4.4H15.6a.4.4,0,0,0,.4-.4V7.6a.4.4,0,0,0-.4-.4H12.4A1.2,1.2,0,0,1,11.2,6V2.8a.4.4,0,0,0-.4-.4Zm-1.2.4A1.2,1.2,0,0,1,4.4,1.6h6.4A1.2,1.2,0,0,1,12,2.8V6a.4.4,0,0,0,.4.4h3.2a1.2,1.2,0,0,1,1.2,1.2v8.8a1.2,1.2,0,0,1-1.2,1.2H4.4a1.2,1.2,0,0,1-1.2-1.2Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M11.269,2.4H10.8V1.6h.469a1.2,1.2,0,0,1,.849.351l4.331,4.331a1.2,1.2,0,0,1,.351.849V7.6H16V7.131a.4.4,0,0,0-.117-.283L11.551,2.517A.4.4,0,0,0,11.269,2.4Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
          INVOCING RULES
        </NavigationButton>
        <NavigationButton
          onClick={handleNavigate("BANKING")}
          isActive={activeLink === "BANKING"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(335 309)"
                  fill="#00a2dd"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-335 -309)" clipPath="url(#clipPath)">
              <g transform="translate(334.272 308.637)">
                <path
                  d="M7.273,6.545A.727.727,0,0,1,8,5.818H9.455a.727.727,0,0,1,.727.727v5.818a.727.727,0,0,1-.727.727H8a.727.727,0,0,1-.727-.727Zm2.182,0H8v5.818H9.455Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M12.364,6.545a.727.727,0,0,1,.727-.727h1.455a.727.727,0,0,1,.727.727v5.818a.727.727,0,0,1-.727.727H13.091a.727.727,0,0,1-.727-.727Zm2.182,0H13.091v5.818h1.455Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M2.182,6.545a.727.727,0,0,1,.727-.727H4.364a.727.727,0,0,1,.727.727v5.818a.727.727,0,0,1-.727.727H2.909a.727.727,0,0,1-.727-.727Zm2.182,0H2.909v5.818H4.364Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M8.571.763a.364.364,0,0,1,.313,0L16.52,4.4a.364.364,0,0,1-.156.692H1.091A.364.364,0,0,1,.935,4.4ZM2.7,4.364H14.754L8.727,1.494Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M2.182,14.182a.364.364,0,0,1,.364-.364H14.909a.364.364,0,0,1,0,.727H2.545A.364.364,0,0,1,2.182,14.182Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M.727,15.636a.364.364,0,0,1,.364-.364H16.364a.364.364,0,0,1,0,.727H1.091A.364.364,0,0,1,.727,15.636Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
          BANKING
        </NavigationButton>
        <NavigationButton
          onClick={handleNavigate("PAYMENTS")}
          isActive={activeLink === "PAYMENTS"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(325 355)"
                  fill="#00a2dd"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-325 -355)" clipPath="url(#clipPath)">
              <g transform="translate(324.272 354.272)">
                <path
                  d="M.727,4.727A1.091,1.091,0,0,1,1.818,3.636H15.636a1.091,1.091,0,0,1,1.091,1.091v8a1.091,1.091,0,0,1-1.091,1.091H1.818A1.091,1.091,0,0,1,.727,12.727Zm1.091-.364a.364.364,0,0,0-.364.364v8a.364.364,0,0,0,.364.364H15.636A.364.364,0,0,0,16,12.727v-8a.364.364,0,0,0-.364-.364Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M7.475,6.888a3.083,3.083,0,0,0-.566,1.839,3.083,3.083,0,0,0,.566,1.839,1.587,1.587,0,0,0,1.252.707,1.587,1.587,0,0,0,1.252-.707,3.083,3.083,0,0,0,.566-1.839,3.083,3.083,0,0,0-.566-1.839,1.587,1.587,0,0,0-1.252-.707A1.587,1.587,0,0,0,7.475,6.888Zm-.582-.436a2.31,2.31,0,0,1,1.834-1,2.31,2.31,0,0,1,1.834,1,3.808,3.808,0,0,1,.712,2.275A3.808,3.808,0,0,1,10.561,11a2.31,2.31,0,0,1-1.834,1,2.31,2.31,0,0,1-1.834-1,3.808,3.808,0,0,1-.712-2.275A3.808,3.808,0,0,1,6.894,6.452Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M1.091,5.818A1.818,1.818,0,0,0,2.909,4h.727A2.545,2.545,0,0,1,1.091,6.545Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M2.909,13.455a1.818,1.818,0,0,0-1.818-1.818v-.727a2.545,2.545,0,0,1,2.545,2.545Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M16.364,5.818A1.818,1.818,0,0,1,14.545,4h-.727a2.545,2.545,0,0,0,2.545,2.545Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M14.545,13.455a1.818,1.818,0,0,1,1.818-1.818v-.727a2.545,2.545,0,0,0-2.545,2.545Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
          PAYMENTS
        </NavigationButton>
        <NavigationButton
          onClick={handleNavigate("IMPORT")}
          isActive={activeLink === "IMPORT"}
        >
          <Download size={16} color={theme.colors.blue200} />
          IMPORT/EXPORT
        </NavigationButton>
        <NavigationButton
          onClick={handleNavigate("EXTERNAL_SERVICES")}
          isActive={activeLink === "EXTERNAL_SERVICES"}
        >
          <Download size={16} color={theme.colors.blue200} />
          EXTERNAL SERVICES
        </NavigationButton>
      </Navigation>

      <Content>
        <RenderTabContent />
      </Content>
    </Container>
  );
};

GlobalSettings.authRoles = ["COWORKING"];
GlobalSettings.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default GlobalSettings;
