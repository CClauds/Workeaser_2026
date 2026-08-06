import { DotsMenu } from "@components/DotsMenu";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { Table } from "@components/Table";
import { Row } from "@components/Table/Row";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { TableBody } from "@components/Table/TableBody";
import { TableHead } from "@components/Table/TableHead";
import { formatDate } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import styles from "./styles.module.scss";

interface BookingScheduleProps {
  id: string;
}
const BookingSchedule: React.FC<BookingScheduleProps> = ({ id }) => {
  const handleMenuClick = () => {};

  return (
    <>
      <Head>
        <title>Booking Schedule</title>
      </Head>
      <header className={styles.header}>
        <h1 className={styles.title}>Booking Schedule</h1>
        <span className={styles.line}></span>
      </header>

      <Table>
        <colgroup>
          <col width="12%" />
          <col width="15%" />
          <col width="40%" />
          <col width="20%" />
          <col width="2%" />
        </colgroup>
        <TableHead>
          <th>Reservation Id</th>
          <th>Service Type</th>
          <th>Room Name</th>
          <th>Reservation Date</th>
          <th></th>
        </TableHead>
        <TableBody>
          <Row>
            <td>0000</td>
            <td>
              <StatusContainer>Conference</StatusContainer>
            </td>
            <td>name</td>
            <td>{formatDate(new Date())}</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </Row>
          <Row>
            <td>0001</td>
            <td>
              <StatusContainer>Metting</StatusContainer>
            </td>
            <td>name</td>
            <td>{formatDate(new Date())}</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </Row>
        </TableBody>
      </Table>
    </>
  );
};

export default BookingSchedule;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};
