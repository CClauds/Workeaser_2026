import React from "react";
import { ButtonsColumn, ButtonsRow, Container } from "./styles";
import { DotsMenuButton } from "@components/Button/DotsMenuButton";
import { OptionsButton } from "@components/Button/OptionsButton";
import { Icomoon } from "@components/Icomoon";
import { useTheme } from "styled-components";

interface CustomersMenuProps {
  onChatClick: () => void;
  onAttachClick: () => void;
  onDetachClick: () => void;
  onViewClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onRequestClose: () => void;
}

export const CustomersMenu: React.FC<CustomersMenuProps> = ({
  onChatClick,
  onAttachClick,
  onDetachClick,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onRequestClose,
}) => {
  const theme = useTheme();

  const handleButtonClick = (clickFunction: () => void) => () => {
    clickFunction();
    onRequestClose();
  };

  return (
    <Container>
      <ButtonsColumn>
        <OptionsButton
          onClick={handleButtonClick(onChatClick)}
          icon={<Icomoon iconName="chat" color={theme.colors.blue800} />}
        >
          CHAT
        </OptionsButton>
        <OptionsButton
          onClick={handleButtonClick(onAttachClick)}
          icon={<Icomoon iconName="lock" color={theme.colors.blue800} />}
        >
          ATTACH SERVICE
        </OptionsButton>
        <OptionsButton
          onClick={handleButtonClick(onDetachClick)}
          icon={<Icomoon iconName="unlock" color={theme.colors.blue800} />}
        >
          DETACH SERVICE
        </OptionsButton>
      </ButtonsColumn>

      <ButtonsRow>
        <DotsMenuButton
          text="View"
          icon="eye"
          theme="success"
          onClick={handleButtonClick(onViewClick)}
        />
        <DotsMenuButton
          text="Edit"
          icon="write"
          theme="warning"
          onClick={handleButtonClick(onEditClick)}
        />
        <DotsMenuButton
          text="Delete"
          icon="trash"
          theme="danger"
          onClick={handleButtonClick(onDeleteClick)}
        />
      </ButtonsRow>
    </Container>
  );
};
