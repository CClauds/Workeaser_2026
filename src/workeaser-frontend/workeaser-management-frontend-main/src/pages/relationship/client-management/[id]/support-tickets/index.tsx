import Head from "next/head";
import React from "react";
import { DotsMenu } from "../../../../../components/DotsMenu";
import { Table } from "../../../../../components/Table";
import { Row } from "../../../../../components/Table/Row";
import { StatusContainer } from "../../../../../components/Table/Row/StatusContainer";
import { TableBody } from "../../../../../components/Table/TableBody";
import { TableHead } from "../../../../../components/Table/TableHead";
import { formatDate } from "../../../../../utils/numberFormat";
import styles from "../styles.module.scss";

const Tickets: React.FC = () => {
  const handleMenuClick = () => {};

  return (
    <>
      <Head>
        <title>Tickets | Workeaser</title>
      </Head>

      <div>
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
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Tickets;
