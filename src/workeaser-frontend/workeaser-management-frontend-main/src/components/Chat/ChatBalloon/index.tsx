import React, { ReactNode } from "react";

import { ChatAvatar } from "../ChatAvatar";
import styles from "./styles.module.scss";
type User = {
  thumbnail: string;
  name: string;
};

interface ChatBalloonProps {
  user: User;
  children: ReactNode;
  messageFromUser: boolean;
}

export const ChatBalloon: React.FC<ChatBalloonProps> = ({
  user,
  children,
  messageFromUser,
}) => {
  return (
    <div className={styles.wrapper}>
      <div
        className={`
        ${styles.container}
        ${messageFromUser ? styles.right : ""}
        `}
      >
        <ChatAvatar url={user.thumbnail} alt="avatar" size={30} />
        <div
          className={`
        ${styles.content}
        ${messageFromUser ? styles.right : ""}
        `}
        >
          <span className={styles.text}>{children}</span>
        </div>
      </div>
      <p className={messageFromUser ? styles.right : ""}>Sent by {user.name}</p>
    </div>
  );
};
