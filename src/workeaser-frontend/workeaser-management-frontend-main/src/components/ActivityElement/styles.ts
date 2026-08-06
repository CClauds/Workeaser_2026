import styled, { css } from "styled-components";

interface ContainerProps {
  lastChild?: boolean;
}
export const Container = styled.div<ContainerProps>`
  position: relative;

  display: flex;
  gap: 10px;

  padding-bottom: ${({ lastChild }) => (lastChild ? 0 : "1.75rem")};

  ${({ lastChild }) =>
    lastChild
      ? ""
      : css`
          &:before {
            content: "";
            position: absolute;
            display: block;
            width: 3px;
            left: 3.25px;
            top: 15px;
            bottom: 5px;

            background-color: ${({ theme }) => theme.colors.gray300};
            border-radius: 4px;
          }
        `}
`;
interface CircleProps {
  lastChild?: boolean;
}
export const Circle = styled.span<CircleProps>`
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.blue200};
  border-radius: 5px;

  box-shadow: ${({ theme, lastChild }) =>
    lastChild ? `0 0 0 3px ${theme.colors.blue200}70` : "none"};
`;

interface ContentProps {
  hasBorder?: boolean;
}
export const Content = styled.div<ContentProps>`
  h4 {
    font-size: 15px;
    font-weight: ${({ theme }) => theme.fonts.bold};
    margin-bottom: 10px;
  }

  & > div {
    position: relative;

    p,
    time {
      font-size: 13px;
    }

    p {
      margin-left: ${({ hasBorder }) => (hasBorder ? 5 : 0)}px;
    }
    &:before {
      ${({ hasBorder }) =>
        hasBorder
          ? css`
              position: absolute;
              content: "";
              display: block;
              width: 3px;
              height: 100%;
              background-color: ${({ theme }) => theme.colors.blue200};
            `
          : ""};
    }
  }
`;
