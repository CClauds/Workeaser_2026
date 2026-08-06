import styled from "styled-components";

interface LocationsOptionsProps {
  isOpen: boolean;
}

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

export const MenuIcon = styled.div<LocationsOptionsProps>`
  width: 18px;
  height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme, isOpen }) =>
    isOpen ? theme.colors.blue800 : "transparent"};
  cursor: pointer;

  transition: all 0.3s;

  &:hover {
    background-color: ${({ theme, isOpen }) =>
      isOpen ? theme.colors.blue700 : theme.colors.darkGray};
  }
`;

export const Content = styled.div<LocationsOptionsProps>`
  position: absolute;
  bottom: 50%;
  transform: translateY(50%);
  right: 34px;
  max-width: ${({ isOpen }) => (isOpen ? "210px" : "0")};

  z-index: 20;
  transition: max-width 0.3s;

  & > div {
    padding: ${({ isOpen }) => (isOpen ? "10px" : "0")};

    background-color: ${({ theme }) => theme.colors.lightGray};
    border: 1px solid ${({ theme }) => theme.colors.darkGray};
    border-width: ${({ isOpen }) => (isOpen ? "1px" : "0")};

    overflow: hidden;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    display: ${({ isOpen }) => (isOpen ? "inline-block" : "none")};
    border-style: solid;
    border-color: transparent;

    left: 99%;
    bottom: 50%;
    transform: translateY(50%);
  }
  &::before {
    border-width: 12px;
    border-left-color: ${({ theme }) => theme.colors.darkGray};
  }
  &::after {
    border-width: 11px;
    border-left-color: ${({ theme }) => theme.colors.lightGray};
  }
`;

export const ContentColumn = styled.div`
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGray};

  button + button {
    margin-top: 5px;
  }
`;

export const ContentRow = styled.div`
  display: flex;
  gap: 10px;

  button {
    min-width: 55px;
    height: 44px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
    letter-spacing: 0.8px;
    white-space: nowrap;

    cursor: pointer;

    &.success {
      background-color: ${({ theme }) => theme.colors.tableBackgroundGreen};
    }
    &.warning {
      background-color: ${({ theme }) => theme.colors.tableBackgroundYellow};
    }

    &.danger {
      background-color: ${({ theme }) => theme.colors.tableBackgroundRed};
    }

    transition: filter 0.3s;
    &:hover {
      filter: brightness(0.9);
    }

    span:before {
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.blue800};
    }
  }
`;
