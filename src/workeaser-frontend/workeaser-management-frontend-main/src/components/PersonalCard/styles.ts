import styled from "styled-components";

interface PreviewProps {
  size: number;
}
export const Preview = styled.div<PreviewProps>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.75rem;
  font-weight: ${({ theme }) => theme.fonts.bold};
  letter-spacing: 2px;

  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.blue200};
  border: 1px solid ${({ theme }) => theme.colors.blue800};
  border-radius: 12px;
`;
