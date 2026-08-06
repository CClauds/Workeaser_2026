import React from "react";
import { Container, NabButton } from "./styles";

interface NavigationButtonProps {
  buttonTexts: string[];
  activeButton: string;
  callback: (text: string) => () => void;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  buttonTexts,
  activeButton,
  callback,
}) => {
  return (
    <Container>
      {buttonTexts.map((button) => (
        <NabButton
          key={button}
          type="button"
          isActive={activeButton === button.replace(/ /gi, "")}
          onClick={callback(button)}
        >
          {button}
        </NabButton>
      ))}
    </Container>
  );
};
