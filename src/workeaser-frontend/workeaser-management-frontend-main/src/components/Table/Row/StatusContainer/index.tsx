import React from "react";
import { ContractStatusEnum } from "types/enums";
import styles from "./styles.module.scss";

interface StatusContainerProps {
  children: string;
  bgColor?: "green" | "gray" | "red" | "yellow" | "blue";
}

export const StatusContainer: React.FC<StatusContainerProps> = ({
  children,
  bgColor,
}) => {
  let color = "transparent";
  if (bgColor) {
    color = bgColor;
  } else {
    if (children?.toLowerCase() === "fully paid") color = "green";
    else if (children?.toLowerCase() === "converted") color = "green";
    else if (children?.toLowerCase() === "normal") color = "green";
    else if (children?.toLowerCase() === "renewal") color = "green";
    else if (children?.toLowerCase() === "active") color = "green";
    else if (children?.toLowerCase() === "approved") color = "green";
    else if (children?.toLowerCase() === "collected") color = "green";
    else if (children?.toLowerCase() === "partially paid") color = "gray";
    else if (children?.toLowerCase() === "quoted") color = "gray";
    else if (children?.toLowerCase() === "opportunity") color = "gray";
    else if (children?.toLowerCase() === "trashed") color = "gray";
    else if (children?.toLowerCase() === "waiting your signature")
      color = "yellow";
    else if (children?.toLowerCase() === "open balance") color = "yellow";
    else if (children?.toLowerCase() === "open invoice") color = "yellow";
    else if (children?.toLowerCase() === "forwarded") color = "yellow";
    else if (children?.toLowerCase() === "contacted") color = "yellow";
    else if (children?.toLowerCase() === "high") color = "yellow";
    else if (children?.toLowerCase() === "awaiting") color = "yellow";
    else if (children?.toLowerCase() === "rejected") color = "red";
    else if (children?.toLowerCase() === "overdue balance") color = "red";
    else if (children?.toLowerCase() === "request") color = "red";
    else if (children?.toLowerCase() === "critical") color = "red";
    else if (children?.toLowerCase() === "overdue") color = "red";
    else if (children?.toLowerCase() === "not collected") color = "red";
    else if (children?.toLowerCase() === "cancelation") color = "red";
    else if (children?.toLowerCase() === "inactive") color = "red";
    else if (children?.toLowerCase() === "canceled") color = "red";
    else color = "gray";
  }

  return (
    <span
      className={`
        ${styles.container}
        ${styles[color]}
      `}
    >
      {children}
    </span>
  );
};
