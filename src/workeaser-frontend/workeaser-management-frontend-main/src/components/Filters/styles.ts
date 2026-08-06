import styled from "styled-components";

interface FilterProps {
  isOpen: boolean;
}

export const Container = styled.div``;

export const Button = styled.button`
  height: 40px;

  padding: 0 12px;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 4px;
`;

export const FilterPopUp = styled.div<FilterProps>`
  position: absolute;
  top: 146px;
  right: 0;

  width: 350px;
  height: calc(100vh - 146px);

  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  flex-direction: column;
  justify-content: space-between;

  padding: 15px;

  /* background-color: ${({ theme }) => theme.colors.lightGray}; */
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};

  z-index: 10;

  transition: all 0.3s;
`;
