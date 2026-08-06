import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { InputComponent } from "@components/FormElements/Input";
import React, { useState } from "react";
import Modal from "react-modal";
import { Container } from "./styles";

interface SingleInputModalProps {
  onSubmitObservation: (text: string) => void;
  isOpen: boolean;
  onRequestClose: () => void;
}

export const SingleInputModal: React.FC<SingleInputModalProps> = ({
  onSubmitObservation,
  isOpen,
  onRequestClose,
}) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    onSubmitObservation(text);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Add Note</h1>
        </header>

        <Container>
          <InputComponent
            placeholder="Observation"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
          />

          <Button text="ADD NOTE" onClick={handleSubmit} />
        </Container>
      </>
    </Modal>
  );
};
