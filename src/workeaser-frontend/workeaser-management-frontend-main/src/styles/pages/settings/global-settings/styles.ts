import styled, { css } from "styled-components";

export const Container = styled.div`
  max-width: 800px;
  width: 100%;

  display: flex;
`;

export const Navigation = styled.div`
  height: fit-content;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.gray300};
  border-radius: 0;
`;

interface NavigationButtonProps {
  isActive: boolean;
}

export const NavigationButton = styled.button<NavigationButtonProps>`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 12px;
  font-weight: ${({ theme }) => theme.fonts.semibold};
  letter-spacing: 0.8px;

  padding: 15px;
  background: none;

  transition: background-color 0.3s;

  & + button {
    border-top: 1px solid ${({ theme }) => theme.colors.gray300};
  }

  opacity: ${({ isActive }) => (isActive ? 1 : 0.4)};
  transition: opacity 1.3s;

  &:after {
    ${({ isActive }) =>
      isActive
        ? css`
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            right: -1px;

            width: 1px;
            background-color: #ffffff;
          `
        : ""};
  }
`;

export const Content = styled.div`
  flex: 1;
  padding: 10px;

  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 0;

  transition: max-height 1s;

  & > div + div {
    margin-top: 10px;
  }
`;
