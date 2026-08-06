import styled from "styled-components";

interface ContainerProps {
  maxWidth: number;
}
export const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : "auto")};

  & > div {
    max-width: inherit;
    margin: 0;
    padding: 0;

    & > h3 {
      max-width: inherit;
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.semibolder};

      margin: 0;
      padding: 0;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & > h4 {
      max-width: inherit;
      font-size: 12px;
      font-weight: ${({ theme }) => theme.fonts.regular};

      margin: 0;
      padding: 0;
      margin-top: 0.2rem;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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
