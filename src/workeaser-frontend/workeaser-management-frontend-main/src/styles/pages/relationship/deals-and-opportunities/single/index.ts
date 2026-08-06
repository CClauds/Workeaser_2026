import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 60px auto 20px;
`;

export const Form = styled(Unform)`
  flex: 1;
  max-width: 900px;
  width: 100%;

  display: flex;
  gap: 30px;
`;

export const Column = styled.div`
  flex: 1;

  & > div {
    p {
      flex: 1;

      font-size: 14px;
    }
    & + div {
      margin-top: 15px;
    }
  }
`;

export const ServicesRow = styled.div`
  display: flex;
  gap: 5px;
`;
