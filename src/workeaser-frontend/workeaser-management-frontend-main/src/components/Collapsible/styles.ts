import styled from "styled-components";

interface CollapsibleProps {
  childrenHeight: number;
  collapse?: boolean;
}

export const Container = styled.div<CollapsibleProps>`
  height: ${({ childrenHeight, collapse }) =>
    collapse ? 0 : `${childrenHeight}px` ?? "auto"};
  transition: height 0.2s;
  overflow: ${({ collapse }) => (collapse ? "hidden" : "visible")};
`;
