import { StatusButton } from "@components/Button/StatusButton";
import { Icomoon } from "@components/Icomoon";
import { ActiveLink } from "components/ActiveLink";
import React from "react";
import styles from "./styles.module.scss";

enum StatusEnum {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

interface MemberSidebarProps {
  currentId: string;
  status: "ACTIVE" | "INACTIVE";
}
export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  currentId,
  status,
}) => {
  return (
    <aside className={styles.container}>
      <div className={styles.content}>
        <StatusButton status={status}>{StatusEnum[status]}</StatusButton>

        <nav className={styles.nav}>
          <ul>
            <li>
              <ActiveLink
                href={`/client/membership/${currentId}/products-and-services`}
                activeClassName={styles.active}
              >
                <a>
                  <Icomoon iconName="services" className={styles.icon} />
                  <span>Products &amp; Services</span>
                </a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/client/membership/${currentId}/booking-schedule`}
                activeClassName={styles.active}
              >
                <a>
                  <Icomoon iconName="relationship" className={styles.icon} />
                  <span>Booking Schedule</span>
                </a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/client/membership/${currentId}/mailbox-manager`}
                activeClassName={styles.active}
              >
                <a>
                  <Icomoon iconName="send" className={styles.icon} />
                  <span>Mailbox Manager</span>
                </a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href={`/client/membership/${currentId}/payment-and-invoices`}
                activeClassName={styles.active}
              >
                <a>
                  <Icomoon iconName="finance" className={styles.icon} />
                  <span>Payment &amp; Invoices</span>
                </a>
              </ActiveLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};
