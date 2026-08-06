import React, { ReactNode } from "react";

import styles from "./styles.module.scss";

interface ErrorTooltipProps {
  children: ReactNode;
  message: string;
}

export const ErrorTooltip: React.FC<ErrorTooltipProps> = ({
  message,
  children,
}) => {
  return (
    <div
      className={`
      ${styles.container}
    `}
    >
      {children}
      <span className={styles.message}>{message}</span>
    </div>
  );
};
