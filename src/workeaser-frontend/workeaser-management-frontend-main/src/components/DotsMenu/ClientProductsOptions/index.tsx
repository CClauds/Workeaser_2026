import React from "react";
import { OptionsButton } from "@components/Button/OptionsButton";
import { Container } from "./styles";
import { Icomoon } from "@components/Icomoon";
import { useTheme } from "styled-components";

interface ClientProductsOptionsProps {
  onViewContract: () => void;
  onViewDocuments: () => void;
  onSignContract: () => void;
  handleClose: () => void;
  onSendContract?: () => void | null;
  onCancelContract?: () => void | null;
}
export const ClientProductsOptions: React.FC<ClientProductsOptionsProps> = ({
  onViewContract,
  onViewDocuments,
  onSignContract,
  onSendContract,
  onCancelContract,
  handleClose,
}) => {
  const theme = useTheme();

  const handleViewContract = () => {
    onViewContract();
    handleClose();
  };
  const handleViewDocuments = () => {
    onViewDocuments();
    handleClose();
  };
  const handleSendContract = () => {
    onSendContract();
    handleClose();
  };
  const handleSignDocuments = () => {
    onSignContract();
    handleClose();
  };
  const handleCancelContrat = () => {
    onCancelContract();
    handleClose();
  };

  return (
    <Container>
      <OptionsButton
        onClick={handleViewContract}
        icon={<Icomoon iconName="eye" color={theme.colors.blue800} />}
      >
        VIEW CONTRACT
      </OptionsButton>
      <OptionsButton
        onClick={handleViewDocuments}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(1141 531)"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-1141 -531)">
              <g transform="translate(1139.476 529.477)">
                <path
                  d="M6.1,2.667A1.143,1.143,0,0,1,7.238,1.524h3.81A1.143,1.143,0,0,1,12.19,2.667V5.714a.381.381,0,0,0,.381.381h3.048a1.143,1.143,0,0,1,1.143,1.143v6.1a1.143,1.143,0,0,1-1.143,1.143H12.571v-.762h3.048A.381.381,0,0,0,16,13.333v-6.1a.381.381,0,0,0-.381-.381H12.571a1.143,1.143,0,0,1-1.143-1.143V2.667a.381.381,0,0,0-.381-.381H7.238a.381.381,0,0,0-.381.381V4.952H6.1Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M11.494,2.286H10.286V1.524h1.208a1.143,1.143,0,0,1,.808.335l4.125,4.125a1.143,1.143,0,0,1,.335.808V8H16V6.792a.381.381,0,0,0-.112-.269L11.763,2.4A.381.381,0,0,0,11.494,2.286Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M3.429,5.333a.381.381,0,0,0-.381.381V16.381a.381.381,0,0,0,.381.381H11.81a.381.381,0,0,0,.381-.381v-6.1A.381.381,0,0,0,11.81,9.9H8.762A1.143,1.143,0,0,1,7.619,8.762V5.714a.381.381,0,0,0-.381-.381Zm-1.143.381A1.143,1.143,0,0,1,3.429,4.571h3.81A1.143,1.143,0,0,1,8.381,5.714V8.762a.381.381,0,0,0,.381.381H11.81a1.143,1.143,0,0,1,1.143,1.143v6.1a1.143,1.143,0,0,1-1.143,1.143H3.429a1.143,1.143,0,0,1-1.143-1.143Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M7.684,5.333H6.476V4.571H7.684a1.143,1.143,0,0,1,.808.335l4.125,4.125a1.143,1.143,0,0,1,.335.808v1.589H12.19V9.839a.381.381,0,0,0-.112-.269L7.954,5.445A.381.381,0,0,0,7.684,5.333Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        VIEW DOCUMENTS
      </OptionsButton>
      {(onSendContract || onSendContract === null) && (
        <OptionsButton
          disabled={!onSendContract}
          onClick={handleSendContract}
          icon={<Icomoon iconName="send" color={theme.colors.blue800} />}
        >
          SEND CONTRACT
        </OptionsButton>
      )}
      <OptionsButton
        disabled={!onSignContract}
        onClick={handleSignDocuments}
        icon={<Icomoon iconName="write" color={theme.colors.blue800} />}
      >
        SIGN CONTRACT
      </OptionsButton>
      {(onCancelContract || onCancelContract === null) && (
        <OptionsButton
          onClick={handleCancelContrat}
          icon={<Icomoon iconName="unlock" color={theme.colors.blue800} />}
        >
          CANCEL AGREEMENT
        </OptionsButton>
      )}
    </Container>
  );
};
