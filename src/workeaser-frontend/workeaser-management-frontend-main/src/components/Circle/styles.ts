import styled from "styled-components";

interface ContainerProps {
  size: number;
  isActive?: boolean;
}

export const Container = styled.div`
  display: flex;
  justify-content: center;
`;

export const CircleWrapper = styled.div<ContainerProps>`
  width: ${({ size }) => size ?? 0.75}rem;
  height: ${({ size }) => size ?? 0.75}rem;
  background-color: ${({ theme, isActive }) =>
    isActive
      ? theme.colors.tableBackgroundGreen
      : theme.colors.tableBackgroundRed};
  border-radius: ${({ size }) => size / 2 ?? 0.375}rem;
`;
