import styled from "styled-components";

interface SelectProps {
  open?: boolean;
  isLoading?: boolean;
}

export const Container = styled.div<SelectProps>`
  position: relative;

  height: 36px;

  border: 1px solid ${({ theme }) => theme.colors.blue400};

  pointer-events: ${({ isLoading }) => (isLoading ? "none" : "all")};
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};

  &:hover {
    border-color: ${({ theme }) => theme.colors.blue200};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.blue200};
    box-shadow: 0 0 4px ${({ theme }) => theme.colors.blue400}90;
    /* box-shadow: 0 0 4px rgba(72, 164, 249, 0.52); */
  }

  p {
    font-size: 12px;
    font-weight: 400;
  }
`;

export const Button = styled.div<SelectProps>`
  /* position: relative; */

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 100%;

  padding: 8px;

  cursor: pointer;
  user-select: none;

  svg {
    transition: transform 0.3s;
    transform: ${({ open }) => (open ? "rotate(180deg)" : "")};
  }
`;

export const Content = styled.div<SelectProps>`
  position: absolute;
  max-height: 300px;

  opacity: ${({ open }) => (open ? "1" : "0")};
  visibility: ${({ open }) => (open ? "visible" : "hidden")};

  width: fill-available;

  background: #ffffff;
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  margin-top: 10px;

  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);

  z-index: 100;
  overflow: auto;

  transition: all 0.3s;
`;

export const OptionItem = styled.div`
  display: flex;
  align-items: center;

  font-size: 12px;
  color: #252728;

  padding: 8px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }
`;
