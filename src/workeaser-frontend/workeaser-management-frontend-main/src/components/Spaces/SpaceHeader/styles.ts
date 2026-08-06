import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  h2 {
    font-size: 1.75rem;
    font-weight: ${({ theme }) => theme.fonts.bold};
  }

  p {
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
`;
