import Head from "next/head";
import React from "react";
import { CoworkingCard } from "components/Coworking/CoworkingCard";
import { PageHeader } from "components/Headers/PageHeader";
import { Layout } from "components/Layouts/Layout";

import styles from "./styles.module.scss";

const membershipServices = [
  {
    id: 1,
    services: [
      {
        id: "sd",
        label: "string",
        active: true,
      },
      {
        id: "ed",
        label: "string",
        active: true,
      },
      {
        id: "mr",
        label: "string",
        active: true,
      },
      {
        id: "es",
        label: "string",
        active: true,
      },
      {
        id: "po",
        label: "Private Office",
        active: true,
      },
    ],
  },
  {
    id: 2,
    services: [
      {
        id: "sd",
        label: "string",
        active: false,
      },
      {
        id: "ed",
        label: "string",
        active: true,
      },
      {
        id: "mr",
        label: "string",
        active: false,
      },
      {
        id: "es",
        label: "string",
        active: true,
      },
      {
        id: "po",
        label: "Private Office",
        active: false,
      },
    ],
  },
  {
    id: 3,
    services: [
      {
        id: "sd",
        label: "string",
        active: true,
      },
      {
        id: "ed",
        label: "string",
        active: true,
      },
      {
        id: "mr",
        label: "string",
        active: false,
      },
      {
        id: "es",
        label: "string",
        active: false,
      },
      {
        id: "po",
        label: "Private Office",
        active: false,
      },
    ],
  },
];

const Membership: React.FC = () => {
  return (
    <>
      <Head>
        <title>My Membership | Workeaser</title>
      </Head>

      <Layout sidebarDisabled>
        <PageHeader>
          <h1>My Membership</h1>
        </PageHeader>
        <div className={styles.container}>
          {/* {membershipServices.map((coworking) => (
            <CoworkingCard key={coworking.id} coworking={coworking} />
          ))} */}
        </div>
      </Layout>
    </>
  );
};

export default Membership;
