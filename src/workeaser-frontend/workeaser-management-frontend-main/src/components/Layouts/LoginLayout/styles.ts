import styled from "styled-components";

export const Container = styled.div`
  position: relative;
  height: 100vh;

  display: grid;
  grid-template-columns: 1fr 1fr;

  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: -20px;
    left: 25%;
    width: 450px;
    height: 450px;
    background-image: url("/images/workeaser-circle.png");
    background-size: contain;
    opacity: 0.08;
    z-index: -1;
  }

  @media (max-width: 800px) {
    display: flex;
    align-items: center;
    justify-content: center;
    & > span {
      display: none !important;
    }
  }
`;

export const Content = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
`;

export const Footer = styled.footer`
  position: absolute;
  bottom: 15px;

  p {
    font-size: 11px;
  }
`;
