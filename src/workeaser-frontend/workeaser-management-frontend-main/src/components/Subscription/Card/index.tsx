import React from "react";
import { formatMoney } from "utils/numberFormat";
import styles from "./styles.module.scss";

interface SubscriptionCardProps {
  value: number;
  title: string;
  subtitle: string;
  cost: number;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  value,
  title,
  subtitle,
  cost,
}) => {
  return (
    <div className={styles.container}>
      <h1>{value}</h1>

      <div>
        <h2>{title}</h2>
        <p>
          {subtitle}
          <strong>{formatMoney(cost)}</strong>
        </p>
      </div>
    </div>
  );
};
