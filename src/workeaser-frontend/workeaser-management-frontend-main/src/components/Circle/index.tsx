import React from "react";
import { CircleWrapper, Container } from "./styles";

interface CircleProps {
  sizeInRem?: number;
  active?: boolean;
}

export const Circle: React.FC<CircleProps> = ({ sizeInRem, active }) => {
  return (
    <Container>
      <CircleWrapper size={sizeInRem} isActive={active} />
    </Container>
  );
};
