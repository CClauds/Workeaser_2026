import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;

  figure {
    text-align: center;

    img {
      object-fit: contain;
    }
  }

  .input {
    background-color: #ffffff;
  }

  .customLink__container {
    margin-top: 35px;
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 450px;
    height: 450px;
    background-image: url("/images/workeaser-circle.png");
    background-size: contain;
    opacity: 0.08;
    z-index: -1;
    pointer-events: none;
  }

  ${({ theme }) => theme.media.sm} {
    &::after {
      width: 90vw;
      height: 90vw;
    }
  }
`;

export const Form = styled(Unform)`
  max-width: 600px;
  width: 100%;

  margin-top: 40px;

  & > div + div {
    margin-top: 15px;
  }

  &.single__column {
    max-width: 400px;
  }

  ${({ theme }) => theme.media.md} {
    margin-top: 24px;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  button {
    width: 180px;

    &.loading {
      width: 69px;
    }
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  p {
    flex: 1;
  }

  button {
    width: 173px;

    &.loading {
      width: 69px;
    }
  }

  ${({ theme }) => theme.media.md} {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    button {
      width: 100%;
    }
  }
`;

export const Subtitle = styled.p`
  font-size: 12px;

  margin: 15px 0;

  strong {
    font-weight: ${({ theme }) => theme.fonts.bold};
    text-decoration: underline;
  }
`;
export const CheckboxLabel = styled.span`
  font-size: 14px;

  a {
    font-weight: ${({ theme }) => theme.fonts.bold};
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.blue200};
  }
`;

export const Footer = styled.footer`
  position: absolute;
  bottom: 15px;

  p {
    font-size: 11px;
  }
`;
