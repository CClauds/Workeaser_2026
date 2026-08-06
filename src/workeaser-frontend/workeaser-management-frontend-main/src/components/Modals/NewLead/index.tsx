import { CloseModalButton } from "@components/Button/CloseModalButton";
import { AddLead } from "@features/Forns/AddLead";
import React from "react";
import Modal from "react-modal";
import styles from "./styles.module.scss";

interface NewLeadProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export const NewLead: React.FC<NewLeadProps> = ({ isOpen, onRequestClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <div className={styles.container}>
        <header>
          <h1>Add New Lead</h1>
        </header>

        <AddLead onClose={onRequestClose} />
      </div>
    </Modal>
  );
};
