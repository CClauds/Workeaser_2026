import { OptionsButton } from "@components/Button/OptionsButton";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { Icomoon } from "@components/Icomoon";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
import { useFetch } from "@hooks/useFetch";
import { getAPIClient } from "@services/apiClient";
import { formatDate } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { useTheme } from "styled-components";
import { Fallback } from "types";
import { MailboxesResponse } from "types/cowork/clients";
import { ClientMailboxStatusEnum, MailboxStatusEnum } from "types/enums";
import styles from "./styles.module.scss";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const apiClient = getAPIClient(context);
  const { id } = context.query;

  const { data: mailboxes } = await apiClient.get<MailboxesResponse>(
    `/client/membership/${id}/mailbox`
  );

  return {
    props: {
      fallback: {
        [`/client/membership/${id}/mailbox`]: mailboxes,
      },
    },
  };
};

interface MailboxManagerProps {
  fallback: Fallback;
}
const MailboxManager = ({ fallback }: MailboxManagerProps) => {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();

  const { data: { result: mailboxes } = {} } = useFetch<MailboxesResponse>(
    `/client/membership/${id}/mailbox`,
    {
      fallback,
    }
  );

  const columns = useMemo(() => {
    const handleView = (deliveryId: number, handleClose: () => void) => {
      handleClose();
      router.push({
        pathname: "/client/membership/[id]/mailbox-manager/[deliveryId]",
        query: {
          id,
          deliveryId,
        },
      });
    };

    return [
      {
        Header: "Delivery ID",
        accessor: "id",
      },
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
        Cell: ({ value }: { value: { id: number } }) => (
          <MenuWrapper>
            {(handleClose) => (
              <OptionsButton
                onClick={() => handleView(value.id, handleClose)}
                icon={<Icomoon iconName="eye" color={theme.colors.blue800} />}
              >
                VIEW DELIVERY
              </OptionsButton>
            )}
          </MenuWrapper>
        ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () =>
      mailboxes?.map((mailbox) => ({
        id: mailbox.id,
        thumbnail: mailbox.photo,
        name: `${mailbox.name}&${mailbox.location}`,
        requestedAction: ClientMailboxStatusEnum[mailbox.action],
        status: MailboxStatusEnum[mailbox.status],
        receivedOn: mailbox.received,
        menu: { id: mailbox.id },
      })),
    [mailboxes]
  );

  return (
    <>
      <Head>
        <title>Mailbox Manager</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>Mailbox Manager</h1>
        <span className={styles.line}></span>
      </header>

      <div>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[10, 8, 40, 15, 15, 15, 2]}
        />
      </div>
    </>
  );
};

MailboxManager.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <ClientLayout componentProps={componentProps}>
    <MemberLayout>{page}</MemberLayout>
  </ClientLayout>
);
export default MailboxManager;
