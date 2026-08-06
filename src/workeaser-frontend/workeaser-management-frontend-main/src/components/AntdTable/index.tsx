import { Table } from "@components/antd-client";
import React from "react";
import styles from "./styles.module.scss";

const AntdTable = (props) => {
  return (
    <Table
      {...props}
      rowClassName={styles.antdTableBodyTr}
      components={{
        header: {
          wrapper: AntdTableTHead,
        },
        body: {
          wrapper: AntdTableTbody,
          cell: AntdTableBodyTd,
        },
      }}
    />
  );
};

const AntdTableTHead = ({ children }) => {
  return <thead className={styles.AntdtableHead}>{children}</thead>;
};

const AntdTableTbody = ({ children }) => {
  return <tbody className={styles.AntdtableBody}>{children}</tbody>;
};

const AntdTableBodyTd = ({ children, colSpan }) => (
  <td className={styles.antdTableBodyTd} colSpan={colSpan}>
    {children}
  </td>
);

export default AntdTable;
