import React from "react";
import styles from "./styles.module.scss";

interface TooltipProps {
  message: string;
  isActive: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ message, isActive }) => {
  return (
    <>
      {message && (
        <div
          className={`${styles.container} ${
            isActive === undefined ? "" : isActive ? styles.on : styles.off
          }`}
        >
          <p className={styles.message}>{message}</p>
        </div>
      )}
    </>
  );
};
