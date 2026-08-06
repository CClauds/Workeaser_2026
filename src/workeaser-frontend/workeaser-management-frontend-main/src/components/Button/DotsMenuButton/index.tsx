import { Icomoon } from "@components/Icomoon";
import React, { ButtonHTMLAttributes } from "react";
import { Container } from "./styles";

interface DotsMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon: string;
  theme?: string;
  flip?: boolean;
}

export const DotsMenuButton: React.FC<DotsMenuButtonProps> = ({
  text,
  icon,
  theme,
  flip,
  ...props
}) => {
  return (
    <Container
      type="button"
      data-testid="dots-menu-button"
      className={theme ?? ""}
      {...props}
    >
      <Icomoon iconName={icon} flip={flip} />
      {text}
    </Container>
  );
};
