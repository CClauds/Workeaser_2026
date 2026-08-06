import styled from "styled-components";

interface FigureProps {
  size?: number;
}
export const Figure = styled.figure<FigureProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    object-fit: cover;
  }
`;

export const Preview = styled.div<FigureProps>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${({ theme }) => theme.colors.blue800};
`;
