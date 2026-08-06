import { CloseModalButton } from "@components/Button/CloseModalButton";
import { PostUserForm } from "@features/PostUserForm";
import React from "react";
import Modal from "react-modal";
import styles from "./styles.module.scss";

interface NewCostumerProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export const NewCostumer: React.FC<NewCostumerProps> = ({
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
      <div className={styles.container}>
        <header>
          <h1>Add New Client</h1>
        </header>

        <PostUserForm onSubmitAction={onRequestClose} />
      </div>
    </Modal>
  );
};
