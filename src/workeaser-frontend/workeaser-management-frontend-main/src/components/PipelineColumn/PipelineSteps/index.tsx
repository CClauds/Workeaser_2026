import React from "react";
import styles from "./styles.module.scss";

interface PipelineStepsProps {
  currentStep: number;
}

export const PipelineSteps: React.FC<PipelineStepsProps> = ({
  currentStep,
}) => {
  return (
    <div className={styles.container}>
      <div />
      <div className={currentStep >= 1 ? styles.yellow : undefined} />
      <div className={currentStep >= 2 ? styles.red : undefined} />
      <div className={currentStep >= 3 ? styles.blue : undefined} />
      <div className={currentStep >= 4 ? styles.green : undefined} />
    </div>
  );
};
