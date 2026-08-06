import styled from "styled-components";

interface ServicesButtonContainerProps {
  isActive?: boolean;
}

export const ServicesButtonContainer = styled.button<ServicesButtonContainerProps>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;

  padding: 1rem;
  background-color: 1px solid ${({ theme }) => theme.colors.white};
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.green200 : theme.colors.gray300};

  opacity: ${({ isActive }) => (isActive ? 1 : 0.5)};
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
