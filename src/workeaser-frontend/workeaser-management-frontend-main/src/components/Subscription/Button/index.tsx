import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.scss";

interface SubscriptionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <button className={styles.container} {...props}>
      {children}
    </button>
  );
};
