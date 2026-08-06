import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { Table } from "@components/Table";
import { TableHead } from "@components/Table/TableHead";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import { ReactElement } from "react";
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

Payment.authRoles = ["COWORKING"];
Payment.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default Payment;
