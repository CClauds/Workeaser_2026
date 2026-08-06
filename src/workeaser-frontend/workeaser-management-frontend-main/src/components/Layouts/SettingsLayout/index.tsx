import { ClientSettingsHeader } from "@components/Headers/ClientSettingsHeader";
import { SettingsHeader } from "@components/Headers/SettingsHeader";
import React, { ReactNode } from "react";
import { Container, Title } from "./styles";

interface SettingsLayoutProps {
  children: ReactNode;
  title?: string;
  role?: string;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  title = "Account Settings",
  role,
}) => {
  return (
    <Container>
      {title && <Title>{title}</Title>}
      {role === "CLIENT" ? <ClientSettingsHeader /> : <SettingsHeader />}
      {children}
    </Container>
  );
};
