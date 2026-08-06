import React from "react";
import { ActiveLink } from "../../ActiveLink";

import styles from "./styles.module.scss";

export const ClientSettingsHeader: React.FC = () => {
  return (
    <header className={styles.tabNavigation}>
      <nav>
        <ul>
          <li>
            <ActiveLink
              href="/client/settings/account-information"
              activeClassName={styles.active}
            >
              <a>Account Information</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href="/client/settings/subscriptions"
              activeClassName={styles.active}
            >
              <a>Subscriptions</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href="/client/settings/wallet"
              activeClassName={styles.active}
            >
              <a>Wallet</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href="/client/settings/payment"
              activeClassName={styles.active}
            >
              <a>Payment History</a>
            </ActiveLink>
          </li>
          <li>
            <ActiveLink
              href="/client/settings/members"
              activeClassName={styles.active}
            >
              <a>Team Members</a>
            </ActiveLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};
