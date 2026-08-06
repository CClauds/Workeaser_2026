import { StatusButton } from "@components/Button/StatusButton";
import { ActiveLink } from "components/ActiveLink";
import React from "react";
import styles from "./styles.module.scss";

interface MemberSidebarProps {
  currentId: string;
}
export const MemberSidebar: React.FC<MemberSidebarProps> = ({ currentId }) => {
  return (
    <aside className={styles.container}>
      <div className={styles.content}>
        <div className={styles.actionButton}>
          <button>
            <span className={styles.actionButton__cross} />
            <span>Quick Actions</span>
          </button>
        </div>

        <StatusButton status="ACTIVE">Active</StatusButton>

        <nav className={styles.nav}>
          <ul>
            <li>
              <ActiveLink
                href={`/membership/${currentId}/benefitsoverview`}
                activeClassName={styles.active}
                extraClass={styles.dashboardIcon}
              >
                <a>Benefits Overview</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/membership/${currentId}/productsandservices`}
                activeClassName={styles.active}
                extraClass={styles.servicesIcon}
              >
                <a>Products &amp; Services</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/membership/${currentId}/bookingschedule`}
                activeClassName={styles.active}
                extraClass={styles.groupIcon}
              >
                <a>Booking Schedule</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/membership/${currentId}/mailboxmanager`}
                activeClassName={styles.active}
                extraClass={styles.piggyIcon}
              >
                <a>Mailbox Manager</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/membership/${currentId}/paymentandinvoices`}
                activeClassName={styles.active}
                extraClass={styles.piggyIcon}
              >
                <a>Payment &amp; Invoices</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/membership/${currentId}/spacesupport`}
                activeClassName={styles.active}
                extraClass={styles.groupIcon}
              >
                <a>Space Support</a>
              </ActiveLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};
