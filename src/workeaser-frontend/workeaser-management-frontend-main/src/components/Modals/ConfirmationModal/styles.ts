import styled from "styled-components";

export const Content = styled.div`
  width: 550px;

  p {
    text-align: center;

    margin-top: 1.25rem;
  }

  & > div {
    display: flex;
    justify-content: space-evenly;

    margin-top: 1.5rem;

    button {
      width: 8rem;
    }
  }
`;
