import styled, { css, keyframes } from "styled-components";

export const Wrapper = styled.div``;

interface ContainerProps {
  isOverflown: boolean;
}

export const Container = styled.div<ContainerProps>`
  max-height: 425px;
  overflow-y: ${({ isOverflown }) => (isOverflown ? "auto" : "visible")};
  padding-right: 5px;

  // prettier-ignore
  scrollbar-color: ${({ theme }) => theme.colors.darkGray} ${({ theme }) =>
    theme.colors.lightGray};
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.colors.darkGray};
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    width: 100%;
    background-color: ${({ theme }) => theme.colors.gray300};
    border-radius: 8px;

    &:hover {
      background-color: ${({ theme }) => theme.colors.darkerGray};
    }
  }
  & > div + div {
    margin-top: 10px;
  }
`;
interface ContentProps {
  isClosed?: boolean;
  isDelete?: boolean;
  isOverflown?: boolean;
}

const open = keyframes`
  from {
    max-height: 0;
  }
  to {
    max-height: 215px;
  }
`;
const deleteAnimation = keyframes`
  from {
    max-height: 44px;
    padding: 10px;
    margin-top: 10px;
    border-width: 1px;
  }
  to {
    max-height: 0;
    padding: 0;
    margin-top: 0;
    border-width: 0;
  }
`;

export const Content = styled.div<ContentProps>`
  position: relative;
  max-height: ${({ isClosed }) => (isClosed ? 44 : 215)}px;

  display: flex;
  flex-direction: ${({ isClosed }) => (isClosed ? "row" : "column")};
  align-items: ${({ isClosed }) => (isClosed ? "center" : "stretch")};
  gap: ${({ isClosed }) => (isClosed ? 5 : 10)}px;

  padding: 10px;

  background-color: ${({ theme, isClosed }) =>
    isClosed ? theme.colors.lightGray : "transparent"};

  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.gray300};

  cursor: ${({ isClosed }) => (isClosed ? "pointer" : "auto")};
  overflow: ${({ isDelete }) => (isDelete ? "hidden" : "visible")};

  transition: all 0.3s;

  animation: ${({ isClosed, isDelete }) =>
    isDelete
      ? css`
          ${deleteAnimation} .3s forwards
        `
      : isClosed
      ? ""
      : css`
          ${open} .3s forwards
        `};

  p {
    flex: 1;
    font-size: 12px;
  }

  .hidden {
    width: 0;
    padding: 0;
    margin: 0;
    border: none;
    transition: all 0.3s;

    input {
      width: 0;
      padding: 0;
      margin: 0;
      border: none;
    }
    textarea {
      width: 0;
      padding: 0;
      border: none;
      transition: all 0.3s;
    }
  }
`;

interface CloseIconProps {
  isShown: boolean;
}

export const CloseIcon = styled.div<CloseIconProps>`
  min-width: 18px;
  min-height: 18px;

  display: ${({ isShown }) => (isShown ? "flex" : "none")};
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.blue800};
  cursor: pointer;

  transition: all 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.blue700};
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  p {
    flex: 1;
    font-size: 12px;
  }

  span {
    font-size: 12px;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;

  margin-top: 15px;
`;
