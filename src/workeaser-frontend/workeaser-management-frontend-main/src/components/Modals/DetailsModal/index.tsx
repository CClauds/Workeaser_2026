import React, { ReactNode } from "react";
import Modal from "react-modal";
import { Content } from "./styles";

interface DetailsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title?: string;
  children?: ReactNode;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onRequestClose,
  title,
  children,
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    className="react-deatail-modal-content"
    overlayClassName="react-deatail-modal-overlay"
  >
    <button
      type="button"
      onClick={onRequestClose}
      className="react-modal-close"
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

    <Content>
      <h1>{title}</h1>

      <div>{children}</div>
    </Content>
  </Modal>
);
