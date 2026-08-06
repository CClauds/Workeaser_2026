import React, { ButtonHTMLAttributes } from "react";

import { Icomoon } from "../../Icomoon";

import styles from "./styles.module.scss";

interface ChatButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  label,
  icon,
  ...props
}) => {
  return (
    <button className={styles.container} {...props}>
      <Icomoon iconName={icon} />
      <p>{label}</p>
    </button>
  );
};
