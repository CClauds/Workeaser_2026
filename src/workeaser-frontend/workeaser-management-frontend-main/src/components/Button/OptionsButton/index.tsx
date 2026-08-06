import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { Container } from "./styles";

interface OptionsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
}

export const OptionsButton: React.FC<OptionsButtonProps> = ({
  children,
  icon,
  ...props
}) => {
  return (
    <Container type="button" {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </Container>
  );
};
