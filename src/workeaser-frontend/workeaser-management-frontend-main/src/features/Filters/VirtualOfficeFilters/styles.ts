import styled from "styled-components";

export const SectionContainer = styled.section`
  & > div {
    display: flex;
    align-items: center;

    & + div {
      margin-top: 20px;
    }

    & > p {
      flex: 1;
    }
  }
`;
