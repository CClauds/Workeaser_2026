import React from "react";
import { ActiveLink } from "../../ActiveLink";

import styles from "./styles.module.scss";

interface LocationHederProps {
  id: number;
}

export const LocationHeader: React.FC<LocationHederProps> = ({ id }) => {
  return (
    <header className={styles.tabNavigation}>
      <nav>
        <ul>
          <li>
            <ActiveLink
              href={`/locations/${id}/overview`}
              activeClassName={styles.active}
            >
              <a>Overview</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href={`/locations/${id}/products`}
              activeClassName={styles.active}
            >
              <a>Products &amp; Services</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href={`/locations/${id}/members`}
              activeClassName={styles.active}
            >
              <a>Members</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href={`/locations/${id}/bookings`}
              activeClassName={styles.active}
            >
              <a>Bookings</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href={`/locations/${id}/invoices`}
              activeClassName={styles.active}
            >
              <a>Invoices</a>
            </ActiveLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};
