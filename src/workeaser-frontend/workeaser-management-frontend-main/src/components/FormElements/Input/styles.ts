import { DefaultInput } from "@styles/reusable";
import styled from "styled-components";
import { StyledInputProps } from ".";

export const Input = styled(DefaultInput)<StyledInputProps>`
  padding: 9px 10px;
  padding-left: ${({ hasPrefix }) => (hasPrefix ? 40 : 10)}px;

  font-size: 14px;
  color: ${({ theme }) => theme.colors.blue800};

  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, error }) =>
    error ? theme.colors.notifyFail : theme.colors.gray300};

  cursor: text;
  transition: border-color 0.3s;

  &[type="number"] {
    padding: ${({ hasPrefix, hasSufix }) =>
      hasPrefix || hasSufix ? "9px 25px" : "9px 10px"};
  }

  &::placeholder {
    font-size: 14px;
    color: rgba(43, 52, 80, 0.65);
  }

  &:not([readOnly]):focus {
    border-color: ${({ theme }) => theme.colors.blue200};
  }
`;
