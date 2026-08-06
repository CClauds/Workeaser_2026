import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  padding: 10px;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 5px;

  span {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.bold};
  }

  & > div {
    display: flex;
    gap: 5px;
  }
`;

export const TimeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  padding: 10px;

  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 5px;

  p {
    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
  span {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
`;
