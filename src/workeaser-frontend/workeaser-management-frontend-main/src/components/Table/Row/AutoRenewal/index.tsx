import React from "react";
import styles from "./styles.module.scss";

interface AutoRenewalProps {
  children: boolean;
}

export const AutoRenewal: React.FC<AutoRenewalProps> = ({ children }) => {
  const className = children ? "green" : "red";

  return <span className={styles[className]}></span>;
};
