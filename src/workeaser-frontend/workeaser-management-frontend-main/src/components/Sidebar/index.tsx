import { QuickactionsMenu } from "@components/Menus/QuickactionsMenu";
import { AuthContext } from "@contexts/AuthContext";
import { CoworkModulesEnum } from "types/user";
import { MenuContext } from "contexts/MenuContext";
import Link from "next/link";
import { useContext, useRef, useState } from "react";
import { Icomoon } from "../Icomoon";
import {
  PageNavigator,
  SidebarWrapper,
  Navigator,
  SideMenuPopup,
  ExtraMenu,
} from "./styles";
import styles from "./styles.module.scss";

export const Sidebar = () => {
  const quickactionsRef = useRef<HTMLButtonElement>(null);
  const { user } = useContext(AuthContext);
  const [isQuickactionOpen, setIsQuickactionsOpen] = useState(false);
  const [extraMenuOpen, setExtraMenuOpen] = useState<string>();

  const { pathHistory, isOpen } = useContext(MenuContext);

  const handleMouseEvent = (e: MouseEvent) => {
    if (
      isQuickactionOpen &&
      !quickactionsRef.current.contains(e.target as Node)
    ) {
      setIsQuickactionsOpen(false);
    }
  };

  const handleQuickactionsClose = () => setIsQuickactionsOpen(false);

  return (
    <>
      <SidebarWrapper isOpen={isOpen}>
        <div className={styles.content}>
          <QuickactionsMenu
            isOpen={isQuickactionOpen}
            isSidebarOpen={isOpen}
            onRequestClose={handleQuickactionsClose}
            onMouseClick={handleMouseEvent}
          />

          <div className={styles.actionButton}>
            <button
              ref={quickactionsRef}
              className={!isOpen ? styles.sidebarClosed : ""}
              onClick={() => setIsQuickactionsOpen(true)}
            >
              <span
                className={`
              ${styles.actionButton__cross} 
              ${!isOpen ? styles.sidebarClosed : ""}
            `}
              />
              <span>Quick Actions</span>
            </button>
          </div>

          <Navigator isOpen={isOpen}>
            <ul>
              <li>
                <Link href="/dashboard">
                  <Icomoon iconName="dashboard" className="icon" />
                  <span>Dashboard</span>
                </Link>
              </li>
              {ControlMenuTab(CoworkModulesEnum.LOCATIONS)}
              {ControlMenuTab(CoworkModulesEnum.SERVICES)}
              {ControlMenuTab(CoworkModulesEnum.RELATIONSHIP)}
              {ControlMenuTab(CoworkModulesEnum.FINANCES)}
              {ControlMenuTab(CoworkModulesEnum.REPORTS)}
            </ul>
          </Navigator>
        </div>
      </SidebarWrapper>
    </>
  );

  function ControlMenuTab(module: CoworkModulesEnum) {
    if (!user) {
      return <></>;
    }

    const isPermModules = user.coworkUser.coworkModules
      ? user.coworkUser.coworkModules.some((m) => m.slug === module)
      : true;
    if (isPermModules || user.coworkUser.role === "MANAGER") {
      switch (module) {
        case CoworkModulesEnum.LOCATIONS:
          return (
            <li>
              <Link href="/locations/dashboard">
                <Icomoon iconName="location" className="icon" />
                <span>Locations</span>
              </Link>
              <PageNavigator
                height={25}
                isSidebarOpen={isOpen}
                opened={
                  pathHistory?.current === "locations" &&
                  pathHistory?.last === "locations"
                }
                open={
                  pathHistory?.current === "locations" &&
                  pathHistory?.last !== "locations"
                }
                close={
                  pathHistory?.current !== "locations" &&
                  pathHistory?.last === "locations"
                }
              >
                <ul className="subMenu">
                  {/* <li>
                  <Link href="/locations/dashboard">
                    <a>Dashboard</a>
                  </Link>
                </li> */}
                  <li>
                    <Link href="/locations/veneusmanagement">
                      Venues Management
                    </Link>
                  </li>
                </ul>
              </PageNavigator>
            </li>
          );
        case CoworkModulesEnum.SERVICES:
          return (
            <li>
              <Link href="/services/dashboard">
                <Icomoon iconName="services" className="icon" />
                <span>Services</span>
              </Link>
              <PageNavigator
                height={135}
                isSidebarOpen={isOpen}
                opened={
                  pathHistory?.current === "services" &&
                  pathHistory?.last === "services"
                }
                open={
                  pathHistory?.current === "services" &&
                  pathHistory?.last !== "services"
                }
                close={
                  pathHistory?.current !== "services" &&
                  pathHistory?.last === "services"
                }
              >
                <ul className="subMenu">
                  <li>
                    <Link href="/services/virtual-office">Virtual Office</Link>
                  </li>
                  <li>
                    <Link href="/services/meeting-room">Meeting Room</Link>
                  </li>
                  <li>
                    <Link href="/services/open-desks">Open Desk</Link>
                  </li>
                  <li>
                    <Link href="/services/private-rooms">Private Room</Link>
                  </li>
                </ul>
              </PageNavigator>
            </li>
          );
        case CoworkModulesEnum.RELATIONSHIP:
          return (
            <li>
              <Link href="/relationship/dashboard">
                <Icomoon iconName="relationship" className="icon" />
                <span>Relationship</span>
              </Link>
              <PageNavigator
                height={175}
                isSidebarOpen={isOpen}
                opened={
                  pathHistory?.current === "relationship" &&
                  pathHistory?.last === "relationship"
                }
                open={
                  pathHistory?.current === "relationship" &&
                  pathHistory?.last !== "relationship"
                }
                close={
                  pathHistory?.current !== "relationship" &&
                  pathHistory?.last === "relationship"
                }
              >
                <ul className="subMenu">
                  {/* <li>
                    <Link href="/relationship/omnichat">
                      <a>Omnichat</a>
                    </Link>
                  </li> */}
                  <li>
                    <Link href="/relationship/agenda">
                      Bookings &amp; Agenda
                    </Link>
                  </li>
                  <li>
                    <Link href="/relationship/deals-and-opportunities">
                      Deals &amp; Opportunities
                    </Link>
                  </li>

                  <li
                    className="extraMenu"
                    onMouseEnter={() => setExtraMenuOpen("lead")}
                    onMouseLeave={() => setExtraMenuOpen(null)}
                  >
                    <Link href="/relationship/lead-management/personas-management">
                      Lead Management
                    </Link>
                    <Icomoon iconName="arrow-down" />
                    <SideMenuPopup
                      active={extraMenuOpen === "lead"}
                      navSize={2}
                      width={158}
                    >
                      <ExtraMenu
                        active={extraMenuOpen === "lead"}
                        onMouseLeave={() => setExtraMenuOpen(null)}
                      >
                        <li>
                          <Link href="/relationship/lead-management/personas-management">
                            Personas Management
                          </Link>
                        </li>
                        <li>
                          <Link href="/relationship/lead-management/pipeline">
                            Sales Pipeline
                          </Link>
                        </li>
                      </ExtraMenu>
                    </SideMenuPopup>
                  </li>
                  <li
                    className="extraMenu"
                    onMouseEnter={() => setExtraMenuOpen("client")}
                    onMouseLeave={() => setExtraMenuOpen(null)}
                  >
                    <Link href="/relationship/client-management">
                      Client Management
                    </Link>
                    <Icomoon iconName="arrow-down" />
                    <SideMenuPopup
                      navSize={3}
                      width={168}
                      active={extraMenuOpen === "client"}
                    >
                      <ExtraMenu
                        active={extraMenuOpen === "client"}
                        onMouseLeave={() => setExtraMenuOpen(null)}
                      >
                        <li>
                          <Link href="/relationship/client-management">
                            Customers Management
                          </Link>
                        </li>
                        <li>
                          <Link href="/relationship/client-management/contracts">
                            Contracts Follow Up
                          </Link>
                        </li>
                        <li>
                          <Link href="/relationship/client-management/mailbox">
                            Mailbox
                          </Link>
                        </li>
                      </ExtraMenu>
                    </SideMenuPopup>
                  </li>
                </ul>
              </PageNavigator>
            </li>
          );
        case CoworkModulesEnum.FINANCES:
          return (
            <li>
              <Link href="/finances/dashboard">
                <Icomoon iconName="finance" className="icon" />
                <span>Finances</span>
              </Link>
              <PageNavigator
                height={150}
                isSidebarOpen={isOpen}
                opened={
                  pathHistory?.current === "finances" &&
                  pathHistory?.last === "finances"
                }
                open={
                  pathHistory?.current === "finances" &&
                  pathHistory?.last !== "finances"
                }
                close={
                  pathHistory?.current !== "finances" &&
                  pathHistory?.last === "finances"
                }
              >
                <ul className="subMenu">
                  {/* <li>
                  <Link href="/finances/dashboard">
                    <a>Dashboard</a>
                  </Link>
                </li> */}
                  <li>
                    <Link href="/finances/invoices">Invoices</Link>
                  </li>
                  <li>
                    <Link href="/finances/banking">Banking</Link>
                  </li>
                  <li>
                    <Link href="/finances/taxes">Taxes &amp; Extra Fees</Link>
                  </li>
                  <li>
                    <Link href="/finances/commissions">
                      Commissions &amp; Payouts
                    </Link>
                  </li>
                </ul>
              </PageNavigator>
            </li>
          );
        case CoworkModulesEnum.REPORTS:
          return (
            <li>
              <Link href="/reports">
                <Icomoon iconName="analytics" className="icon" />
                <span>Reports</span>
              </Link>
            </li>
          );
        default:
          return <></>;
      }
    }
    return <></>;
  }
};
