import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  place-items: center;

  margin-top: 2rem;
`;

export const Content = styled.div`
  max-width: 450px;
  width: 100%;

  & > div {
    width: 100%;

    & + div {
      margin-top: 0.8rem;
    }
  }
`;
