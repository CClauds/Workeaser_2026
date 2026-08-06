import React from "react";
import Image from "next/legacy/image";

import styles from "./styles.module.scss";
import { api } from "@services/api";

interface ChatAvatarProps {
  url: string;
  alt: string;
  size: number;
  isActive?: boolean;
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  url,
  alt,
  size,
  isActive,
}) => {
  return (
    <figure
      className={`
        ${styles.container}
        ${
          isActive === undefined
            ? ""
            : isActive
            ? styles.statusOn
            : styles.statusOff
        }
      `}
      style={{ height: size }}
    >
      {url ? (
        <Image
          src={
            url.charAt(0) === "/"
              ? url
              : `${api.defaults.baseURL}/photos/${url}`
          }
          alt={alt}
          width={size}
          height={size}
          objectFit="cover"
        />
      ) : (
        <div
          className={styles.imagePreview}
          style={{ width: size, height: size }}
        />
      )}
    </figure>
  );
};
