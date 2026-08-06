import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface ChartCardProps {
  children: ReactNode;
  extraClass?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  children,
  extraClass,
}) => {
  return (
    <div className={`${styles.container} ${extraClass ? extraClass : ""}`}>
      {children}
    </div>
  );
};
