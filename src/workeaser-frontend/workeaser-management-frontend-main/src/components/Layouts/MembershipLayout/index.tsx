import React, { ReactNode } from "react";
import { Banner } from "@components/Banner";
import styles from "./styles.module.scss";
import { useRouter } from "next/router";
import { MemberSidebar } from "@components/Client/MemberSidebar";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { MembershipResourceResponse } from "types/client";

interface MembershipLayoutProps {
  children: ReactNode;
}

export const MemberLayout: React.FC<MembershipLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { result: resource } = {} } =
    useFetch<MembershipResourceResponse>(
      id ? `/client/membership/${id}` : null
    );

  const imageUrl =
    resource?.photos.length > 0 && resource?.photos[0].file
      ? `${api.defaults.baseURL}/photos/${resource?.photos[0].file}`
      : `/images/workeaser-logo.png`;

  return (
    <div className={styles.wrapper}>
      <Banner
        coworkingName={resource?.name}
        coworkingAddress={
          resource?.address?.short_address || resource?.address.fulltext
        }
        coworkingPhoto={resource?.logo}
        imageUrl={imageUrl}
      />
      <div className={styles.container}>
        <MemberSidebar currentId={id as string} status={resource?.status} />
        <div>{children}</div>
      </div>
    </div>
  );
};
