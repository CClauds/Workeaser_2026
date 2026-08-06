import { Form as Unform } from "@unform/web";
import styled, { css } from "styled-components";

export const Container = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface SearchInputContainerProps {
  error?: boolean;
  success?: boolean;
}
export const SearchInputContainer = styled.div<SearchInputContainerProps>`
  display: flex;
  align-items: center;

  padding: 0.75rem;

  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.gray300};
  transition: all 0.3s;

  ${({ theme, success }) =>
    success
      ? css`
          border-color: ${theme.colors.green200};
        `
      : success === false
      ? css`
          border-color: ${theme.colors.notifyFail};
        `
      : ""};

  &:focus-within {
    border-color: ${({ theme, success }) =>
      success
        ? theme.colors.green200
        : success === false
        ? theme.colors.notifyFail
        : theme.colors.blue200};
  }

  margin-top: 2rem;
  input.search__input {
    width: 350px;
    border: none;
    border-radius: 0;
    padding: 0;
  }
`;

export const Subtitle = styled.h3`
  margin-top: 1rem;
`;

export const ClientCard = styled.div`
  padding: 0.75rem;
  margin-top: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  cursor: pointer;

  section {
    & + section {
      margin-top: 0.75rem;
    }

    p {
      font-size: 0.9rem;
    }

    & > div {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      P + P {
        margin-top: 0.5rem;
      }

      span {
        width: 26px;
        height: 26px;

        display: flex;
        align-items: center;
        justify-content: center;

        background-color: ${({ theme }) => theme.colors.darkGray};
      }
    }
  }
`;

export const Form = styled(Unform)`
  max-width: 600px;
  width: 100%;

  margin-top: 30px;

  & > div + div {
    margin-top: 15px;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  margin-top: 30px;

  button {
    width: 202px;

    border-radius: 0;
  }
`;
