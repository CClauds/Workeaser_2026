import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import React from "react";
import Modal from "react-modal";
import { Content } from "./styles";

interface ConfirmationModalProps {
  title: string;
  text: string;
  onConfirm: () => void;
  isOpen: boolean;
  onRequestClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  text,
  onConfirm,
  isOpen,
  onRequestClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />

      <Content>
        <h1>{title}</h1>
        <p>{text}</p>

        <div>
          <Button text="YES" onClick={onConfirm} />
          <Button text="NO" color="danger" onClick={onRequestClose} />
        </div>
      </Content>
    </Modal>
  );
};
