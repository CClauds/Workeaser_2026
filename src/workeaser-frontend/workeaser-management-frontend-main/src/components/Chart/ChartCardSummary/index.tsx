import Money from "dinero.js";
import React from "react";
import styles from "./styles.module.scss";

interface ChartCardSummaryProps {
  title: string;
  value: number | string;
  valueLabel?: string;
  type?: string;
  direction?: string;
}

export const ChartCardSummary: React.FC<ChartCardSummaryProps> = ({
  title,
  value,
  valueLabel,
  type,
  direction = "row",
}) => {
  const RenderValue = () => {
    if (typeof value === "string") {
      return (
        <span
          className={`${styles.number} ${
            type === "currency"
              ? styles.currency
              : type === "monthly"
              ? styles.monthly
              : ""
          }`}
        >
          {value}
        </span>
      );
    }

    const amount = Money({ amount: value }).toFormat("0,0.00");
    if (type === "currency" || type === "monthly") {
      return (
        <span
          className={`${styles.number} ${
            type === "currency"
              ? styles.currency
              : type === "monthly"
              ? styles.monthly
              : ""
          }`}
        >
          {amount.slice(0, -3)}
          <span className={styles.suffix}>{amount.slice(-3)}</span>
        </span>
      );
    }
    // const formattedNumer = nFormatter(amount);
    // console.log({ value, amount, formattedNumer   });
    // if (isNaN(Number(amount.slice(-1)))) {
    //   return (
    //     <span
    //       className={`${styles.number} ${
    //         type === "currency"
    //           ? styles.currency
    //           : type === "monthly"
    //           ? styles.monthly
    //           : ""
    //       }`}
    //     >
    //       {amount.slice(0, -1)}
    //       <span className={styles.suffix}>{amount.slice(-1)}</span>
    //     </span>
    //   );
    // }

    return (
      <span
        className={`${styles.number} ${
          type === "currency"
            ? styles.currency
            : type === "monthly"
            ? styles.monthly
            : ""
        }`}
      >
        {value}
      </span>
    );
  };

  return (
    <div className={`${styles.container} ${styles[direction]}`}>
      <div className={styles.cardHeader}>
        <h3>{title}</h3>
      </div>

      <div className={styles.numberContainer}>
        <RenderValue />
        {valueLabel && (
          <div>
            <p>{valueLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};
