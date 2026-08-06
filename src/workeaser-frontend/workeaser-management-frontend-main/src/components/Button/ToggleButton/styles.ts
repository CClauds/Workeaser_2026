import styled from "styled-components";

interface DashboardHeaderProps {
  active?: boolean;
}

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  & > p.toggle__label {
    font-size: 10px;
    font-weight: 400;
    color: #000000;
  }
`;

export const Container = styled.button<DashboardHeaderProps>`
  position: relative;
  width: 38px;
  height: 20px;

  display: flex;
  align-items: center;

  padding: 0 4px;

  background-color: ${({ theme, active }) =>
    active ? theme.colors.notifySuccess : theme.colors.notifyFail};
  border-radius: 16px;

  transition: background-color 0.3s;

  span {
    position: absolute;
    left: ${({ active }) => (active ? "22px" : "4px")};
    display: block;
    width: 12px;
    height: 12px;

    background-color: #ffffff;
    border-radius: 6px;

    transition: left 0.3s;
  }
`;
