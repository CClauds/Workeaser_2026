import styled, { css } from "styled-components";

interface ContainerProps {
  error?: boolean;
}

export const Container = styled.div<ContainerProps>`
  width: 100%;

  /* display: flex; */
  padding: 0.5rem;

  border: 1px solid
    ${({ theme, error }) =>
      error ? theme.colors.notifyFail : theme.colors.gray300};

  transition: border-color 0.3s;
`;
export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};

  & > div {
    display: flex;
    align-items: center;
    gap: 5px;

    & > div.row__container {
      width: 90px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }

  p {
    font-size: 13px;
  }
`;

export const HelpIconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const TermItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* gap: 5px; */

  padding: 0.25rem 0.5rem;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  margin-top: 0.5rem;

  & > div {
    display: flex;
    gap: 5px;
  }

  p {
    flex: 1;
    font-size: 12px;
  }

  span {
    font-size: 14px;
  }
`;

export const Navigation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

interface NavigationButtonProps {
  isActive?: boolean;
  notVisited?: boolean;
  hasValue?: boolean;
}

export const NavigationButton = styled.button<NavigationButtonProps>`
  position: relative;
  flex: 1;
  width: 100%;

  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 12px;
  font-weight: ${({ theme }) => theme.fonts.semibold};
  letter-spacing: 0.8px;

  padding: 0 15px;
  background: none;
  border-right: 1px solid ${({ theme }) => theme.colors.gray300};

  transition: background-color 0.3s;

  & + button {
    border-top: 1px solid ${({ theme }) => theme.colors.gray300};
  }

  &:not(:disabled):hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:after {
    ${({ isActive }) =>
      isActive &&
      css`
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        right: -1px;

        width: 1px;
        background-color: #ffffff;
      `};
  }
`;

export const Circle = styled.span<NavigationButtonProps>`
  width: 16px;
  height: 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid
    ${({ theme, isActive, notVisited, hasValue }) =>
      notVisited
        ? "#CACCD3"
        : hasValue
        ? "#2DC9A5"
        : isActive
        ? theme.colors.blue200
        : theme.colors.notifyFail};
  border-radius: 8px;

  transition: border-color 0.2s;

  span {
    width: 8px;
    height: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: ${({ theme }) => theme.colors.notifyFail};
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  min-width: 293px;
  max-height: 261px;

  overflow: hidden;
`;

interface ContentProps {
  index?: number;
}

export const Content = styled.div<ContentProps>`
  display: flex;
  flex-direction: column;

  padding: 20px 10px;

  transition: transform 0.3s;
  transform: ${({ index }) => `translateY(-${261 * index}px)`};

  h3 {
    font-size: 14px;
    text-align: center;
    margin-bottom: 20px;
  }

  & > div {
    flex: 1;

    &:first-of-type {
      padding-bottom: 20px;
      border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};
    }

    & + div {
      margin-top: 20px;
    }
  }

  h4 {
    font-size: 12px;
    font-weight: ${({ theme }) => theme.fonts.regular};

    strong {
      ${({ theme }) => theme.fonts.bold};
    }
  }
`;

export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  padding: 5px;
  margin-top: 10px;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  p {
    flex: 1;
    font-size: 12px;
  }

  span {
    font-size: 12px;
  }
`;
