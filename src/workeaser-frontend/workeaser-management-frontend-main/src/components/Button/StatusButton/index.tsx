import React, { ReactNode } from "react";
import { ButtonHTMLAttributes } from "react";

import styles from "./styles.module.scss";

interface StatusButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  status: "ACTIVE" | "INACTIVE";
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  children,
  status,
  ...props
}) => {
  return (
    <button
      className={`${styles.container} ${
        status === "ACTIVE"
          ? styles.active
          : status === "INACTIVE"
          ? styles.inactive
          : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
};
