import React from "react";
import { ApiItem } from "types";
import { Service } from "types/infos";
import { ServiceTag } from "../ServiceTag";
import { Wrapper } from "./styles";

interface ServicesRowProps {
  services: Service[];
  selectedServices: ApiItem[];
}

export const ServicesRow: React.FC<ServicesRowProps> = ({
  services,
  selectedServices,
}) => {
  return (
    <Wrapper>
      {services?.map((service) => (
        <ServiceTag
          key={service.id}
          isActive={selectedServices?.some(
            (selectedService) => selectedService.id === service.id
          )}
          tooltip={service.name}
        >
          {service.abbr}
        </ServiceTag>
      ))}
    </Wrapper>
  );
};
