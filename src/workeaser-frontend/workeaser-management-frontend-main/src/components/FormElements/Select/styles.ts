import styled from "styled-components";

interface SelectProps {
  open: boolean;
}

export const Container = styled.div`
  position: relative;

  height: 36px;

  border: 1px solid ${({ theme }) => theme.colors.darkGray};

  &:hover {
    border-color: ${({ theme }) => theme.colors.blue200};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.blue200};
    box-shadow: 0 0 4px ${({ theme }) => theme.colors.blue400}90;
  }

  p {
    font-size: 14px;
    font-weight: 400;
  }
`;

export const Button = styled.div<SelectProps>`
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

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};

  margin-top: 10px;

  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);

  z-index: 100;
  overflow: auto;

  transition: all 0.3s;
`;

export const OptionItem = styled.div`
  display: flex;
  align-items: center;

  padding: 8px;

  font-size: 14px;
  line-height: 1.5;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }
`;
