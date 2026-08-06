import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 45px;

  h1 {
    margin-bottom: 45px;
  }

  & > div {
    max-width: 683px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-top: 25px;

    section {
      width: 100%;
    }
  }
`;

export const Footer = styled.section`
  display: flex;
  justify-content: flex-end;

  margin-top: 15px;
`;
