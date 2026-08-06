import React, { ReactNode } from "react";
import { Icomoon } from "../Icomoon";
import styles from "./styles.module.scss";

interface PipelineColumnProps {
  title: string;
  color: string;
  children: ReactNode;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  title,
  color,
  children,
}) => {
  return (
    <div className={styles.container}>
      <header
        className={`
        ${styles.column}
        ${styles[color]}
        ${color !== "gray" ? styles.leftPad : undefined}
      `}
      >
        {title}
        <Icomoon iconName="arrow-down" />
      </header>

      <div className={styles.content}>{children}</div>
    </div>
  );
};
