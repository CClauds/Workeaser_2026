import { Icomoon } from "@components/Icomoon";
import React, {
  ButtonHTMLAttributes,
  forwardRef,
  MutableRefObject,
} from "react";
import { Container } from "./styles";

interface BadgeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  isActive?: boolean;
  notification?: boolean;
}

const BadgeButtonComponent = (
  { icon, isActive, notification, ...props },
  ref: MutableRefObject<HTMLButtonElement>
) => (
  <Container
    ref={ref}
    type="button"
    active={isActive}
    notification={notification}
    {...props}
  >
    <Icomoon iconName={icon} />
  </Container>
);

export const BadgeButton = forwardRef<HTMLButtonElement, BadgeButtonProps>(
  BadgeButtonComponent
);
