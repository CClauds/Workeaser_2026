import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Form = styled(Unform)`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 1.5rem;

  section {
    width: 340px;

    & > div + div {
      margin-top: 12px;
    }
    & > input + input {
      margin-top: 12px;
    }
    & > input + div {
      margin-top: 12px;
    }
  }

  p {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }

  footer {
    margin-top: 1.75rem;

    button {
      width: 185px;

      &.loading {
        width: 69px;
      }
    }
  }
`;
