import styled from "styled-components";

export const Container = styled.div`
  p {
    font-size: 13px;
  }
`;

export const BankingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 15px;

  h3,
  p {
    font-size: 13px;
  }

  h3 {
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }

  button {
    width: 225px;
  }
`;

export const BankingTable = styled.div`
  p {
    margin-top: 15px;

    font-size: 11px;
  }

  button.delete__button {
    height: 16px;
    padding: 0;

    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
`;
