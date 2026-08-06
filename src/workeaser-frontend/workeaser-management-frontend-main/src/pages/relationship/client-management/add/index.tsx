import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { Content } from "@styles/pages/relationship/client-management/add";
import { PostUserForm } from "@features/PostUserForm";
import Head from "next/head";
import Link from "next/link";
import { PagesProps } from "pages/_app";
import { ReactElement } from "react";

const AddClient = () => {
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
            <Link href="/relationship/client-management">
              Client Management
            </Link>
          </h2>
          <h2>New Client</h2>
        </div>
      </PageHeader>

      <Content>
        <h1>Add New Client</h1>

        <PostUserForm />
      </Content>
    </>
  );
};

AddClient.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);
export default AddClient;
