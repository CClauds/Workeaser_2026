import { Button } from "@components/Button";
import { DotsMenu } from "@components/DotsMenu";
import { Table } from "@components/Table";
import { Row } from "@components/Table/Row";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { TableBody } from "@components/Table/TableBody";
import { TableHead } from "@components/Table/TableHead";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import { formatDate } from "utils/numberFormat";

import styles from "./styles.module.scss";

interface ProductsAndServicesProps {
  id: string;
}
const ProductsAndServices: React.FC<ProductsAndServicesProps> = ({ id }) => {
  const handleMenuClick = () => {};

  return (
    <>
      <Head>
        <title>Products &amp; Services</title>
      </Head>
      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>Products &amp; Services</h1>
          <span className={styles.line}></span>
        </header>

        <Table>
          <colgroup>
            <col width="10%" />
            <col width="20%" />
            <col width="38%" />
            <col width="15%" />
            <col width="15%" />
            <col width="2%" />
          </colgroup>
          <TableHead>
            <th>Service ID</th>
            <th>Service Type</th>
            <th>Service Name</th>
            <th className={styles.textCenter}>Renewal Date</th>
            <th className={styles.textCenter}>Client Contract</th>
            <th></th>
          </TableHead>
          <TableBody>
            <Row>
              <td>000</td>
              <td>
                <StatusContainer>Private Office</StatusContainer>
              </td>
              <td>Service Name</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>
                <Button
                  text="View Contract"
                  color="secondary"
                  extraClass={styles.viewButton}
                />
              </td>
              <td>
                <DotsMenu id="321" onMenuClick={handleMenuClick} />
              </td>
            </Row>
            <Row>
              <td>001</td>
              <td>
                <StatusContainer>Virtual Office</StatusContainer>
              </td>
              <td>Service Name</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>
                <Button
                  text="View Contract"
                  color="secondary"
                  extraClass={styles.viewButton}
                />
              </td>
              <td>
                <DotsMenu id="321" onMenuClick={handleMenuClick} />
              </td>
            </Row>
          </TableBody>
        </Table>
      </main>
    </>
  );
};

export default ProductsAndServices;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};
