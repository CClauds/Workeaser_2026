import styled from "styled-components";

interface ContainerProps {
  isNew: boolean;
  isClickable: boolean;
}

export const Container = styled.div<ContainerProps>`
  position: relative;
  display: flex;
  align-items: center;

  padding: 0.75rem;

  background-color: ${({ theme, isNew }) =>
    isNew ? theme.colors.white : theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  cursor: ${({ isClickable }) => (isClickable ? "pointer" : "auto")};

  &:hover {
    background-color: ${({ theme, isClickable }) =>
      isClickable ? theme.colors.darkGray : ""};
  }

  .close__button {
    position: absolute;
    right: 0.5rem;
    bottom: 0.35rem;
  }

  .infos {
    flex: 1;
    display: flex;
    justify-content: space-between;

    & > section {
      flex: 1;
      margin-left: 8px;
    }

    h2 {
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.semibold};
    }
  }

  time {
    font-size: 9px;
    font-weight: ${({ theme }) => theme.fonts.bold};
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MessageContainer = styled.div`
  /* max-width: 245px; */
  max-width: 14rem;

  p {
    font-size: 11px;
    font-weight: ${({ theme }) => theme.fonts.regular};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    margin-top: 3px;
  }
`;
