import styled from "styled-components";

export const Content = styled.div`
  display: flex;

  & > div {
    flex: 1;
    height: calc(100vh - 70px);
    padding: 15px;
  }
`;
