import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { AddLead as AddLeadForm } from "@features/Forns/AddLead";
import { Content } from "@styles/pages/relationship/client-management/add";
import Head from "next/head";
import Link from "next/link";
import { PagesProps } from "pages/_app";
import { ReactElement } from "react";

const AddLead = () => {
  return (
    <>
      <Head>
        <title>Lead Management | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/relationship/dashboard">Relationship</Link>
          </h1>
          <h2>
            <Link href="/relationship/lead-management/personas-management">
              Lead Management
            </Link>
          </h2>
          <h2>New Lead</h2>
        </div>
      </PageHeader>

      <Content>
        <h1>Add New Lead</h1>

        <AddLeadForm />
      </Content>
    </>
  );
};

AddLead.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);
export default AddLead;
