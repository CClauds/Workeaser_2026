import styled from "styled-components";

export const SectionContainer = styled.section`
  & > div {
    display: flex;
    align-items: center;

    & > p {
      flex: 1;
    }
  }
`;
