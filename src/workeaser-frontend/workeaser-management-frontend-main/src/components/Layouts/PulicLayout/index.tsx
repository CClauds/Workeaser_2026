import { SpacesProvider } from "@contexts/SpacesContext";
import { PublicHeader } from "@features/PublicHeader";
import { theme } from "@styles/themes";
import { ReactNode } from "react";
import { ThemeProvider } from "styled-components";

interface PulicLayoutProps {
  children: ReactNode;
}

export const PulicLayout: React.FC<PulicLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <SpacesProvider>
        <PublicHeader />
        {children}
      </SpacesProvider>
    </ThemeProvider>
  );
};
