import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface RowProps {
  children: ReactNode;
  isClickable?: boolean;
  onRowClick?: () => void;
}

export const Row: React.FC<RowProps> = ({
  children,
  isClickable,
  onRowClick,
}) => {
  return (
    <tr
      className={`${styles.container} ${isClickable && styles.clickable}`}
      onClick={onRowClick}
    >
      {children}
    </tr>
  );
};
