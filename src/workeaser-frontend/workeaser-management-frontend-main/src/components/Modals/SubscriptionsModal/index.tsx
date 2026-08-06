import React from "react";
import Modal from "react-modal";
import styles from "../styles.module.scss";

interface QuickactionsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  modal: string;
}

export const QuickactionsModal: React.FC<QuickactionsModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <button
        type="button"
        onClick={onRequestClose}
        className={`${styles.closeButton} react-modal-close`}
      >
        <p>CLOSE</p>
        <svg
          id="Grupo_1906"
          data-name="Grupo 1906"
          width="15.556"
          height="15.556"
          viewBox="0 0 15.556 15.556"
        >
          <rect
            id="Retângulo_423"
            data-name="Retângulo 423"
            width="20"
            height="2"
            rx="1"
            transform="translate(1.414) rotate(45)"
            fill="#2b3450"
          />
          <rect
            id="Retângulo_424"
            data-name="Retângulo 424"
            width="20"
            height="2"
            rx="1"
            transform="translate(15.556 1.414) rotate(135)"
            fill="#2b3450"
          />
        </svg>
      </button>

      <></>
    </Modal>
  );
};
