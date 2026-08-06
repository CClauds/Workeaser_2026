import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Container = styled.div`
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
`;

export const Form = styled(Unform)`
  margin-top: 1.5rem;

  & > div ~ div {
    margin-top: 1rem;
  }
`;

export const ButtonsContainer = styled.div`
  button {
    width: 155px;
    margin-left: auto;
  }
`;
