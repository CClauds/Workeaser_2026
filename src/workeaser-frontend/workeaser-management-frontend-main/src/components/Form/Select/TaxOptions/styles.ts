import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  & > h3 {
    font-size: 0.75rem;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
  & > h4 {
    font-size: 0.625rem;
    font-weight: ${({ theme }) => theme.fonts.regular};

    margin-top: 0.2rem;
  }
`;
