import { DefaultButton } from "@styles/reusable";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 5px;

  border: 1px solid ${({ theme }) => theme.colors.gray300};
`;

interface NabButtonProps {
  isActive?: boolean;
}

export const NabButton = styled(DefaultButton)<NabButtonProps>`
  /* flex: 1; */
  padding: 6px;
  font-size: 14px;
  /* white-space: nowrap; */

  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.darkGray : "transparent"};

  &:hover {
    background-color: ${({ theme }) => theme.colors.darkGray};
  }
`;
