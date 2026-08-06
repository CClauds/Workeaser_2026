import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 10px;

  h2 {
    font-size: 0.875rem;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
`;

export const Content = styled.div`
  flex: 1;
  width: 100%;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;

  margin-top: 1.25rem;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;

  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  h3 {
    font-size: 13px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
`;

interface NumberSpanProps {
  color: string;
}

export const NumberSpan = styled.span<NumberSpanProps>`
  font-size: 2rem;
  line-height: 1.2;
  font-weight: ${({ theme }) => theme.fonts.black};
  color: ${({ color }) => color};
`;
