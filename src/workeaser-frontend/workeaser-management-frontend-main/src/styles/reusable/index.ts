import styled, { css } from "styled-components";

interface RowProps {
  gap?: number;
  align?: "stretch" | "start" | "end";
  justify?: "center" | "space-between" | "end";
  wrap?: string;
  bordered?: boolean;
}

export const Row = styled.div<RowProps>`
  display: flex;
  flex-wrap: ${({ wrap }) => (wrap ? "wrap" : "nowrap")};
  align-items: ${({ align }) => align ?? "center"};
  justify-content: ${({ justify }) => justify ?? "start"};
  gap: ${({ gap }) => gap ?? 0}px;

  ${({ bordered }) =>
    bordered
      ? css`
          padding: 0.5rem;
          border: 1px solid ${({ theme }) => theme.colors.gray300};
        `
      : ""}
`;

interface IntersectionProps {
  gap?: number;
}

export const Intersection = styled.div<IntersectionProps>`
  display: flex;
  align-items: center;
  gap: ${({ gap }) => gap ?? 0}px;

  p {
    font-size: 12px;
  }

  hr {
    border: 1px solid ${({ theme }) => theme.colors.darkGray};
  }
`;

export const DefaultInput = styled.input`
  width: inherit;
  height: inherit;
  appearance: none;
  outline: none;
  background: none;
  border: none;
`;
export const DefaultTextArea = styled.textarea`
  width: inherit;
  height: inherit;
  appearance: none;
  outline: none;
  background: none;
  resize: none;
`;

export const DefaultButton = styled.button`
  border: none;
  background: none;
  outline: none;
`;

export const scrollbarY = css`
  scrollbar-color: ${({ theme }) => theme.colors.lightGray};
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.colors.lightGray};
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    width: 100%;
    background-color: ${({ theme }) => theme.colors.darkerGray};
    border-radius: 8px;

    &:hover {
      background-color: ${({ theme }) => theme.colors.darkGray};
    }
  }
`;
