import React from "react";
import { ButtonHTMLAttributes } from "react";

import styles from "./styles.module.scss";

interface HeaderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  extraClass?: string;
}

export const HeaderButton: React.FC<HeaderButtonProps> = ({
  children,
  extraClass,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`
        ${styles.container} 
        ${extraClass}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
