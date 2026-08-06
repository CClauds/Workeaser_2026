import { Tooltip } from "@components/Tooltip";
import React, { useState } from "react";
import { ServicesAbbr } from "types/client";
import { ServicesNameEnum } from "types/enums";
import { Service } from "types/infos";
import styles from "./styles.module.scss";

interface CardServicesProps {
  services: Service[];
  contractedServices: ServicesAbbr[];
}

export const CardServices: React.FC<CardServicesProps> = ({
  services,
  contractedServices,
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(-1);

  const toggleTooltip = (value: number) => () => setTooltipOpen(value);

  const ServiceComponent = ({
    currentService,
    index,
  }: {
    currentService: ServicesAbbr;
    index: number;
  }) => {
    const actualService = services.find(
      (service) => service.abbr === currentService
    );

    return (
      <div
        key={actualService.id}
        className={styles.labelWrapper}
        onMouseEnter={toggleTooltip(index)}
        onMouseLeave={toggleTooltip(-1)}
      >
        <span title={actualService.name}>{actualService.abbr}</span>

        <Tooltip
          isActive={tooltipOpen === index ? true : undefined}
          message={
            actualService.name ?? ServicesNameEnum[actualService.slug as string]
          }
        />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {contractedServices.map((service, index) => (
        <ServiceComponent
          key={service}
          currentService={service}
          index={index}
        />
      ))}
    </div>
  );
};
