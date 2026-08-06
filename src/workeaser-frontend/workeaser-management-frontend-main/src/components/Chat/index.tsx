import React from "react";

import styles from "./styles.module.scss";

interface ChatProps {}

export const Chat: React.FC<ChatProps> = () => {
  return <div className={styles.container}></div>;
};
