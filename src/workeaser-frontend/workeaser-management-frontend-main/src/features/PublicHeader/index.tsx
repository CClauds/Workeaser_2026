import { ActiveLink } from "@components/ActiveLink";
import { Icomoon } from "@components/Icomoon";
import Image from "next/legacy/image";
import Link from "next/link";
import React from "react";
import { useTheme } from "styled-components";
import styles from "./styles.module.scss";

export const PublicHeader: React.FC = () => {
  const theme = useTheme();
  return (
    <header className={styles.container}>
      <div className={styles.menuLeft}>
        <Link href="/spaces">
          <figure className={styles.logoContainer}>
            <Image
              src="/images/workeaser-logo.png"
              width={140}
              height={40}
              objectFit="contain"
              alt="workeaser logo"
            />
          </figure>
        </Link>
      </div>

      <div className={styles.menuRight}>
        <nav className={styles.nav}>
          <ul>
            <li>
              <ActiveLink href="/spaces" activeClassName={styles.active}>
                <a>Spaces</a>
              </ActiveLink>
            </li>
          </ul>
        </nav>

        <div className={styles.actionsContainer}>
          <Link href="/login">
            <Icomoon iconName="user" color={theme.colors.blue800} />
          </Link>
        </div>
      </div>
    </header>
  );
};
