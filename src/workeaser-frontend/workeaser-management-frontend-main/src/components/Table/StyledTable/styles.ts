import styled from "styled-components";

interface ContainerProps {
  bordered: boolean;
  isEditable?: boolean;
  tableTheme?: string;
}

export const Container = styled.div<ContainerProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    border: ${({ theme, bordered, tableTheme }) =>
      bordered &&
      `1px solid ${
        tableTheme === "blue" ? theme.colors.blue800 : theme.colors.darkGray
      }`};

    thead {
      text-align: left;
      line-height: ${({ isEditable }) => (isEditable ? 0.8 : 2.5)};
      /* background-color: ${({ theme }) => theme.colors.blue800}; */
      background-color: ${({ theme, tableTheme }) =>
        tableTheme === "gray" ? theme.colors.darkGray : theme.colors.blue800};

      th {
        padding: ${({ isEditable }) => (isEditable ? 8 : 0)}px;

        font-size: 14px;
        font-weight: ${(props) => props.theme.fonts.semibolder};
        text-transform: capitalize;
        white-space: nowrap;
        color: ${({ theme }) => theme.colors.white};
        color: ${({ theme, tableTheme }) =>
          tableTheme === "gray" ? theme.colors.blue800 : theme.colors.white};

        border-width: ${({ isEditable }) => (isEditable ? 1 : 0)}px;
        border-style: ${({ isEditable, bordered }) =>
          bordered ? "none" : isEditable ? "solid" : "none"};
        border-color: ${({ theme }) => theme.colors.blue800};

        &:first-child {
          padding-left: 10px;
        }
      }
    }

    tbody {
      tr {
        &:nth-child(odd) {
          background-color: ${({ theme }) => theme.colors.lightGray};
        }
        &:nth-child(even) {
          background-color: ${({ theme }) => theme.colors.white};
        }
      }
      td {
        padding: ${({ isEditable }) => (isEditable ? "10px" : "10px 0")};

        font-size: 12px;
        font-weight: ${(props) => props.theme.fonts.semibold};

        border-width: ${({ isEditable, bordered }) =>
          bordered ? "0 0 1px 0" : isEditable ? "1px" : "0 0 1px 0"};
        border-style: solid;
        border-color: ${({ theme }) => theme.colors.gray300};

        &:last-child {
          border-style: ${({ bordered }) => (bordered ? "none" : "solid")};
        }

        &:first-child {
          padding-left: 10px;
          font-weight: ${({ theme }) => theme.fonts.black};
        }
      }
    }

    .align__left {
      text-align: left;
    }
    .align__center {
      text-align: center;
    }
    .align__right {
      text-align: right;
    }
    .flex__center {
      & > button {
        margin: auto;
      }
    }
    .flex__end {
      & > * {
        margin-left: auto;
        padding-right: 1px;
      }
    }

    .table__button {
      height: 24px;
      font-size: 10px;
      padding: 0 6px;
    }
  }
`;

export const Pagination = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 0.75rem;

  & > button {
    display: flex;
    align-items: center;

    background: none;

    cursor: pointer;

    &:disabled {
      opacity: 0.8;
    }

    p {
      font-size: 9px;
      font-weight: ${({ theme }) => theme.fonts.semibold};
    }

    &:hover:not(:disabled) {
      P,
      span {
        color: ${({ theme }) => theme.colors.blue600};
        &::before {
          color: ${({ theme }) => theme.colors.blue600};
        }
      }
    }

    span {
      &:first-child {
        transform: rotate(90deg);
      }
      &:last-child {
        transform: rotate(-90deg);
      }
      &::before {
        font-weight: ${({ theme }) => theme.fonts.black};
        color: ${({ theme }) => theme.colors.blue800};
      }
    }
  }
`;
