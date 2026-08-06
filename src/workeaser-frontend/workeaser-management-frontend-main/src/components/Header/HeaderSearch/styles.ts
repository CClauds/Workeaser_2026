import styled, { css } from "styled-components";
import { scrollbarY } from "@styles/reusable";

interface WrapperProps {
  isOpen: boolean;
}

export const Backdrop = styled.div<WrapperProps>`
  position: fixed;
  inset: 0;

  background-color: rgba(43, 52, 80, 0.2);
  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  z-index: 10;
  transition: opacity 0.3s, visibility 0.3s;
`;
export const Wrapper = styled.div<WrapperProps>`
  flex: 1;

  ${({ isOpen }) =>
    isOpen
      ? css`
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
        `
      : ""};
`;
export const Container = styled.div<WrapperProps>`
  background-color: ${({ theme }) => theme.colors.white};

  ${({ isOpen }) =>
    isOpen
      ? css`
          position: absolute;
          top: 0;
          /* width: 80%; */
          width: calc(100vw - 26rem);
          max-height: 80vh;
          min-height: 60vh;
          height: fit-content;
          padding: 1.2rem 1.9rem;
          border-radius: 0 0 0.25rem 0.25rem;
        `
      : ""};

  z-index: 200;
  transition: max-height 0.3s, height 0.3s, width 0.3s, opacity 0.3s;

  .search__header {
    display: flex;
    align-items: center;
  }
`;

export const InputContainer = styled.div<WrapperProps>`
  flex: 1;
  width: 100%;

  display: flex;
  align-items: center;

  transition: border-color 0.3s;

  ${({ isOpen }) =>
    isOpen
      ? css`
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};
        `
      : ""};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.blue200};
  }

  input {
    border: none;
    outline: none;
    background: none;

    width: 100%;

    padding: 0.25rem 0.5rem;
    cursor: text;

    &::placeholder {
      font-size: 14px;
      color: rgba(43, 52, 80, 0.65);
    }
  }

  button {
    appearance: none;
    background: none;
    border: none;
    line-height: 0.5;
    padding: 0.5rem;

    visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  }
`;

export const Content = styled.div<WrapperProps>`
  display: flex;

  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};

  transition: opacity 0.3s, visibility 0.3s;

  .search__result {
    flex: 0.66;
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;

    margin-left: 2rem;
  }
`;

export const ListContainer = styled.div`
  flex: 0.34;
  padding-right: 1rem;
  border-right: 1px solid ${({ theme }) => theme.colors.darkGray};

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.semibold};
    margin-bottom: 1rem;

    &:after {
      content: "";
      flex: 1;
      border-top: 1px solid ${({ theme }) => theme.colors.darkGray};
    }
  }

  ul {
    list-style: none;
    max-height: calc(80vh - 8rem);
    overflow-y: auto;
    ${scrollbarY}

    li {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem;
      border-radius: 0.25rem;

      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: ${({ theme }) => theme.colors.lightGray};
      }

      & + li {
        margin-top: 0.5rem;
      }

      h3 {
        font-size: 14px;
        font-weight: ${({ theme }) => theme.fonts.semibolder};
      }
      h4 {
        font-size: 12px;
        font-weight: ${({ theme }) => theme.fonts.regular};

        margin-top: 0.2rem;
      }
    }
  }
`;
export const SecondaryListContainer = styled.div`
  flex: 1 0 220px;
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.semibold};
    margin-bottom: 1rem;

    &:after {
      content: "";
      flex: 1;
      border-top: 1px solid ${({ theme }) => theme.colors.darkGray};
    }
  }

  ul {
    list-style: none;

    li {
      cursor: pointer;

      & + li {
        margin-top: 0.5rem;
      }

      h3 {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: ${({ theme }) => theme.fonts.semibold};

        &:before {
          content: "";
          display: block;
          width: 0.75rem;
          height: 0.75rem;
          background-color: ${({ theme }) => theme.colors.tableBackgroundGray};
          border-radius: 0.375rem;
        }

        &.gray {
          &:before {
            background-color: ${({ theme }) =>
              theme.colors.tableBackgroundGray};
          }
        }
        &.green {
          &:before {
            background-color: ${({ theme }) =>
              theme.colors.tableBackgroundGreen};
          }
        }
        &.yellow {
          &:before {
            background-color: ${({ theme }) =>
              theme.colors.tableBackgroundYellow};
          }
        }
        &.red {
          &:before {
            background-color: ${({ theme }) => theme.colors.tableBackgroundRed};
          }
        }
      }
      h4 {
        font-size: 0.625rem;
        font-weight: ${({ theme }) => theme.fonts.regular};

        margin-top: 0.2rem;
      }
    }
  }
`;

export const LoaderContainer = styled.div`
  position: absolute;
  top: 1.75rem;
  right: 6rem;
`;
