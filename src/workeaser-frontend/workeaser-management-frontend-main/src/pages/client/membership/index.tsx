import { CoworkingCard } from "components/Coworking/CoworkingCard";
import { PageHeader } from "components/Headers/PageHeader";
import Head from "next/head";
import { ReactElement } from "react";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { PagesProps } from "pages/_app";
import styles from "./styles.module.scss";
import { useFetch } from "@hooks/useFetch";
import { Button } from "@components/Button";
import Link from "next/link";
import { MembershipResponse } from "types/client";
import { Fallback } from "types";
import { getAPIClient } from "@services/apiClient";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { Service } from "types/infos";
import { ServicesAbbrEnum } from "types/enums";
import { api } from "@services/api";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return {
      redirect: {
        destination: "/login?expired=true",
        permanent: false,
      },
    };
  }

  const apiClient = getAPIClient(context);

  const membershipsPromise =
    apiClient.get<MembershipResponse>("/client/membership");
  const servicesPromise = apiClient.get<{ result: Service[] }>(
    "/infos/services"
  );
  const [
    {
      data: { result: services },
    },
    { data: memberships },
  ] = await Promise.all([servicesPromise, membershipsPromise]);

  return {
    props: {
      fallback: {
        "/client/membership": memberships,
      },
      services,
    },
  };
};

interface MembershipProps {
  services: Service[];
  fallback: Fallback;
}
const Membership = ({ fallback, services }: MembershipProps) => {
  const {
    data: { result: memberships },
  } = useFetch<MembershipResponse>("/client/membership", {
    fallback: fallback ?? {},
  });

  const cards = memberships?.map((membership) => {
    const { address, city, state, country } = membership;
    const cardAddress = city ? `${city}, ${state}, ${country}` : address;
    return {
      id: membership.id,
      title: membership.location_name,
      subTitle: cardAddress,
      photo: membership.photos[0]
        ? `${api.defaults.baseURL}/photos/${membership.photos[0]}`
        : null,
      services: membership.services.map((service) => ServicesAbbrEnum[service]),
    };
  });

  const MembershipComponent = () => {
    if (memberships?.length === 0) {
      return <h3>You don&apos;t have any active service.</h3>;
    }
    return (
      <>
        {cards.map((card) => (
          <CoworkingCard
            key={card.id}
            coworking={card}
            services={services}
            onClickLink={`/client/membership/${card.id}/products-and-services`}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>My Membership | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>My Membership</h1>
          </div>

          <div>
            <Link href="/spaces">
              <Button text="Search Service" />
            </Link>
          </div>
        </PageHeader>

        <div className={styles.content}>
          <MembershipComponent />
        </div>
      </div>
    </>
  );
};

Membership.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <ClientLayout componentProps={componentProps}>{page}</ClientLayout>
);
export default Membership;
