import { Header } from "@components/Header";
import { Sidebar } from "@components/Sidebar";
import { MenuContext, MenuProvider } from "@contexts/MenuContext";
import { theme } from "@styles/themes";
import { ReactNode, useContext } from "react";
import { ThemeProvider } from "styled-components";
import { Content } from "./styles";

interface NavbarLayoutProps {
  children: ReactNode;
  hasSidebar?: boolean;
}

export const NavbarLayout: React.FC<NavbarLayoutProps> = ({
  children,
  hasSidebar = true,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <MenuProvider>
        <Header hasSidebar={hasSidebar} />
        <Content>
          {hasSidebar ? <Sidebar /> : null}
          <div>{children}</div>
        </Content>
      </MenuProvider>
    </ThemeProvider>
  );
};
