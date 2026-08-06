import Head from "next/head";
import React from "react";

import styles from "./styles.module.scss";
import { Table } from "@components/Table";
import { TableHead } from "@components/Table/TableHead";
import { TableBody } from "@components/Table/TableBody";
import { Row } from "@components/Table/Row";
import { formatDate, formatMoney } from "@utils/numberFormat";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { DotsMenu } from "@components/DotsMenu";
import { GetServerSideProps } from "next";

interface PaymentAndInvoicesProps {
  id: string;
}
const PaymentAndInvoices: React.FC<PaymentAndInvoicesProps> = ({ id }) => {
  const handleMenuClick = () => {};
  return (
    <>
      <Head>
        <title>Payment &amp; Invoices</title>
      </Head>
      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>Payment &amp; Invoices</h1>
          <span className={styles.line}></span>
        </header>

        <Table>
          <colgroup>
            <col width="12%" />
            <col width="40%" />
            <col width="23%" />
            <col width="23%" />
            <col width="2%" />
          </colgroup>
          <TableHead>
            <th>Invoice Number</th>
            <th>Date</th>
            <th>Status</th>
            <th>Amount</th>
            <th></th>
          </TableHead>
          <TableBody>
            <Row>
              <td>0000</td>
              <td>{formatDate(new Date())}</td>
              <td>
                <StatusContainer>Partially Paid</StatusContainer>
              </td>
              <td>{formatMoney(12321)}</td>
              <td>
                <DotsMenu id="001" onMenuClick={handleMenuClick} />
              </td>
            </Row>
            <Row>
              <td>0001</td>
              <td>{formatDate(new Date())}</td>
              <td>
                <StatusContainer>Overdue</StatusContainer>
              </td>
              <td>{formatMoney(192.32)}</td>
              <td>
                <DotsMenu id="001" onMenuClick={handleMenuClick} />
              </td>
            </Row>
            <Row>
              <td>0000</td>
              <td>{formatDate(new Date())}</td>
              <td>
                <StatusContainer>Fully Paid</StatusContainer>
              </td>
              <td>{formatMoney(0)}</td>
              <td>
                <DotsMenu id="001" onMenuClick={handleMenuClick} />
              </td>
            </Row>
            <Row>
              <td>0000</td>
              <td>{formatDate(new Date())}</td>
              <td>
                <StatusContainer>Open Invoice</StatusContainer>
              </td>
              <td>{formatMoney(321)}</td>
              <td>
                <DotsMenu id="001" onMenuClick={handleMenuClick} />
              </td>
            </Row>
          </TableBody>
        </Table>
      </main>
    </>
  );
};

export default PaymentAndInvoices;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};
