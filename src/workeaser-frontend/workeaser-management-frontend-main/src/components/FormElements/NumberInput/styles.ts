import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  padding: 5px 10px;

  border: 1px solid ${({ theme }) => theme.colors.gray300};
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 1rem;

  & > button {
    width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.darkGray};

    &:hover:not(:disabled) {
      filter: brightness(0.7);
    }

    &:disabled {
      opacity: 0.7;
    }
  }
`;
