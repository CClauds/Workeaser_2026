import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Form = styled(Unform)`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 1.5rem;

  section {
    flex-basis: 20rem;
    display: flex;
    flex-direction: column;

    & > div + div {
      margin-top: 12px;
    }
    & > input + input {
      margin-top: 12px;
    }
  }

  footer {
    margin-top: 1.75rem;

    button {
      width: 215px;

      &.loading {
        width: 69px;
      }
    }
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;
