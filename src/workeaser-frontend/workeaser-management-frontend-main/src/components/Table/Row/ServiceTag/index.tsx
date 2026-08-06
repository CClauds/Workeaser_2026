import { Tooltip } from "@components/Tooltip";
import React, { ReactNode, useState } from "react";
import { ApiItem } from "types/locations";
import styles from "./styles.module.scss";

interface ServiceTagProps {
  children: ReactNode;
  isActive?: boolean;
  tooltip?: string;
}

enum ServicesNameEnum {
  VO = "Virtual Office",
  MR = "Meeting Room",
  OD = "Open Desk",
  PR = "Private Room",
}

export const ServiceTag: React.FC<ServiceTagProps> = ({
  children,
  isActive,
  tooltip,
}) => {
  const [tooltipOpen, setTooltipOpen] = useState<boolean>();

  const toggleTooltip = (value: boolean) => () => setTooltipOpen(value);

  return (
    <div className={styles.container}>
      <span
        className={isActive ? "" : styles.inactive}
        onMouseEnter={toggleTooltip(true)}
        onMouseLeave={toggleTooltip(false)}
      >
        {children}
      </span>
      <Tooltip
        isActive={tooltipOpen}
        message={tooltip ?? ServicesNameEnum[children as string]}
      />
    </div>
  );
};
