import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }
`;

export const TableInput = styled.input`
  width: 100%;

  font-size: 13px;

  outline: none;
  border: none;
  background: none;

  &:not(:read-only):focus {
    outline: 2px solid ${({ theme }) => theme.colors.darkGray};
  }
`;
export const Datalist = styled.datalist`
  width: 100%;

  font-size: 13px;

  outline: none;
  border: none;
  background: none;

  &:not(:read-only):focus {
    outline: 2px solid ${({ theme }) => theme.colors.darkGray};
  }
`;
