import React from "react";
import { ActiveLink } from "../../ActiveLink";

import styles from "./styles.module.scss";

interface ClientHederProps {
  id: string;
}

export const ClientHeader: React.FC<ClientHederProps> = ({ id }) => {
  return (
    <header className={styles.tabNavigation}>
      <nav>
        <ul>
          <li>
            <ActiveLink
              href={`/relationship/client-management/${id}/overview`}
              activeClassName={styles.active}
            >
              <a>Overview</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href={`/relationship/client-management/${id}/products-and-services`}
              activeClassName={styles.active}
            >
              <a>Products &amp; Services</a>
            </ActiveLink>
          </li>
          {/* <li>
            <ActiveLink
              href={`/relationship/client-management/${id}/benefits`}
              activeClassName={styles.active}
            >
              <a>Benefits</a>
            </ActiveLink>
          </li> */}
          <li>
            <ActiveLink
              href={`/relationship/client-management/${id}/mailbox`}
              activeClassName={styles.active}
            >
              <a>Mailbox</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href={`/relationship/client-management/${id}/bookings`}
              activeClassName={styles.active}
            >
              <a>Bookings</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href={`/relationship/client-management/${id}/invoices`}
              activeClassName={styles.active}
            >
              <a>Invoices</a>
            </ActiveLink>
          </li>
          {/* <li>
            <ActiveLink
              href={`/relationship/client-management/${id}/tickets`}
              activeClassName={styles.active}
            >
              <a>Support Tickets</a>
            </ActiveLink>
          </li> */}
        </ul>
      </nav>
    </header>
  );
};
