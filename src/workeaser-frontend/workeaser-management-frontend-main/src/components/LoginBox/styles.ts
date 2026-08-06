import styled from "styled-components";

interface InputWrapperProps {
  isOpen: boolean;
}

export const InputWrapper = styled.div<InputWrapperProps>`
  max-height: ${({ isOpen }) => (isOpen ? 100 : 0)}px;

  overflow: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: max-height 0.3s;
`;

export const CloseButton = styled.svg`
  cursor: pointer;
`;
