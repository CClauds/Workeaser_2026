import styled from "styled-components";

export const Title = styled.p`
  font-size: 14px;
  line-height: 1.5;
  font-weight: ${({ theme }) => theme.fonts.semibolder};
`;
export const Subtitle = styled.p`
  font-size: 12px;
  line-height: 1.25;
  font-weight: ${({ theme }) => theme.fonts.regular};
`;
