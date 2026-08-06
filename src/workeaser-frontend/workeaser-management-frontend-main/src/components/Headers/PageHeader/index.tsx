import React, { ReactNode } from "react";

import styles from "./styles.module.scss";

interface PageHeaderProps {
  children: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ children }) => {
  return <header className={styles.container}>{children}</header>;
};
