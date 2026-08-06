import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Form = styled(Unform)`
  max-width: 380px;
  width: 100%;

  margin-top: 50px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    width: 175px;

    &.loading {
      width: 69px;
    }
  }
`;
