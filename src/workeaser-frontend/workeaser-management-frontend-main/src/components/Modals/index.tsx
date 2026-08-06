import React, { useCallback } from "react";
import { AttachContract } from "./AttachContract";
import { BookMeeting } from "./BookMeeting";
import { DayPass } from "./DayPass";
import { DetachContract } from "./DetachContract";
import { MailboxReceipt } from "./MailboxReceipt";
import { NewCostumer } from "./NewCostumer";
import { NewInvoice } from "./NewInvoice";
import { NewLead } from "./NewLead";
import { NewTour } from "./NewTour/index";
import { SupportTicket } from "./SupportTicket";

interface QuickactionsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  modal: string;
}

export const QuickactionsModal: React.FC<QuickactionsModalProps> = ({
  isOpen,
  onRequestClose,
  modal,
}) => {
  const ModalContent = useCallback(() => {
    switch (modal) {
      case "bookMeeting":
        return <BookMeeting isOpen={isOpen} onRequestClose={onRequestClose} />;
      case "bookTour":
        return <NewTour isOpen={isOpen} onRequestClose={onRequestClose} />;
      case "bookDayPass":
        return <DayPass isOpen={isOpen} onRequestClose={onRequestClose} />;
      case "mailboxReceipt":
        return (
          <MailboxReceipt isOpen={isOpen} onRequestClose={onRequestClose} />
        );
      case "newCostumer":
        return <NewCostumer isOpen={isOpen} onRequestClose={onRequestClose} />;
      case "newLead":
        return <NewLead isOpen={isOpen} onRequestClose={onRequestClose} />;
      case "newIvoice":
        return <NewInvoice isOpen={isOpen} onRequestClose={onRequestClose} />;
      case "ticket":
        return (
          <SupportTicket isOpen={isOpen} onRequestClose={onRequestClose} />
        );
      case "attachContract":
        return (
          <AttachContract isOpen={isOpen} onRequestClose={onRequestClose} />
        );
      case "detachContract":
        return (
          <DetachContract isOpen={isOpen} onRequestClose={onRequestClose} />
        );
      default:
        return <></>;
    }
  }, [modal, isOpen]);

  return <ModalContent />;
};
