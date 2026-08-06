import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface TableHeadProps {
  children: ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ children }) => {
  return (
    <thead className={styles.tableHead}>
      <tr>{children}</tr>
    </thead>
  );
};
