import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface SubscriptionSummaryProps {
  children: ReactNode;
}

export const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({
  children,
}) => {
  return <div className={styles.container}>{children}</div>;
};
