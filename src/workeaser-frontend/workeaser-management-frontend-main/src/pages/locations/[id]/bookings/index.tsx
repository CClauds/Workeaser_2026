import { LocationHeader } from "@components/Headers/LocationHeader";
import { Layout } from "components/Layouts/Layout";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { LocationResponse } from "types/locations";
import { Button } from "@components/Button";
import { PageHeader } from "@components/Headers/PageHeader";
import styles from "../styles.module.scss";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};

const Bookings = ({}) => {
  const router = useRouter();
  const { id } = router.query;
  const { data: { result: { location: location } = {} } = {} } =
    useFetch<LocationResponse>(`/cowork/locations/${id}`);

  return (
    <>
      <Head>
        <title>Bookings | Workeaser</title>
      </Head>

      <Layout>
        <PageHeader>
          <div>
            <h1>
              <Link href="/locations/veneusmanagement">Locations</Link>
            </h1>
            <h2>Manage Location</h2>
            <h2>{location?.name}</h2>
          </div>

          <Link
            href={{
              pathname: `/locations/add`,
              query: { id: location?.id },
            }}
          >
            <Button text="Edit Location" color="secondary" />
          </Link>
        </PageHeader>

        <LocationHeader id={location?.id} />

        <div className={styles.content}>
          <p>Bookings</p>
        </div>
      </Layout>
    </>
  );
};

export default Bookings;
