import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
`;

interface StepBlock {
  index: number;
  currentStep: number;
}

export const StepBlock = styled.div<StepBlock>`
  & + div {
    &:before {
      content: "";
      display: inline-block;
      width: 25px;
      height: 7px;

      background-color: ${({ theme, index, currentStep }) =>
        index === currentStep
          ? theme.colors.tableBackgroundYellow
          : index < currentStep
          ? theme.colors.tableBackgroundGreen
          : theme.colors.darkGray};
    }
  }

  span {
    display: inline-block;

    padding: 10px 15px;

    font-size: 13px;

    background-color: ${({ theme, index, currentStep }) =>
      index === currentStep
        ? theme.colors.tableBackgroundYellow
        : index < currentStep
        ? theme.colors.tableBackgroundGreen
        : theme.colors.darkGray};

    border-radius: 5px;
    cursor: pointer;
  }
`;
