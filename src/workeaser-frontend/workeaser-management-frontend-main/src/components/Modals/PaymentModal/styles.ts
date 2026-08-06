import styled, { css } from "styled-components";
import { Form as Unform } from "@unform/web";
import { scrollbarY } from "@styles/reusable";

export const Content = styled.div`
  width: 800px;

  margin-top: 15px;
`;

export const SummaryContainer = styled.section`
  & > div {
    margin-top: 15px;

    p {
      flex: 1;
      font-size: 14px;
    }

    time,
    span {
      font-weight: ${({ theme }) => theme.fonts.bold};
    }
  }

  hr {
    flex: 1;
    margin-top: 15px;
    border: 1px solid ${({ theme }) => theme.colors.blue800};
  }
`;

export const Intersection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  p {
    font-size: 14px;
    strong {
      font-weight: ${({ theme }) => theme.fonts.bold};
    }
  }

  hr {
    flex: 1;
    border: 1px solid ${({ theme }) => theme.colors.blue800};
  }
`;

export const TableContainer = styled.section`
  display: flex;
  gap: 10px;

  margin-top: 15px;

  /* & > div:last-child {
    flex: 0.2;
  } */

  .summary__table {
    flex: 0.2;
  }
`;

export const PaymentContainer = styled.section`
  display: flex;
  justify-content: flex-end;
  gap: 25px;

  margin-top: 15px;

  & > div {
    flex-basis: 350px;

    & > div + div {
      margin-top: 15px;
    }

    p.form__text {
      flex: 1;
      font-size: 14px;
    }
  }
`;

export const PaymentForm = styled.div`
  flex: 1;

  & > div {
    & > div {
      flex: 1;
    }
  }
`;

export const PaymentFooter = styled.div`
  flex: 1;

  & > p {
    font-size: 12px;
  }
`;

export const Form = styled(Unform)`
  flex: 1;

  & > div + div {
    margin-top: 15px;
  }
`;

export const AmountCardsContainer = styled.div<AmountCardProps>`
  max-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  ${scrollbarY}
`;
interface AmountCardProps {
  clickable?: boolean;
}
export const AmountCard = styled.div<AmountCardProps>`
  display: flex;
  align-items: center;

  padding: 10px;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};

  cursor: ${({ clickable }) => (clickable ? "pointer" : "auto")};
  pointer-events: ${({ clickable }) => (clickable ? "all" : "none")};

  & > div:first-child {
    flex: 1;
  }

  p {
    font-size: 14px;
    & + p {
      margin-top: 5px;
    }
  }

  strong {
    font-weight: ${({ theme }) => theme.fonts.bold};
  }

  .text__center {
    text-align: center;
  }
`;

export const PriceCard = styled.div`
  flex-basis: 130px;

  padding: 12px 20px;

  text-align: center;

  border: 1px solid ${({ theme }) => theme.colors.blue800};

  span {
    font-size: 14px;
  }
`;

export const ButtonContainer = styled.section`
  display: flex;
  justify-content: flex-end;

  margin-top: 15px;

  button {
    width: 218px;

    &.loading {
      width: 69px;
    }
  }
`;

interface RadioButtonProps {
  isActive: boolean;
  error?: boolean;
}
export const RadioButton = styled.button<RadioButtonProps>`
  position: relative;

  min-width: 20px;
  min-height: 20px;

  margin-right: 5px;

  background-color: #fff;
  border: 1px solid
    ${({ theme, error }) =>
      error ? theme.colors.notifyFail : theme.colors.blue800};
  border-radius: 50%;

  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:after {
    content: "";
    ${({ isActive, theme }) =>
      isActive
        ? css`
            position: absolute;
            inset: 0;

            width: 12px;
            height: 12px;
            margin: auto;

            background-color: ${({ theme }) => theme.colors.blue200};
            border-radius: 50%;
          `
        : ""};
  }
`;
