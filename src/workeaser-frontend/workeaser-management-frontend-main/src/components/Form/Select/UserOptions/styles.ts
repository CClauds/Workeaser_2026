import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  h3 {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.semibolder};
  }
  h4 {
    font-size: 12px;
    font-weight: ${({ theme }) => theme.fonts.regular};

    margin-top: 0.2rem;
  }
`;

interface FigureProps {
  size: number;
}
export const Figure = styled.figure<FigureProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  & > img {
    object-fit: cover;
    object-position: center;
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
  }
`;

export const Preview = styled.div<FigureProps>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: 1px solid ${({ theme }) => theme.colors.blue800};
`;
