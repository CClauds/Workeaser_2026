import styled from "styled-components";

export const Container = styled.button`
  height: 36px;
  width: 100%;

  display: flex;
  align-items: center;

  font-size: 10px;
  font-weight: ${({ theme }) => theme.fonts.semibold};
  letter-spacing: 0.8px;
  white-space: nowrap;
  text-transform: uppercase;

  padding: 0 15px;

  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  transition: filter 0.3s;

  &:not(:disabled):hover {
    filter: brightness(0.9);
  }

  &:disabled {
    cursor: not-allowed;
  }

  & > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px;

    margin-right: 15px;
    padding-right: 15px;
    border-right: 1px solid ${({ theme }) => theme.colors.gray300};
  }
`;
