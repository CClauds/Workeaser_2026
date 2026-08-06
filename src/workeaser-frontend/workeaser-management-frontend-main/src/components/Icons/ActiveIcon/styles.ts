import styled from "styled-components";

interface SvgProps {
  isActive: boolean;
  isClickable: boolean;
}

export const Svg = styled.svg<SvgProps>`
  opacity: ${({ isActive }) => (isActive ? 1 : 0.4)};

  cursor: ${({ isClickable }) => (isClickable ? "pointer" : "auto")};
`;
