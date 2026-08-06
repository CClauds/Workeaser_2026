import styled from "styled-components";

export const Content = styled.div`
  width: 650px;
  background-color: #ffffff;

  h1 {
    font-size: 23px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
    text-align: center;
  }

  & > div {
    width: 100%;

    margin-top: 20px;
  }
`;
