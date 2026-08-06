import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface TooltipProps {
  message?: string;
  children?: ReactNode;
  isActive: boolean;
  width?: number | string;
}

export const CustomTooltip: React.FC<TooltipProps> = ({
  children,
  message,
  isActive,
  width,
}) => {
  const RenderMessage = () => {
    if (message) {
      return <p className={styles.message}>{message}</p>;
    }

    return <>{children}</>;
  };

  return (
    <div
      className={`${styles.container} ${
        isActive === undefined ? "" : isActive ? styles.on : styles.off
      }`}
      style={{ width }}
    >
      <RenderMessage />
    </div>
  );
};
