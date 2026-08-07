import { Button } from "@components/Button";
import { ToggleButton } from "@components/Button/ToggleButton";
import { Menu } from "@components/DotsMenu/Menu";
import { ServicesOptions } from "@components/DotsMenu/ServicesOptions";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { AttachContract } from "@components/Modals/AttachContract";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
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
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { PrivateRoom, PrivateRoomsResponse } from "types/locations";

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

  const roomsPromise = apiClient.get<PrivateRoomsResponse>(
    "/cowork/rooms?page=1"
  );
  const roomsNextPagePromise = apiClient.get<PrivateRoomsResponse>(
    "/cowork/rooms?page=2"
  );
  const [{ data: rooms }, { data: roomsNextPage }] = await Promise.all([
    roomsPromise,
    roomsNextPagePromise,
  ]);

  return {
    props: {
      fallback: {
        "/cowork/rooms?page=1": rooms,
      },
      fallbackNextPage: {
        "/cowork/rooms?page=2": roomsNextPage,
      },
    },
  };
};

interface RoomsProps {
  fallback: Fallback;
  fallbackNextPage: Fallback;
}
const RoomsPage = ({ fallback, fallbackNextPage }: RoomsProps) => {
  const router = useRouter();

  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedService, setselectedService] = useState<
    PrivateRoom & { type: string }
  >();
  const [paginationState, setPaginationState] = useState({
    count: 1,
    index: 0,
    size: 10,
  });
  const [skipPageReset, setSkipPageReset] = useState(true);
  const [data, setData] = useState<PrivateRoom[]>();
  const [allData, setAllData] = useState<{ [key: string]: PrivateRoom[] }>();

  const {
    data: { result: rooms, pagination } = {},
    mutate,
    isValidating,
    error,
  } = useFetch<PrivateRoomsResponse>(
    `/cowork/rooms?page=${paginationState.count}`,
    {
      fallback,
    }
  );

  const {
    data: { result: roomsNextPage, pagination: { page: nextPage } = {} } = {},
  } = useFetch<PrivateRoomsResponse>(
    `/cowork/rooms?page=${paginationState.count + 1}`,
    {
      fallback: fallbackNextPage,
    }
  );

  const lastPage = Math.ceil(pagination?.total / paginationState.size);
  const hasMounted = useRef(true);

  useEffect(() => {
    if (hasMounted.current) {
      if (rooms) {
        setData(rooms.slice(0, 5));
      }
      hasMounted.current = false;
    }

    if (rooms) {
      setAllData({
        ...allData,
        [pagination.page]: rooms,
      });

      if (roomsNextPage) {
        const all = {
          ...allData,
          [pagination.page]: rooms,
          [nextPage]: roomsNextPage,
        };

        setAllData(all);
      }
    }
  }, [rooms, roomsNextPage]);

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
    const handleAttach = (id: number) => () => {
      const service = rooms?.find((service) => service.id === id);
      setselectedService({ ...service, type: "PRIVATE_ROOM" });
      setIsAttachModalOpen(true);
    };
    const handlePreview = (id: number) => {
      router.push({
        pathname: "/spaces/services/[id]",
        query: { id, serviceType: "PRIVATE_ROOM" },
      });
    };
    const handleEdit = (id: number) => {
      router.push({
        pathname: "/services/add/private-room",
        query: { id },
      });
    };
    const handleDelete = async (id: number) => {
      mutate(
        { result: rooms?.filter((room) => room.id !== id), pagination },
        false
      );
      await api.delete(`/cowork/rooms/${id}`);
      toast.success("Room Deleted");
      mutate();
    };
    const handleToggleVisibility =
      (id: number) => async (isActive: boolean) => {
        try {
          await api.post(`/cowork/rooms/${id}/changeavailability`, {
            searchable: isActive,
          });
          mutate();
          toast.success("Visiblity Changed");
        } catch (error) {
          console.log(error.response.data);
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
        Header: "Room Name & Location",
        accessor: "name",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell
              title={parsedValue[0]}
              subtitle={parsedValue[1]}
              style={{ paddingLeft: "10px" }}
            />
          );
        },
      },
      {
        Header: "Availability",
        accessor: "availability",
        className: "align__center",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <>
              <strong>
                {parsedValue[0] === "null" ? parsedValue[1] : parsedValue[0]}
              </strong>{" "}
              of <strong>{parsedValue[1]}</strong>
            </>
          );
        },
      },
      {
        Header: "Open Balances",
        accessor: "openBalances",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="yellow">
            {Money({ amount: value ?? 0 }).toFormat("$0,0.00")}
          </StatusContainer>
        ),
      },
      {
        Header: "Directory Visibility",
        accessor: "visibility",
        className: "align__center",
        disableSortBy: true,
        Cell: ({ value }) => (
          <ToggleButton
            initialValue={value.value}
            onToggle={handleToggleVisibility(value.id)}
          />
        ),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }: { value: { id: number; disabled: boolean } }) => (
          <Menu
            id={value.id}
            onGreenButtonClick={handlePreview}
            onYellowButtonClick={handleEdit}
            onRedButtonClick={handleDelete}
            extraOptions={
              <ServicesOptions
                id={value.id}
                onAttachClick={value.disabled ? null : handleAttach}
                onDetachClick={(id: number) => () => {}}
              />
            }
          />
        ),
      },
    ];
  }, [data, mutate, router]);

  const tableData = useMemo(
    () =>
      data?.filter(Boolean).map((room) => ({
        id: room.room_local_account_id,
        thumbnail: room.photo[0],
        name: `${room.name}&${room.location}`,
        availability: `${room.available - room.busy}&${room.available}`,
        openBalances: room.open_balance,
        visibility: {
          value: room.visibility ? true : false,
          id: room.id,
        },
        menu: { id: room.id, disabled: room.available - room.busy === 0 },
      })),
    [data]
  );

  // ── states: loading / error / empty / normal ──
  const isLoading = isValidating && rooms === undefined && data === undefined;
  const hasError = error && rooms === undefined && data === undefined;
  const isEmpty = !isValidating && !error && Array.isArray(rooms) && rooms.length === 0;

  if (isLoading) {
    return (
      <>
        <Head><title>Private Room | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Private Room</h2></div>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Loading private rooms…
        </div>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <Head><title>Private Room | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Private Room</h2></div>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
          You don&apos;t have access to this module or the server is unavailable.
        </div>
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        <Head><title>Private Room | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Private Room</h2></div>
          <Link href={`/services/add/private-room?pageCount=${paginationState.count}`}>
            <Button text="Add New Room" />
          </Link>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          No private rooms configured yet.
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Private Room | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/services/dashboard">Services</Link>
          </h1>
          <h2>Private Room</h2>
        </div>

        <Link
          href={`/services/add/private-room?pageCount=${paginationState.count}`}
        >
          <Button text="Add New Room" />
        </Link>
      </PageHeader>

      <div>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[7, 57, 11, 11, 11, 3]}
          pageCount={lastPage ?? 1}
          fetchData={handleFetchData}
          skipPageReset={skipPageReset}
        />
      </div>

      <AttachContract
        isOpen={isAttachModalOpen}
        onRequestClose={() => setIsAttachModalOpen(false)}
        initialService={selectedService}
      />
    </>
  );
};

export default RoomsPage;
RoomsPage.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
