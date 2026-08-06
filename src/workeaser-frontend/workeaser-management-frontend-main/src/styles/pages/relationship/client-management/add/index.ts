import { Form as Unform } from "@unform/web";
import styled, { css } from "styled-components";

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 1.75rem;
`;

interface SearchInputContainerProps {
  error?: boolean;
  success?: boolean;
}
export const SearchInputContainer = styled.div<SearchInputContainerProps>`
  input.search__input {
    width: 350px;
    margin-top: 2rem;
    border-radius: 0;

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

    &:focus {
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
    }
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

        background-color: ${({ theme }) => theme.colors.gray300};
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
