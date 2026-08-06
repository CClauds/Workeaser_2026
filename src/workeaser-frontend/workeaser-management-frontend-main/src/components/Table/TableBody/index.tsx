import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface TableBodyProps {
  children: ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className={styles.tableBody}>{children}</tbody>;
};
