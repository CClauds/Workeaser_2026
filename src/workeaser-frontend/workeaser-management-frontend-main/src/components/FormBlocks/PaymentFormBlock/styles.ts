import styled, { css } from "styled-components";

export const Container = styled.div`
  max-width: 400px;
  width: 100%;
`;

export const Navigation = styled.div`
  display: flex;
  justify-content: center;
`;

interface NavigationButtonProps {
  isActive?: boolean;
}

export const NavigationButton = styled.button<NavigationButtonProps>`
  position: relative;

  width: 126px;

  font-size: 12px;
  font-weight: ${({ theme }) => theme.fonts.semibold};
  letter-spacing: 0.8px;

  padding: 10px 5px;
  background: none;

  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.white : theme.colors.lightGray};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.blue800 : theme.colors.darkGray};

  transition: background-color 0.3s;

  &:first-child {
    border-top-left-radius: 10px;
  }
  &:last-child {
    border-top-right-radius: 10px;
  }

  /* &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  } */

  &:after {
    ${({ isActive }) =>
      isActive &&
      css`
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -2px;

        height: 2px;
        background-color: ${({ theme }) => theme.colors.white};
      `};
  }
`;

export const Content = styled.div`
  display: flex;
  justify-content: center;

  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.blue800};
  border-radius: 10px;

  & > div {
    width: 100%;

    & > div + div {
      margin-top: 15px;
    }
  }

  button {
    height: 36.8px;
  }

  .cardInput {
    flex: 1;
    padding: 9px 10px;

    font-size: 14px;
    color: ${({ theme }) => theme.colors.blue800};

    border-width: 1px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.darkGray};
    border-radius: 5px;

    cursor: text;
    transition: border-color 0.3s;

    &.focus {
      border-color: ${({ theme }) => theme.colors.blue200};
    }

    &.error {
      border-color: ${({ theme }) => theme.colors.notifyFail};
    }
  }
`;

export const BankTab = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > div {
    width: 100%;
  }

  h3,
  button {
    margin-top: 15px;
  }

  h3 {
    font-weight: ${({ theme }) => theme.fonts.semibold};
    margin-bottom: 0.5rem;
  }
`;
