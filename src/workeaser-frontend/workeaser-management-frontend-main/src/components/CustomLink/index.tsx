import React, { ReactNode } from "react";
import { Container } from "./styles";

interface CustomLinkProps {
  children: ReactNode;
}

export const CustomLink: React.FC<CustomLinkProps> = ({ children }) => {
  return <Container>{children}</Container>;
};
