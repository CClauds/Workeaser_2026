import Money from "dinero.js";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { ServicesAbbr } from "types/client";
import { Service } from "types/infos";
import { CardServices } from "../CardServices";
import styles from "./styles.module.scss";

interface CardProps {
  title: string;
  subTitle: string;
  photo: string;
  services: ServicesAbbr[];
  type?: string;
  priceType?: string;
  price?: number;
  available?: number;
  qty_persons?: number;
  measure_size?: number;
}

enum PriceType {
  MONTH = "month",
  YEAR = "year",
  HOUR = "hour",
}

interface CoworkingCardProps {
  services: Service[];
  coworking: CardProps;
  onClickLink: string;
  isActive?: boolean;
}
export const CoworkingCard: React.FC<CoworkingCardProps> = ({
  coworking,
  services,
  onClickLink,
  isActive,
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      cardRef.current.scrollIntoView({ block: "start" });
    }
  }, [isActive]);

  const RenderImage = () => {
    if (coworking.photo) {
      return (
        <Image
          src={coworking.photo}
          alt="coworking thumb"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
        />
      );
    }

    return (
      <div className={styles.no__image}>
        <p>No image</p>
      </div>
    );
  };

  const RenderPrice = () => {
    if (!coworking.price) {
      return null;
    }

    return (
      <div>
        <p className={styles.price}>
          {Money({ amount: coworking.price }).toFormat("$0,0.00")}/
          {PriceType[coworking.priceType]}
        </p>
      </div>
    );
  };

  const RenderRibbon = () => {
    if (coworking.type === "OPEN_DESK") {
      return (
        <div className={styles.ribbon}>
          <span>{coworking.available} available</span>
        </div>
      );
    }
    if (
      coworking.type === "MEETING_ROOM" ||
      coworking.type === "PRIVATE_ROOM"
    ) {
      return (
        <div className={styles.ribbon}>
          <span>Fits {coworking.qty_persons} People</span>
          <span>{coworking.measure_size} Sq Ft</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.container} ${isActive ? styles.active : ""}`}
    >
      <Link href={onClickLink} passHref legacyBehavior>
        <figure>
          <RenderImage />
          <figcaption>
            <RenderRibbon />
            <div className={styles.servicesContainer}>
              <CardServices
                services={services}
                contractedServices={coworking.services}
              />
            </div>
          </figcaption>
        </figure>
      </Link>
      <div className={`${styles.infos} ${isActive ? styles.active : ""}`}>
        <div>
          <h1 title={coworking.title}>{coworking.title}</h1>
          <h2 title={coworking.subTitle}>{coworking.subTitle}</h2>
        </div>
        <RenderPrice />
      </div>
    </div>
  );
};
