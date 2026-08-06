import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "icomoon";
    src: url("../../public/fonts/icomoon/fonts/icomoon.eot") format("eot"),
      url("../../public/fonts/icomoon/fonts/icomoon.woff") format("woff"),
      url("../../public/fonts/icomoon/fonts/icomoon.ttf") format("ttf"),
      url("../../public/fonts/icomoon/fonts/icomoon.svg") format("svg");
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 100%;
  }

  ${({ theme }) => theme.media.lg} {
    html {
      font-size: 93.75%;
    }
  }

  ${({ theme }) => theme.media.md} {
    html {
      font-size: 87.5%;
    }
  }

  ${({ theme }) => theme.media.sm} {
    html {
      font-size: 81.25%;
    }
  }

  body {
    background: #ffffff;
    color: ${({ theme }) => theme.colors.blue800};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body,
  input,
  textarea,
  button,
  select {
    font: 400 1rem laca, "Roboto", sans-serif;
  }

  button {
    border: none;

    cursor: pointer;
  }

  a {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
  }

`;
