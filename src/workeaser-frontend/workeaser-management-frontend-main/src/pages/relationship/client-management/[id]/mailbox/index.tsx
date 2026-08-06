import { Menu } from "@components/DotsMenu/Menu";
import { ClientManagementLayout } from "@components/Layouts/ClientManagementLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { formatDate } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { MailboxesResponse } from "types/cowork/clients";
import { MailboxStatusEnum } from "types/cowork/locations/enum";
import { ClientMailboxStatusEnum } from "types/enums";
import styles from "../styles.module.scss";

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
  const { id } = context.query;

  if (id) {
    try {
      const { data: mailboxes } = await apiClient.get<MailboxesResponse>(
        `/cowork/clients/${id}/mailbox`
      );

      return {
        props: {
          fallback: {
            [`/cowork/clients/${id}/mailbox`]: mailboxes,
          },
        },
      };
    } catch (error) {
      return {
        props: {
          error: error.response.data,
          fallback: {},
        },
      };
    }
  }

  return {
    props: {
      fallback: {},
    },
  };
};

interface MailboxProps {
  fallback: Fallback;
}
const Mailbox = ({ fallback }: MailboxProps) => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { result: mailboxes } = {} } = useFetch<MailboxesResponse>(
    `/cowork/clients/${id}/mailbox`,
    { fallback }
  );

  const columns = useMemo(() => {
    const handleView = (id: number) => {
      router.push(`/relationship/client-management/mailbox/${id}`);
    };
    const handleDelete = async (id: number) => {
      try {
        await api.delete(``);
        toast.error("Delivery deleted.");
      } catch (error) {
        console.log({ error });
      }
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
        Header: "Member Name & Location",
        accessor: "name",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Requested Action",
        accessor: "requestedAction",
        className: "align__center",
      },
      {
        Header: "Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }) => <StatusContainer>{value}</StatusContainer>,
      },
      {
        Header: "Received On",
        accessor: "receivedOn",
        className: "align__center",
        Cell: ({ value }) => formatDate(new Date(value)),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }) => (
          <Menu id={value} onGreenButtonClick={handleView} optionsType="view" />
        ),
      },
    ];
  }, [router]);

  const tableData = useMemo(
    () =>
      mailboxes?.map((mailbox) => ({
        id: mailbox.id,
        thumbnail: mailbox.photo,
        name: `${mailbox.name}&${mailbox.location}`,
        requestedAction: ClientMailboxStatusEnum[mailbox.action],
        status: MailboxStatusEnum[mailbox.status],
        receivedOn: mailbox.received,
        menu: mailbox.id,
      })),
    [mailboxes]
  );

  return (
    <>
      <Head>
        <title>Mailbox | Workeaser</title>
      </Head>

      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[7, 45, 15, 15, 15, 3]}
        />
      </div>
    </>
  );
};

Mailbox.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <ClientManagementLayout>{page}</ClientManagementLayout>
  </CoworkingLayout>
);
export default Mailbox;
