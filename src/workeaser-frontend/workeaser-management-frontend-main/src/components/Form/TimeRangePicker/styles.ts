import styled from "styled-components";

export const Container = styled.label`
  height: 36px;

  display: flex;
  align-items: center;

  font-size: 10px;

  border: 1px solid ${({ theme }) => theme.colors.gray300};

  transition: border-color 0.2s;

  &.error {
    border-color: ${({ theme }) => theme.colors.notifyFail};
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.blue200};
  }

  .ant-picker-active-bar {
    background: ${({ theme }) => theme.colors.blue200};
  }

  & > div {
    outline: none;
    background: none;
    border: none;
    appearance: none;
    box-shadow: none;

    width: 100%;
    height: 100%;
    border-radius: 0;

    font-size: 14px;
  }
  &:hover {
    border-color: ${({ theme }) => theme.colors.blue200};
  }

  span {
    color: ${({ theme }) => theme.colors.blue200};
  }
`;
