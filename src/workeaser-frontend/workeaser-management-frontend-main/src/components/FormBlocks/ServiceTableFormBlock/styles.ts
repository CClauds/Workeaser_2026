import styled from "styled-components";

export const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;

  margin-top: 10px;
`;

export const TableFooterSection = styled.section`
  display: flex;
  gap: 15px;

  button {
    height: 28px;
    padding: 0 12px;

    font-size: 12px;
  }
`;

export const TablePriceContainer = styled.div`
  width: 225px;

  display: flex;
  justify-content: space-between;

  padding: 8px 10px;

  line-height: 1.25;

  &:first-child {
    background-color: ${({ theme }) => theme.colors.lightGray};
    border: 1px solid ${({ theme }) => theme.colors.gray300};
  }
  &:last-child {
    border-top: 1px solid ${({ theme }) => theme.colors.blue800};

    margin-top: 10px;
  }
`;
