import styled from "styled-components";

export const ContentRow = styled.div`
  display: flex;
  gap: 10px;

  button {
    min-width: 55px;
    height: 44px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
    letter-spacing: 0.8px;
    white-space: nowrap;

    cursor: pointer;

    &.success {
      background-color: ${({ theme }) => theme.colors.tableBackgroundGreen};
    }
    &.warning {
      background-color: ${({ theme }) => theme.colors.tableBackgroundYellow};
    }

    &.danger {
      background-color: ${({ theme }) => theme.colors.tableBackgroundRed};
    }

    transition: filter 0.3s;
    &:hover {
      filter: brightness(0.9);
    }

    span:before {
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.blue800};
    }
  }
`;
