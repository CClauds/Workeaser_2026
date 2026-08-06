import { Button } from "@components/Button";
import { EmptyArrayResponse } from "@components/EmptyArrayResponse";
import { Menu } from "@components/DotsMenu/Menu";
import { ServicesOptions } from "@components/DotsMenu/ServicesOptions";
import { FilterButton } from "@components/Filters/FilterButton";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { AttachContract } from "@components/Modals/AttachContract";
import { DetachContract } from "@components/Modals/DetachContract";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { ServicesRow } from "@components/Table/Row/ServicesRow";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
import { ClientFiltersComponent } from "@features/Filters/ClientFilters";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import Money from "dinero.js";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { Client, ClientsResponse } from "types/cowork/clients";
import { InvoiceStatusColorEnum, InvoiceStatusEnum } from "types/enums";
import { Service } from "types/infos";
import styles from "./styles.module.scss";
import { AuthContext } from "@contexts/AuthContext";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";

import { useTheme } from "styled-components";
import { CustomersMenu } from "@features/TableMenus/CustomersMenu";
import { format as formatDate } from "date-fns";
import { Chat, MessagesResponse } from "../omnichat/types";

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

  try {
    const clientsPromise = apiClient.get<ClientsResponse>("/cowork/clients");
    const servicesPromise = apiClient.get("/infos/services");

    const [{ data: clients }, { data: services }] = await Promise.all([
      clientsPromise,
      servicesPromise,
    ]);

    return {
      props: {
        services: services.result,
        fallback: {
          "/cowork/clients": clients,
        },
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      props: {
        error: error.response.data,
        services: [],
        fallback: {},
      },
    };
  }
};

export interface ClientFilters {
  searchTerm: string;
  dueDateFrom: string;
  dueDateTo: string;
  OPEN_DESK: 0 | 1;
  VIRTUAL_OFFICE: 0 | 1;
  PRIVATE_ROOM: 0 | 1;
  MEETING_ROOM: 0 | 1;
  balanceOpen: 0 | 1;
  balancePartiallyPaid: 0 | 1;
  balanceFullyPaid: 0 | 1;
  balanceOverdue: 0 | 1;
}

interface ClientsManagementProps {
  services: Service[];
  fallback: Fallback;
}
const ClientsManagement = ({ services, fallback }: ClientsManagementProps) => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isDetachModalOpen, setIsDetachModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [filters, setFilters] = useState<ClientFilters>({
    searchTerm: "",
    dueDateFrom: "",
    dueDateTo: "",
    OPEN_DESK: null,
    VIRTUAL_OFFICE: null,
    PRIVATE_ROOM: null,
    MEETING_ROOM: null,
    balanceOpen: null,
    balancePartiallyPaid: null,
    balanceFullyPaid: null,
    balanceOverdue: null,
  });

  const {
    data: { result: clients } = {},
    mutate,
    isLoading,
  } = useFetch<ClientsResponse>(formatUrl(filters), {
    fallback,
  });

  const columns = useMemo(() => {
    const handleViewClick = (id: string) => {
      router.push(`/relationship/client-management/${id}/overview`);
    };

    const handleChatClick = async (clientAccountId: number) => {
      const { data } = await api.post<MessagesResponse<Chat>>("/cowork/chats", {
        client_account_id: clientAccountId,
      });

      router.push({
        pathname: "/relationship/omnichat",
        query: { chatId: data.result.uuid },
      });
    };

    const handleAttach = (id: string) => {
      const client = clients?.find((client) => client.uuid === id);
      setSelectedClient(client);
      setIsAttachModalOpen(true);
    };
    const handleDetach = (id: string) => {
      const client = clients?.find((client) => client.uuid === id);
      setSelectedClient(client);
      setIsDetachModalOpen(true);
    };
    const handleEdit = (id: string) => {
      router.push({
        pathname: "/relationship/client-management/edit",
        query: { id },
      });
    };
    const handleDelete = async (id: string) => {
      mutate(
        { result: clients?.filter((client) => client.uuid !== id) },
        false
      );
      await api.delete(`/cowork/clients/${id}`);
      toast.success("Client deleted.");
      mutate();
    };

    return [
      {
        Header: "",
        accessor: "thumbnail",
        className: "align__center",
        disableSortBy: true,
        Cell: ({ value }) => <Thumbnail url={value} alt="" size={50} />,
      },
      {
        Header: "Member & Company Name",
        accessor: "name",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Email & Phone",
        accessor: "emailAndPhone",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Contracted Services",
        accessor: "services",
        Cell: ({ value }) => (
          <ServicesRow services={services} selectedServices={value} />
        ),
      },
      {
        Header: "Balances Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor={InvoiceStatusColorEnum[value]}>
            {InvoiceStatusEnum[value]}
          </StatusContainer>
        ),
      },
      {
        Header: "Open Balance",
        accessor: "open_balance",
        className: "align__center",
        Cell: ({ value }) => Money({ amount: value || 0 }).toFormat("$0,0.00"),
      },
      {
        Header: "Next Due Date",
        accessor: "dueDate",
        className: "align__center",
        Cell: ({ value }) =>
          value ? formatDate(new Date(value), "MM/dd/yyyy") : "",
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({
          value,
        }: {
          value: { id: string; clientAccountId: number };
        }) => {
          const { id, clientAccountId } = value;
          return (
            <MenuWrapper>
              {(handleClose) => (
                <CustomersMenu
                  onChatClick={() => handleChatClick(clientAccountId)}
                  onAttachClick={() => handleAttach(id)}
                  onDetachClick={() => handleDetach(id)}
                  onViewClick={() => handleViewClick(id)}
                  onEditClick={() => handleEdit(id)}
                  onDeleteClick={() => handleDelete(id)}
                  onRequestClose={handleClose}
                />
              )}
            </MenuWrapper>
          );
        },
        // Cell: ({ value }) => (
        //   <Menu
        //     id={value}
        //     onGreenButtonClick={handleViewClick}
        //     onRedButtonClick={handleDelete}
        //     optionsType="view"
        //     extraOptions={
        //       <ServicesOptions
        //         id={value}
        //         onChatClick={handleChatClick}
        //         onAttachClick={handleAttach}
        //         onDetachClick={handleDetach}
        //         type="CUSTOMER"
        //       />
        //     }
        //   />
        // ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () =>
      clients?.map((client) => ({
        thumbnail: client.photo?.file,
        name: `${client.first_name} ${client.last_name}&${
          client.clientAccount?.company_name ?? ""
        }`,
        emailAndPhone: `${client.email}&${client.personal_phone}`,
        services: formatServicesArray(client.contracted_services, services),
        status: client.balance_status,
        open_balance: client.open_balance,
        dueDate: client.next_due_date,
        menu: { id: client.uuid, clientAccountId: client?.clientAccount.id },
      })),
    [clients]
  );

  return (
    <>
      <Head>
        <title>Gestão de Clientes | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/relationship/dashboard">Dashboard</Link>
          </h1>
          <h2>Client Management</h2>
        </div>

        <div className={styles.headerButtonsContainer}>
          <FilterButton buttonText="Search &amp; Filters" theme="secondary">
            <ClientFiltersComponent filters={filters} setFilters={setFilters} />
          </FilterButton>

          <Link href="/relationship/client-management/add">
            <Button text="Adicionar Cliente" />
          </Link>
          {/* HF-SPRINT-L-04: link rapido pra CSV import quando precisar subir batch */}
          <Link href="/relationship/client-management/import">
            <Button text="Importar CSV" theme="secondary" />
          </Link>
        </div>
      </PageHeader>

      <div className={styles.tableContainer}>
        {/* HF-SPRINT-L-04: empty state com CTA proativo. Sem dado + sem loading = mostra
            EmptyArrayResponse com 2 CTAs (criar 1 OR importar batch). Senao, tabela. */}
        {!isLoading && (!tableData || tableData.length === 0) ? (
          <EmptyArrayResponse
            item="clients"
            icon="👥"
            title="Nenhum cliente cadastrado ainda"
            description="Adicione clientes individualmente OU importe uma planilha CSV com até 500 contas de uma vez."
            ctaLabel="Adicionar primeiro cliente →"
            ctaHref="/relationship/client-management/add"
          />
        ) : (
          <StyledTable
            columns={columns}
            data={tableData ?? []}
            loading={isLoading}
            columnsWidth={[7, 22, 24, 11, 11, 11, 11, 3]}
          />
        )}
      </div>

      <AttachContract
        isOpen={isAttachModalOpen}
        onRequestClose={() => setIsAttachModalOpen(false)}
        initialClient={selectedClient}
      />
      <DetachContract
        isOpen={isDetachModalOpen}
        onRequestClose={() => setIsDetachModalOpen(false)}
        initialClient={selectedClient}
      />
    </>
  );
};

ClientsManagement.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>;

export default ClientsManagement;

const formatServicesArray = (
  contractedservices: string[],
  services: Service[]
) =>
  contractedservices?.map((item) => ({
    id: services.find((service) => service.slug === item).id,
  }));

const formatUrl = (filters: ClientFilters) => {
  let url = `/cowork/clients?general_query=${filters.searchTerm}`;
  if (filters.dueDateFrom) {
    url += `&due_date_start=${filters.dueDateFrom}`;
  }
  if (filters.dueDateTo) {
    url += `&due_date_end=${filters.dueDateTo}`;
  }
  if (filters.VIRTUAL_OFFICE) {
    url += `&contr_virtual_office=${filters.VIRTUAL_OFFICE}`;
  }
  if (filters.OPEN_DESK) {
    url += `&contr_shared_desk=${filters.OPEN_DESK}`;
    url += `&contr_exclusive_desk=${filters.OPEN_DESK}`;
  }
  if (filters.PRIVATE_ROOM) {
    url += `&contr_shared_office=${filters.PRIVATE_ROOM}`;
    url += `&contr_exclusive_office=${filters.PRIVATE_ROOM}`;
  }
  if (filters.MEETING_ROOM) {
    url += `&contr_meeting_room=${filters.MEETING_ROOM}`;
  }
  if (filters.balanceOpen) {
    url += `&bl_status_open=${filters.balanceOpen}`;
  }
  if (filters.balanceFullyPaid) {
    url += `&bl_status_fully_paid=${filters.balanceFullyPaid}`;
  }
  if (filters.balancePartiallyPaid) {
    url += `&bl_status_partially_paid=${filters.balancePartiallyPaid}`;
  }
  if (filters.balanceOverdue) {
    url += `&bl_status_overdue=${filters.balanceOverdue}`;
  }
  return url;
};
