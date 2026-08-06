import styled from "styled-components";

interface ContainerProps {
  active?: boolean;
}

export const Container = styled.div<ContainerProps>`
  /* position: relative; */
`;

export const Button = styled.button<ContainerProps>`
  appearance: none;
  background: none;
  outline: none;
  /* width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.darkGray};
  border-radius: 5px;

  transition: filter 0.3s;

  &:hover {
    filter: brightness(0.8);
  } */
`;

export const NoPhtoContainer = styled.div`
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.darkGray};
`;
