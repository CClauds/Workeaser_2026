import { Header } from "components/Header";
import { Sidebar } from "components/Sidebar";
import React, { ReactNode } from "react";
import styles from "./styles.module.scss";

interface LayoutProps {
  children: ReactNode;
  sidebarDisabled?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebarDisabled,
}) => {
  return (
    <>
      <Header hasSidebar={sidebarDisabled} />
      <div className={styles.container}>
        {sidebarDisabled ? null : <Sidebar />}
        <main>{children}</main>
      </div>
    </>
  );
};
