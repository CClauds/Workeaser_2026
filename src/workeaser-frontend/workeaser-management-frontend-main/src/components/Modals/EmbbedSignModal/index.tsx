import { CloseModalButton } from "@components/Button/CloseModalButton";
import React, { ReactNode, useEffect } from "react";
import Modal from "react-modal";
import { Content, EmbbedIframe } from "./styles";

interface DetailsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  embbedLink?: string;
}

export const EmbbedSignModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onRequestClose,
  embbedLink,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Sign the contract</h1>
        </header>

        <Content>
          <EmbbedIframe src={embbedLink} />
        </Content>
      </>
    </Modal>
  );
};
