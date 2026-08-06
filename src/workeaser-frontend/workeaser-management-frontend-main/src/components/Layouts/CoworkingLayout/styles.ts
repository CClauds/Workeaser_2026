import styled from "styled-components";

export const Content = styled.div`
  display: flex;

  & > div {
    flex: 1;
    height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
    padding: 15px;
    overflow: auto;
    /* margin-left: 220px; */
  }
`;
