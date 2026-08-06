import { Tooltip } from "@components/Tooltip";
import React, { useState } from "react";
import { Service } from "../../../../types/locations";
import styles from "./styles.module.scss";

interface ServicesProps {
  children: Service;
}

export const Services: React.FC<ServicesProps> = ({ children }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggleTooltip = (value: boolean) => () => setTooltipOpen(value);

  return (
    <div className={styles.wrapper}>
      {/* {children.map((service) => (
        <div key={service.id} className={styles.container}> */}
      <span
        // className={service.active ? "" : styles.inactive}
        onMouseEnter={toggleTooltip(true)}
        onMouseLeave={toggleTooltip(false)}
      >
        {/* {service.id} */}
      </span>
      {/* <Tooltip isActive={tooltipOpen} message={service.tooltip ?? ""} /> */}
      {/* </div>
      ))} */}
    </div>
  );
};
