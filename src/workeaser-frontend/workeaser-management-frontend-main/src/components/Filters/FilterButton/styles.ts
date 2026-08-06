import styled from "styled-components";

interface FilterButtonProps {
  isOpen: boolean;
  buttonTheme: "primary" | "secondary";
}
interface FilterPopUpProps {
  isOpen: boolean;
  topOffset?: number;
}

export const Button = styled.button<FilterButtonProps>`
  height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 0 12px;

  font-weight: ${({ theme }) => theme.fonts.semibold};
  color: ${({ theme, isOpen, buttonTheme }) =>
    isOpen ? theme.colors.white : theme.colors.blue800};

  background-color: ${({ theme, isOpen, buttonTheme }) =>
    isOpen
      ? buttonTheme === "primary"
        ? theme.colors.blue200
        : theme.colors.blue800
      : buttonTheme === "primary"
      ? theme.colors.white
      : theme.colors.lightGray};
  border: 1px solid
    ${({ theme, isOpen, buttonTheme }) =>
      isOpen
        ? buttonTheme === "primary"
          ? theme.colors.blue200
          : theme.colors.blue800
        : theme.colors.gray300};

  transition: all 0.3s;
`;

export const FilterPopUp = styled.div<FilterPopUpProps>`
  position: absolute;
  top: ${({ topOffset }) => topOffset ?? 132}px;
  right: 0;

  max-width: 500px;
  height: ${({ topOffset }) =>
    topOffset ? `calc(100vh - ${topOffset}px)` : `calc(100vh - 132px)`};

  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  flex-direction: column;
  /* justify-content: space-between; */

  padding: 15px 15px 30px;

  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  z-index: 50;
  overflow-y: auto;

  transition: all 0.3s;
`;
