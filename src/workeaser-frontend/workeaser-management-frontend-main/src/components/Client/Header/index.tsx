import { ActiveLink } from "@components/ActiveLink";
import { BadgeButton } from "@components/Button/BadgeButton";
import { HeaderButton } from "@components/Button/HeaderButton";
import { ProfileButton } from "@components/Header/ProfileButton";
import { MessagesPopup } from "@components/MessagesPopup";
import { NotificationsPopup } from "@components/NotificationsPopup";
import { useFetch } from "hooks/useFetch";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useRef, useState } from "react";
import styles from "./styles.module.scss";

export const ClientHeader: React.FC = () => {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: { result: notificationsCount } = {} } = useFetch<{
    result: { total: number };
  }>("/notifications/count");

  const messagesButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  const handleMessagesClose = () => setIsMessagesOpen(false);
  const handleNotificationsClose = () => setIsNotificationsOpen(false);

  return (
    <>
      <header className={styles.container}>
        <div className={styles.menuLeft}>
          <Link href="/spaces">
            <figure className={styles.logoContainer}>
              <Image
                src={"/images/workeaser-logo.png"}
                width={140}
                height={40}
                objectFit={"contain"}
                alt=""
              />
            </figure>
          </Link>
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
              <li>
                <Link href="/client/membership">
                  <HeaderButton>My Membership</HeaderButton>
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.actionsContainer}>
            <ProfileButton />

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

            <Link href="/client/settings/account-information">
              <div className={styles.settings} />
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
