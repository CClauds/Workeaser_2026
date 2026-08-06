import React, { ButtonHTMLAttributes } from "react";
import styles from "./styles.module.scss";

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const CloseButton: React.FC<CloseButtonProps> = ({
  className = "",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`${styles.container} ${className}`}
      {...props}
    >
      <svg width="7.991" height="7.991" viewBox="0 0 7.991 7.991">
        <g
          id="Grupo_1723"
          data-name="Grupo 1723"
          transform="translate(-24.222 -26.222)"
        >
          <rect
            id="Retângulo_423"
            data-name="Retângulo 423"
            width="10.273"
            height="1.027"
            rx="0.514"
            transform="translate(24.948 26.222) rotate(45)"
            fill="#2b3450"
          />
          <rect
            id="Retângulo_424"
            data-name="Retângulo 424"
            width="10.273"
            height="1.027"
            rx="0.514"
            transform="translate(32.212 26.948) rotate(135)"
            fill="#2b3450"
          />
        </g>
      </svg>
    </button>
  );
};
