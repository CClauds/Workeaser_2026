import styled from "styled-components";

export const Container = styled.div`
  p {
    font-size: 13px;
  }
`;

export const TableContainer = styled.div`
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

  & > input {
    display: none;
  }
`;
