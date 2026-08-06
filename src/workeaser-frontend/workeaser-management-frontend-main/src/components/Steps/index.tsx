import React from "react";
import { Container, StepBlock } from "./styles";

interface StepsProps {
  steps: string[];
  currentStep: number;
  onStepClick: (index: number) => () => void;
}

export const Steps: React.FC<StepsProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <Container>
      {steps.map((step, index) => (
        <StepBlock
          key={`${index}-${step}`}
          index={index}
          currentStep={currentStep}
        >
          <span onClick={onStepClick(index)}>{step}</span>
        </StepBlock>
      ))}
    </Container>
  );
};
