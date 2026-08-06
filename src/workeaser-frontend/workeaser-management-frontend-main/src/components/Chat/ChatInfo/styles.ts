import styled from "styled-components";
import { Form as Unform } from "@unform/web";
import { ReactNode } from "react";

interface NavButtonProps {
  isActive: boolean;
}

export const Form = styled(Unform)`
  flex: 1;
  display: flex;
  flex-direction: column;

  background-color: ${({ theme }) => theme.colors.white};

  border-radius: 12px 12px 0 0;

  & > header {
    display: flex;
    border: none;

    button {
      flex: 1;
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;

    border-width: 0 1px 1px 1px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.darkGray};

    padding: 12px;
    & > section {
      &.notes {
        flex: 1;
        display: flex;
        flex-direction: column;

        .notes__textarea {
          flex: 1;
        }
      }

      & > div + div {
        margin-top: 12px;
      }
    }

    hr {
      margin: 15px 0;
      border: 1px solid ${({ theme }) => theme.colors.darkGray};
    }
  }
`;

export const NavButton = styled.div<NavButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  padding: 12px;

  font-size: 12px;
  font-weight: ${({ theme }) => theme.fonts.semibold};

  border-width: ${({ isActive }) => (isActive ? "1px 1px 0 1px" : "0 0 1px 0")};
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.darkGray};

  border-radius: 0 12px 0 0;
  &:first-child {
    border-radius: 12px 0 0 0;
  }

  opacity: ${({ isActive }) => (isActive ? 1 : 0.4)};

  appearance: none;
  background: none;
  outline: none;
`;

export const Intersection = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  margin: 15px 0;

  p {
    font-size: 12px;
  }
`;
export const Line = styled.span`
  flex: 1;
  display: inline-block;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.darkGray};

  margin-left: 10px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;

  p {
    flex: 1;
    font-size: 12px;
  }

  .button {
    height: fit-content;
    flex: 1;

    padding: 6px 8px;
    font-weight: ${({ theme }) => theme.fonts.semibold};

    font-size: 10px;
  }

  .button__plain {
    height: fit-content;
    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
`;

export const InfoCard = styled.div`
  display: flex;
  gap: 5px;
  padding: 10px;

  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 5px;

  & > & {
    margin-top: 15px;
  }

  & > div:first-child {
    flex: 1;
  }

  h3 {
    font-size: 13px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }

  p {
    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
`;
