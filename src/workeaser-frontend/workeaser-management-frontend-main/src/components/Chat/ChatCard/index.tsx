import React from "react";
import { ChatAvatar } from "../ChatAvatar";

import styles from "./styles.module.scss";

interface ChatCardProps {
  name: string;
  avatar: string;
  onChatClick: () => void;
  isActive?: boolean;
}
export const ChatCard: React.FC<ChatCardProps> = ({
  name,
  avatar,
  onChatClick,
  isActive = false,
}) => {
  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ""}`}
      onClick={() => onChatClick()}
    >
      <ChatAvatar
        url={avatar ?? ""}
        alt="client photo"
        size={40}
        // isActive={true}
      />

      <div className={styles.infos}>
        <h2>{name}</h2>
        <h3></h3>
      </div>

      <div className={styles.messageStatus}>
        {/* <span></span>
        <time></time> */}
      </div>
    </div>
  );
};
