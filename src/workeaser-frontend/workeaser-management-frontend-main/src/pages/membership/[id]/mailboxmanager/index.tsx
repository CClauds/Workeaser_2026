import { DotsMenu } from "@components/DotsMenu";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { Table } from "@components/Table";
import { Row } from "@components/Table/Row";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { TableBody } from "@components/Table/TableBody";
import { TableHead } from "@components/Table/TableHead";
import { Thumbnail } from "@components/Thumbnail";
import { formatDate } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";

import styles from "./styles.module.scss";

interface MailboxManagerProps {
  id: string;
}
const MailboxManager: React.FC<MailboxManagerProps> = ({ id }) => {
  const handleMenuClick = () => {};

  return (
    <>
      <Head>
        <title>Mailbox Manager</title>
      </Head>
      <header className={styles.header}>
        <h1 className={styles.title}>Mailbox Manager</h1>
        <span className={styles.line}></span>
      </header>

      <Table>
        <colgroup>
          <col width="10%" />
          <col width="8%" />
          <col width="40%" />
          <col width="15%" />
          <col width="15%" />
          <col width="15%" />
          <col width="2%" />
        </colgroup>
        <TableHead>
          <th>Delivery Id</th>
          <th></th>
          <th>Member Name &amp; Location</th>
          <th className={styles.textCenter}>Requesred Action</th>
          <th className={styles.textCenter}>Status</th>
          <th className={styles.textCenter}>Received On</th>
          <th></th>
        </TableHead>
        <TableBody>
          <Row>
            <td>0000</td>
            <td>
              <Thumbnail url="" size={50} alt="" />
            </td>
            <td>
              <h3>Name</h3>
              <h4>Address</h4>
            </td>
            <td className={styles.textCenter}>Picking Up</td>
            <td className={styles.textCenter}>
              <StatusContainer bgColor="green">Collected</StatusContainer>
            </td>
            <td className={styles.textCenter}>{formatDate(new Date())}</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </Row>
          <Row>
            <td>0001</td>
            <td>
              <Thumbnail url="" size={50} alt="" />
            </td>
            <td>
              <h3>Name</h3>
              <h4>Address</h4>
            </td>
            <td className={styles.textCenter}>Hold at Location</td>
            <td className={styles.textCenter}>
              <StatusContainer>Not Collected</StatusContainer>
            </td>
            <td className={styles.textCenter}>{formatDate(new Date())}</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </Row>
          <Row>
            <td>0002</td>
            <td>
              <Thumbnail url="" size={50} alt="" />
            </td>
            <td>
              <h3>Name</h3>
              <h4>Address</h4>
            </td>
            <td className={styles.textCenter}>Trash it</td>
            <td className={styles.textCenter}>
              <StatusContainer>Trashed</StatusContainer>
            </td>
            <td className={styles.textCenter}>{formatDate(new Date())}</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </Row>
          <Row>
            <td>0003</td>
            <td>
              <Thumbnail url="" size={50} alt="" />
            </td>
            <td>
              <h3>Name</h3>
              <h4>Address</h4>
            </td>
            <td className={styles.textCenter}>Forward it</td>
            <td className={styles.textCenter}>
              <StatusContainer>Forwarded</StatusContainer>
            </td>
            <td className={styles.textCenter}>{formatDate(new Date())}</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </Row>
        </TableBody>
      </Table>
    </>
  );
};

export default MailboxManager;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};
