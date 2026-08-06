import styled from "styled-components";

interface FigureProps {
  size: number;
  radius?: number;
}
export const Figure = styled.figure<FigureProps>`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Preview = styled.div<FigureProps>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: 1px solid ${({ theme }) => theme.colors.blue800};
`;
