import React from "react";

import { Input } from "../Form/Input";
import styles from "./styles.module.scss";

interface PricingCardProps {
  name: string;
  periodNumber: number;
  periodTime: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  periodNumber,
  periodTime,
}) => {
  return (
    <div className={styles.container}>
      <h2>
        Contract Term of{" "}
        <strong>
          {periodNumber} {periodTime}:
        </strong>
      </h2>

      <div className={styles.flexRow}>
        <p>Paying Month by Month:</p>
        <span>$</span>
        <Input name={`${name}.month`} type="number" extraClass={styles.input} />
      </div>

      <div className={styles.flexRow}>
        <p>Paying in Full:</p>
        <span>$</span>
        <Input name={`${name}.full`} type="number" extraClass={styles.input} />
      </div>
    </div>
  );
};
