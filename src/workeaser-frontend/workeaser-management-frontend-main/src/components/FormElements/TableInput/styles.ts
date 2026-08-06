import { DefaultInput } from "@styles/reusable";
import styled from "styled-components";

export const Input = styled(DefaultInput)`
  font-size: 13px;

  color: ${({ theme }) => theme.colors.blue800};

  &:not([readOnly]):focus {
    outline: 2px solid ${({ theme }) => theme.colors.darkGray};
  }
`;
