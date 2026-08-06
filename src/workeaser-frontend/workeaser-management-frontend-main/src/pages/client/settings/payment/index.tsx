import { DotsMenu } from "@components/DotsMenu";
import { SettingsHeader } from "@components/Headers/SettingsHeader";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { Layout } from "@components/Layouts/Layout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { Table } from "@components/Table";
import { Row } from "@components/Table/Row";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { TableBody } from "@components/Table/TableBody";
import { TableHead } from "@components/Table/TableHead";
import { formatDate, formatMoney } from "@utils/numberFormat";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import React, { ReactElement } from "react";
import styles from "../styles.module.scss";

const Payment = () => {
  return (
    <>
      <Head>
        <title>Payment History | Workeaser</title>
      </Head>

      <div className={styles.paymentContainer}>
        <Table>
          <colgroup>
            <col width="20%" />
            <col width="48%" />
            <col width="15%" />
            <col width="15%" />
            <col width="2%" />
          </colgroup>
          <TableHead>
            <th>Invoice Number</th>
            <th>Date</th>
            <th>Status</th>
            <th>Amount</th>
            <th></th>
          </TableHead>
        </Table>
      </div>
    </>
  );
};

Payment.authRoles = ["CLIENT"];
Payment.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <ClientLayout componentProps={componentProps}>
      <SettingsLayout title="Account Settings" role="CLIENT">
        {page}
      </SettingsLayout>
    </ClientLayout>
  );
};
export default Payment;
