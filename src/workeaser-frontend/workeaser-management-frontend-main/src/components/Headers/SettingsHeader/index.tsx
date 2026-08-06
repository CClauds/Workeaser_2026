import { AuthContext } from "@contexts/AuthContext";
import React, { useContext } from "react";
import { CoworkModulesEnum } from "types/user";
import { ActiveLink } from "../../ActiveLink";
import styles from "./styles.module.scss";

export const SettingsHeader: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className={styles.tabNavigation}>
      <nav>
        <ul>
          <li>
            <ActiveLink
              href="/settings/account-information"
              activeClassName={styles.active}
            >
              <a>Account Information</a>
            </ActiveLink>
          </li>
          {generateSettingsPage()}
        </ul>
      </nav>
    </header>
  );

  function generateSettingsPage() {
    if (!user) {
      return <></>;
    }
    const isUserAuthorized = user.coworkUser.coworkModules.some(
      (module) => module.slug === CoworkModulesEnum.ACCOUNT_SETTINGS
    );
    if (!isUserAuthorized && user.coworkUser.role !== "MANAGER") {
      return <></>;
    }

    return (
      <>
        <li>
          <ActiveLink
            href="/settings/subscriptions"
            activeClassName={styles.active}
          >
            <a>Subscription</a>
          </ActiveLink>
        </li>
        <li>
          <ActiveLink href="/settings/wallet" activeClassName={styles.active}>
            <a>Wallet</a>
          </ActiveLink>
        </li>
        <li>
          <ActiveLink href="/settings/payment" activeClassName={styles.active}>
            <a>Payment History</a>
          </ActiveLink>
        </li>
        {user.coworkUser.role === "MANAGER" && (
          <>
            <li>
              <ActiveLink
                href="/settings/members"
                activeClassName={styles.active}
              >
                <a>Team Members</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink
                href="/settings/global-settings"
                activeClassName={styles.active}
              >
                <a>Global Settings</a>
              </ActiveLink>
            </li>
          </>
        )}
      </>
    );
  }
};
