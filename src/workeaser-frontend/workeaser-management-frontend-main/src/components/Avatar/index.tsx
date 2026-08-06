import React from "react";
import Image from "next/image";

import styles from "./styles.module.scss";
import { api } from "@services/api";

interface AvatarProps {
  url: string;
  alt: string;
  size: number;
  isActive?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ url, alt, size, isActive }) => {
  return (
    <figure
      className={`
        ${styles.container}
        ${
          isActive === undefined
            ? undefined
            : isActive
            ? styles.statusOn
            : styles.statusOff
        }
      `}
      style={{ height: size }}
    >
      <Image
        className={styles.avatar}
        src={`${api.defaults.baseURL}/photos/${url}`}
        alt={alt}
        width={size}
        height={size}
      />
    </figure>
  );
};
