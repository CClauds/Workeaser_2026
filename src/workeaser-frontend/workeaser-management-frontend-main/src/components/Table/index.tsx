import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface TableProps {
  children: ReactNode;
}

export const Table: React.FC<TableProps> = ({ children }) => {
  return <table className={styles.table}>{children}</table>;
};
