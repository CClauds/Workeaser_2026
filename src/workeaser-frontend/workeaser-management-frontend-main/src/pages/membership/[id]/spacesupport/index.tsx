import { DotsMenu } from "@components/DotsMenu";
import { Table } from "@components/Table";
import { Row } from "@components/Table/Row";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { TableBody } from "@components/Table/TableBody";
import { TableHead } from "@components/Table/TableHead";
import { formatDate } from "@utils/numberFormat";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";

import styles from "./styles.module.scss";

interface SpaceSupportProps {
  id: string;
}
const SpaceSupport: React.FC<SpaceSupportProps> = ({ id }) => {
  const handleMenuClick = () => {};

  return (
    <>
      <Head>
        <title>Space Support</title>
      </Head>
      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>Space Support</h1>
          <span className={styles.line}></span>
        </header>

        <Table>
          <colgroup>
            <col width="12%" />
            <col width="12%" />
            <col width="34%" />
            <col width="20%" />
            <col width="20%" />
            <col width="2%" />
          </colgroup>
          <TableHead>
            <th>Ticket Number</th>
            <th className={styles.textCenter}>Opened Date</th>
            <th className={styles.textCenter}>Solved</th>
            <th className={styles.textCenter}>Ticket Priority</th>
            <th className={styles.textCenter}>Status</th>
            <th></th>
          </TableHead>
          <TableBody>
            <Row>
              <td>0000</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>
                <StatusContainer>Critical</StatusContainer>
              </td>
              <td className={styles.textCenter}>Solved</td>
              <td>
                <DotsMenu id="001" onMenuClick={handleMenuClick} />
              </td>
            </Row>
            <Row>
              <td>0001</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>-</td>
              <td className={styles.textCenter}>
                <StatusContainer>Low</StatusContainer>
              </td>
              <td className={styles.textCenter}>Open</td>
              <td>
                <DotsMenu id="001" onMenuClick={handleMenuClick} />
              </td>
            </Row>
            <Row>
              <td>0002</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>
                <StatusContainer>Normal</StatusContainer>
              </td>
              <td className={styles.textCenter}>Solved</td>
              <td>
                <DotsMenu id="001" onMenuClick={handleMenuClick} />
              </td>
            </Row>
            <Row>
              <td>0003</td>
              <td className={styles.textCenter}>{formatDate(new Date())}</td>
              <td className={styles.textCenter}>-</td>
              <td className={styles.textCenter}>
                <StatusContainer>High</StatusContainer>
              </td>
              <td className={styles.textCenter}>Open</td>
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

export default SpaceSupport;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};
