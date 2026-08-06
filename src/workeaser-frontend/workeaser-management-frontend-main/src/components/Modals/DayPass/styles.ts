import styled from "styled-components";

interface CollapseProps {
  collapse: boolean;
}

export const Collapse = styled.div<CollapseProps>`
  max-height: ${({ collapse }) => (collapse ? 0 : 40)}px;
  transition: max-height 0.3s;
  overflow: ${({ collapse }) => (collapse ? "hidden" : "visible")};
`;
