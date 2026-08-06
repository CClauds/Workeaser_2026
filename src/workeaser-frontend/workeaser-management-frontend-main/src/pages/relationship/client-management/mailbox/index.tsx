import { Menu } from "@components/DotsMenu/Menu";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
import { getAPIClient } from "@services/apiClient";
import { formatDate } from "@utils/numberFormat";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { Fallback } from "types";

import { MailboxData, MailboxesResponse } from "types/cowork/relationship";
import { ClientMailboxStatusEnum, MailboxStatusEnum } from "types/enums";
import styles from "./styles.module.scss";

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

  const mailboxPromise = apiClient.get<MailboxesResponse>(
    "/cowork/relationship/mailbox?page=1"
  );
  const mailboxNextPagePromise = apiClient.get<MailboxesResponse>(
    "/cowork/relationship/mailbox?page=2"
  );
  const [{ data: mailbox }, { data: mailboxNextPage }] = await Promise.all([
    mailboxPromise,
    mailboxNextPagePromise,
  ]);

  return {
    props: {
      fallback: {
        "/cowork/relationship/mailbox?page=1": mailbox,
      },
      fallbackNextPage: {
        "/cowork/relationship/mailbox?page=2": mailboxNextPage,
      },
    },
  };
};

interface MailboxProps {
  fallback: Fallback;
  fallbackNextPage: Fallback;
}
const Mailbox = ({ fallback, fallbackNextPage }: MailboxProps) => {
  const router = useRouter();

  const [paginationState, setPaginationState] = useState({
    count: 1,
    index: 0,
    size: 10,
  });
  const [skipPageReset, setSkipPageReset] = useState(true);
  const [data, setData] = useState<MailboxData[]>();
  const [allData, setAllData] = useState<{ [key: string]: MailboxData[] }>();

  const { data: { result: mailbox, pagination } = {}, mutate } =
    useFetch<MailboxesResponse>(
      `/cowork/relationship/mailbox?page=${paginationState.count}`,
      { fallback }
    );

  const {
    data: { result: mailboxNextPage, pagination: { page: nextPage } = {} } = {},
  } = useFetch<MailboxesResponse>(
    `/cowork/relationship/mailbox?page=${paginationState.count + 1}`,
    {
      fallback: fallbackNextPage,
    }
  );

  const lastPage = Math.ceil(pagination?.total / paginationState.size);
  const hasMounted = useRef(true);

  useEffect(() => {
    if (hasMounted.current) {
      setData(mailbox.slice(0, 5));
      hasMounted.current = false;
    }

    console.log({ mailbox, mailboxNextPage });

    if (mailbox) {
      setAllData({
        ...allData,
        [pagination.page]: mailbox,
      });

      if (mailboxNextPage) {
        const all = {
          ...allData,
          [pagination.page]: mailbox,
          [nextPage]: mailboxNextPage,
        };

        setAllData(all);
      }
    }
  }, [mailbox, mailboxNextPage]);

  const handleFetchData = (currentIndex: number, pageSize: number) => {
    setPaginationState({
      ...paginationState,
      size: pageSize,
      index: currentIndex,
    });

    if (allData) {
      const startRow = pageSize * currentIndex;
      const endRow = startRow + pageSize;

      const flattenData = Object.values(allData).flat();
      setData(flattenData.slice(startRow, endRow));

      const isPrev = currentIndex < paginationState.index;
      const pageSizeRate = pagination?.perPage / pageSize;

      if (currentIndex + 1 < pageSizeRate * paginationState.count && isPrev) {
        const prevPage = paginationState.count - 1;
        if (prevPage > 0) {
          setPaginationState({
            size: pageSize,
            index: currentIndex,
            count: prevPage,
          });

          return;
        }
      }
      if (currentIndex + 1 > pageSizeRate * paginationState.count && !isPrev) {
        const nextPage = paginationState.count + 1;
        if (nextPage < pagination.lastPage) {
          setPaginationState({
            size: pageSize,
            index: currentIndex,
            count: nextPage,
          });
        }
      }
    }
  };

  const columns = useMemo(() => {
    const handleView = (id: number) => {
      router.push(`/relationship/client-management/mailbox/${id}`);
    };

    return [
      {
        Header: "",
        accessor: "thumbnail",
        disableSortBy: true,
        className: "align__center",
        Cell: ({ value }) => <Thumbnail url={value} alt="" size={50} />,
      },
      {
        Header: "Member Name & Company Name",
        accessor: "name",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Location Name & Address",
        accessor: "location",
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
          <Menu id={value} optionsType="view" onGreenButtonClick={handleView} />
        ),
      },
    ];
  }, [router]);

  const tableData = useMemo(
    () =>
      data?.map((mail) => ({
        thumbnail: mail.photos[0]?.file,
        name: `${mail?.location?.name}&${mail?.clientAccount?.company_name}`,
        requestedAction: ClientMailboxStatusEnum[mail.requested_action],
        status: MailboxStatusEnum[mail.status],
        location: `${mail?.location?.name}&${
          mail.location?.address?.short_address || "address not found"
        }`,
        receivedOn: mail.delivery_date,
        menu: mail.delivery_id.split("-")[1],
      })),
    [data]
  );

  return (
    <>
      <Head>
        <title>Mailbox | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Relationship</h1>
          <h2>Client Management</h2>
          <h2>Mailbox</h2>
        </div>
      </PageHeader>

      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[7, 29, 28, 11, 11, 11, 3]}
          pageCount={lastPage ?? 1}
          fetchData={handleFetchData}
          skipPageReset={skipPageReset}
        />
      </div>
    </>
  );
};

Mailbox.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default Mailbox;
