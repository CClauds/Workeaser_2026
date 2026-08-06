import { Icomoon } from "@components/Icomoon";
import { QuickactionsModal } from "@components/Modals";
import { getLeadFeatureFlagEnv } from "@services/map";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";

interface QuickactionsMenuProps {
  isOpen: boolean;
  isSidebarOpen: boolean;
  onRequestClose: () => void;
  onMouseClick: (e: MouseEvent) => void;
}
export const QuickactionsMenu: React.FC<QuickactionsMenuProps> = ({
  isOpen,
  isSidebarOpen,
  onRequestClose,
  onMouseClick,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const LeadFeatureFlag = getLeadFeatureFlagEnv();

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        onMouseClick(e);
      }
    };

    document.addEventListener("mouseup", checkIfClickedOutside);
    return () => document.removeEventListener("mouseup", checkIfClickedOutside);
  }, [isMenuOpen, onMouseClick]);

  useEffect(() => {
    setIsMenuOpen(isOpen);
  }, [isOpen]);

  const handleModalOpen = (modalName: string) => {
    setModalContent(modalName);
    setIsModalOpen(true);
    onRequestClose();
  };

  return (
    <>
      <div
        ref={menuRef}
        className={`
        ${styles.wrapper} 
        ${isMenuOpen ? styles.open : undefined}
        ${isSidebarOpen ? styles.sidebarOpen : undefined}
      `}
      >
        <div
          className={`${styles.container} ${
            isMenuOpen ? styles.open : undefined
          }`}
        >
          <div>
            <header>
              <Icomoon iconName="star" />
              <h1>Spaces &amp; Services</h1>
            </header>
            <ul>
              <li onClick={() => handleModalOpen("bookMeeting")}>
                BOOK A MEETING
              </li>
              {/* <li onClick={() => handleModalOpen("bookTour")}>BOOK TOUR</li> */}
              <li onClick={() => handleModalOpen("bookDayPass")}>
                BOOK A DAY PASS
              </li>
              <li onClick={() => handleModalOpen("mailboxReceipt")}>
                MAILBOX RECEIPT
              </li>
            </ul>
          </div>
          <div>
            <header>
              <Icomoon iconName="relationship" />
              <h1>Lead &amp; Clients</h1>
            </header>
            <ul>
              <li onClick={() => handleModalOpen("newCostumer")}>
                new customer
              </li>

              {/* <li onClick={() => handleModalOpen("newLead")}>new lead</li> */}

              <li onClick={() => handleModalOpen("newIvoice")}>
                create invoice
              </li>
              {/* <li onClick={() => handleModalOpen("ticket")}>client support</li> */}
            </ul>
          </div>
          <div>
            <header>
              <Icomoon iconName="file" />
              <h1>Attachments &amp; Others</h1>
            </header>
            <ul>
              <li onClick={() => handleModalOpen("attachContract")}>
                attach contract
              </li>
              <li onClick={() => handleModalOpen("detachContract")}>
                detach contract
              </li>
            </ul>
          </div>
        </div>
      </div>

      <QuickactionsModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        modal={modalContent}
      />
    </>
  );
};
