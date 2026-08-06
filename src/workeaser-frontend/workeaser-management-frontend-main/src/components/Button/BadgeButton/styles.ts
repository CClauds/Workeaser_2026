import styled, { css } from "styled-components";

interface ContainerProps {
  active?: boolean;
  notification?: boolean;
}

const after = css`
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);

  width: 10px;
  height: 10px;
  background-color: ${(props) => props.theme.colors.red500};
  border-radius: 50%;
`;

export const Container = styled.button<ContainerProps>`
  position: relative;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme, active }) =>
    active ? theme.colors.blue800 : theme.colors.darkGray};

  transition: filter 0.3s;

  &:hover {
    filter: brightness(0.8);
  }

  span::before {
    font-size: 20px;
    color: ${({ theme, active }) =>
      active ? theme.colors.white : theme.colors.blue800};
    border-radius: 5px;
  }

  &::after {
    ${({ notification }) => notification && after}
  }
`;
