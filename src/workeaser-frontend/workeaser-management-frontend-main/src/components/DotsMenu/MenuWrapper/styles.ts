import styled, { css } from "styled-components";

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
      isOpen ? theme.colors.blue700 : theme.colors.gray300};
  }
`;

export const Content = styled.div<LocationsOptionsProps>`
  position: absolute;
  bottom: 50%;
  transform: translateY(50%);
  right: 34px;
  max-width: ${({ isOpen }) => (isOpen ? "250px" : "0")};

  z-index: 20;
  transition: max-width 0.3s;

  padding: ${({ isOpen }) => (isOpen ? "10px" : "0")};

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-width: ${({ isOpen }) => (isOpen ? "1px" : "0")};

  /* overflow: ${({ isOpen }) => (isOpen ? "visible" : "hidden")}; */
  & > div {
    overflow: hidden;

    & > button + button {
      margin-top: 0.25rem;
    }
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    display: ${({ isOpen }) => (isOpen ? "inline-block" : "none")};
    border-style: solid;
    border-color: transparent;

    left: 100%;
    bottom: 50%;
    transform: translateY(50%);
  }
  &::before {
    border-width: 12px;
    border-left-color: ${({ theme }) => theme.colors.gray300};
  }
  &::after {
    border-width: 11px;
    border-left-color: ${({ theme }) => theme.colors.lightGray};
  }
`;
