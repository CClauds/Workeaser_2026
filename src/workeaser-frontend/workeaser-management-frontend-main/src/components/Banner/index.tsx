import React from "react";
import Image from "next/legacy/image";
import styles from "./styles.module.scss";
import { api } from "@services/api";

interface BannerProps {
  imageUrl: string;
  coworkingName: string;
  coworkingAddress: string;
  coworkingPhoto: string;
}

export const Banner: React.FC<BannerProps> = ({
  imageUrl,
  coworkingName,
  coworkingAddress,
  coworkingPhoto,
}) => {
  return (
    <figure className={styles.container}>
      <div className={styles.filter}></div>
      <Image src={imageUrl} alt="banner" layout="fill" objectFit="cover" />
      <figcaption>
        <Image
          src={
            coworkingPhoto
              ? `${api.defaults.baseURL}/photos/${coworkingPhoto}`
              : "/images/workeaser-circle.png"
          }
          width={65}
          height={65}
          alt="logo"
          objectFit="cover"
        />
        <h1>{coworkingName}</h1>
        <h2>{coworkingAddress}</h2>
      </figcaption>
    </figure>
  );
};
