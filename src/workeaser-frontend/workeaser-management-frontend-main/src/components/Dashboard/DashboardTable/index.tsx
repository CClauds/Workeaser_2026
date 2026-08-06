import React from "react";
import { DotsMenu } from "../../DotsMenu";
import { StatusContainer } from "../../Table/Row/StatusContainer";
import styles from "./styles.module.scss";
import { Icomoon } from "./../../Icomoon/index";

interface DashboardTableProps {
  tHead: string[];
}

export const DashboardTable: React.FC<DashboardTableProps> = ({ tHead }) => {
  const handleMenuClick = () => {};

  return (
    <>
      <table className={styles.container}>
        <colgroup>
          <col width="28%" />
          <col width="40%" />
          <col width="30%" />
          <col width="2%" />
        </colgroup>
        <thead>
          <tr>
            {tHead.map((head) => (
              <th key={head}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <StatusContainer bgColor="blue">Room Booking</StatusContainer>
            </td>
            <td>Room name</td>
            <td>00/00/0000 at 00:00</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </tr>
          <tr>
            <td>
              <StatusContainer bgColor="blue">Room Booking</StatusContainer>
            </td>
            <td>Room name</td>
            <td>00/00/0000 at 00:00</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </tr>
          <tr>
            <td>
              <StatusContainer bgColor="blue">Room Booking</StatusContainer>
            </td>
            <td>Room name</td>
            <td>00/00/0000 at 00:00</td>
            <td>
              <DotsMenu id="001" onMenuClick={handleMenuClick} />
            </td>
          </tr>
        </tbody>
      </table>

      <footer className={styles.footer}>
        <div>
          <Icomoon iconName="arrow-down" />
          <p>PREVIOUS</p>
        </div>
        <div>
          <p>NEXT</p>
          <Icomoon iconName="arrow-down" />
        </div>
      </footer>
    </>
  );
};
