import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Container = styled.div`
  p {
    font-size: 13px;
  }
`;

export const BankingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 15px;

  h3,
  p {
    font-size: 13px;
  }

  h3 {
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }

  button {
    width: 225px;
    &.loading {
      width: 69px;
    }
  }
`;

export const PaymentStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const BankingForm = styled(Unform)`
  padding: 15px 10px;
  margin-top: 15px;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  .save__button {
    width: 48px;
    height: fit-content;
    font-size: 14px;

    padding: 5px;
  }

  .form__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .form__first__row {
    margin-bottom: 15px;
    & > div {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  .form__second__row {
    display: flex;
    gap: 10px;
  }

  input {
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

export const BankingFormDisclaimer = styled.div`
  margin-top: 15px;

  & > p {
    font-size: 11px;
  }
`;
