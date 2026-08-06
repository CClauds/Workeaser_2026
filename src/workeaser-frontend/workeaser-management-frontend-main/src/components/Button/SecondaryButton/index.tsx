import React, { ReactNode } from "react";
import { ButtonHTMLAttributes } from "react";

import styles from "./styles.module.scss";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  buttonType?: "primary" | "success";
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  buttonType = "primary",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`${styles.container} ${styles[buttonType]}`}
      {...props}
    >
      {children}
    </button>
  );
};
