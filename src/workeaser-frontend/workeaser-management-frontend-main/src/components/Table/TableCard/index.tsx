import React, { ReactNode } from "react";

import styles from "./styles.module.scss";

interface TableCardProps {
  title: string;
  children: ReactNode;
}

export const TableCard: React.FC<TableCardProps> = ({ title, children }) => {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      {children}
    </div>
  );
};
