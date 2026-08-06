import { NavbarLayout } from "@components/Layouts/NavbarLayout";
import Head from "next/head";
import React, { ReactElement } from "react";

const Client = () => {
  return (
    <>
      <Head>
        <title>My Membership | Workeaser</title>
      </Head>
    </>
  );
};

Client.authRoles = ["CLIENT", "COWORKING"];
Client.getLayout = (page: ReactElement) => {
  return <NavbarLayout>{page}</NavbarLayout>;
};

export default Client;
