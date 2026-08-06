import { DefaultTextArea } from "@styles/reusable";
import styled from "styled-components";
import { StyledTextAreaProps } from ".";

export const TextArea = styled(DefaultTextArea)<StyledTextAreaProps>`
  padding: ${({ hasIcon }) => (hasIcon ? "9px 10px 9px 40px" : "9px 10px")};

  font-size: 14px;
  color: ${({ theme }) => theme.colors.blue800};

  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, error }) =>
    error ? theme.colors.notifyFail : theme.colors.gray300};

  cursor: text;
  transition: border-color 0.3s;

  &::placeholder {
    font-size: 14px;
    color: rgba(43, 52, 80, 0.65);
  }

  &:not([readOnly]):focus {
    border-color: ${({ theme }) => theme.colors.blue200};
  }
`;
