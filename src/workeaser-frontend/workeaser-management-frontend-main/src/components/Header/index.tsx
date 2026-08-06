import { ActiveLink } from "@components/ActiveLink";
import { BadgeButton } from "@components/Button/BadgeButton";
import { ClientProfileButton } from "@components/Client/ProfileButton";
import { MessagesPopup } from "@components/MessagesPopup";
import { NotificationsPopup } from "@components/NotificationsPopup";
import { AuthContext } from "@contexts/AuthContext";
import { MenuContext } from "@contexts/MenuContext";
import { useFetch } from "hooks/useFetch";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useContext, useRef, useState } from "react";
import { HeaderSearch } from "./HeaderSearch";
import styles from "./styles.module.scss";

interface HeaderProps {
  hasSidebar?: boolean;
}
export const Header: React.FC<HeaderProps> = ({ hasSidebar = true }) => {
  const { user } = useContext(AuthContext);
  const { isOpen, handleSidebarToggle } = useContext(MenuContext);

  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: { result: notificationsCount } = {} } = useFetch<{
    result: { total: number };
  }>("/notifications/count");

  const messagesButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  const { role } = user || {};

  const handleMessagesClose = () => setIsMessagesOpen(false);
  const handleNotificationsClose = () => setIsNotificationsOpen(false);

  return (
    <>
      <header className={styles.container}>
        <div className={styles.menuLeft}>
          {hasSidebar && (
            <div
              className={`
          ${styles.menu}
          ${isOpen ? styles.on : ""}
        `}
              onClick={handleSidebarToggle}
            >
              <div className={isOpen ? styles.on : ""} />
              <div className={isOpen ? styles.on : ""} />
              <div className={isOpen ? styles.on : ""} />
            </div>
          )}

          <Link href="/dashboard">
            <figure className={styles.logoContainer}>
              <Image
                src={"/images/workeaser-logo.png"}
                width={140}
                height={40}
                objectFit="contain"
                alt=""
              />
            </figure>
          </Link>

          <HeaderSearch />
        </div>

        <div className={styles.menuRight}>
          <nav className={styles.nav}>
            <ul>
              {/* <li>
              <ActiveLink href="/marketplace" activeClassName={styles.active}>
                <a>Marketplace</a>
              </ActiveLink>
            </li>
            <li>
              <Link href="#">
                <a>Community</a>
              </Link>
            </li> */}
              <li>
                <ActiveLink href="/spaces" activeClassName={styles.active}>
                  <a>Spaces</a>
                </ActiveLink>
              </li>
              {/* <li>
              <Link href="/membership">
                <a>
                  <HeaderButton>My Membership</HeaderButton>
                </a>
              </Link>
            </li> */}
            </ul>
          </nav>

          <div className={styles.actionsContainer}>
            <ClientProfileButton />

            <BadgeButton
              ref={messagesButtonRef}
              icon="chat"
              // notification={true}
              isActive={isMessagesOpen}
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
            />

            <BadgeButton
              ref={notificationsButtonRef}
              icon="bell"
              notification={notificationsCount?.total > 0 ? true : false}
              isActive={isNotificationsOpen}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            />

            <Link
              href={`${
                role === "CLIENT" ? "/client" : ""
              }/settings/account-information`}
            >
              <div className={styles.settings}></div>
            </Link>
          </div>
        </div>
      </header>

      <MessagesPopup
        isOpen={isMessagesOpen}
        onRequestClose={handleMessagesClose}
        buttonRef={messagesButtonRef}
      />
      <NotificationsPopup
        isOpen={isNotificationsOpen}
        onRequestClose={handleNotificationsClose}
        buttonRef={notificationsButtonRef}
      />
    </>
  );
};
