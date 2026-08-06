import React, { ReactNode } from "react";

import styles from "./styles.module.scss";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
}) => {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      {children}
    </div>
  );
};
