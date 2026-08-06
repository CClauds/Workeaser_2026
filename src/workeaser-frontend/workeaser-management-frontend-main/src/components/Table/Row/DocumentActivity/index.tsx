import React from "react";
import { Icomoon } from "../../../Icomoon";
import styles from "./styles.module.scss";

interface DocumentActivityProps {
  currentStep: number;
}

export const DocumentActivity: React.FC<DocumentActivityProps> = ({
  currentStep,
}) => {
  const renderItem = () => {
    const element = [];
    for (let i = 0; i < 4; i++) {
      let icon = "";
      switch (i) {
        case 0:
          icon = "send";
          break;
        case 1:
          icon = "eye";
          break;
        case 2:
          icon = "money";
          break;
        case 3:
          icon = "wallet";
          break;
        default:
          break;
      }

      element.push(
        <div
          key={i}
          className={`
          ${styles.container}
          ${currentStep < i ? styles.disabled : undefined}
        `}
        >
          {i > 0 && <span className={styles.separator}></span>}
          <Icomoon iconName={icon} />
        </div>
      );
    }
    return element;
  };

  return <div className={styles.container}>{renderItem()}</div>;
};
