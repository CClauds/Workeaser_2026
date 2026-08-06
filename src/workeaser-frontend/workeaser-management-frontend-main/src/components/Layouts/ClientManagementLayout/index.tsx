import { ClientHeader } from "@components/Headers/ClientHeader";
import { PageHeader } from "@components/Headers/PageHeader";
import { PersonalCard } from "@components/PersonalCard";
import { useFetch } from "hooks/useFetch";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import { ClientInfoResponse } from "types/cowork/clients";
import { Container, Content } from "./styles";

interface ClientManagementLayoutProps {
  children: ReactNode;
}

export const ClientManagementLayout: React.FC<ClientManagementLayoutProps> = ({
  children,
}) => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { result: client } = {} } = useFetch<ClientInfoResponse>(
    id ? `/cowork/clients/${id}` : null
  );

  return (
    <>
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
          <h2>{`${client?.first_name} ${client?.middle_name} ${client?.last_name}`}</h2>
        </div>
      </PageHeader>

      <Container>
        <PersonalCard clientInfo={client} />
        <Content>
          <ClientHeader id={id as string} />
          {children}
        </Content>
      </Container>
    </>
  );
};
