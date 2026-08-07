import { Button } from "@components/Button";
import { OptionsButton } from "@components/Button/OptionsButton";
import { ToggleButton } from "@components/Button/ToggleButton";
import { Menu } from "@components/DotsMenu/Menu";
import { PageHeader } from "@components/Headers/PageHeader";
import { Icomoon } from "@components/Icomoon";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { BookMeeting } from "@components/Modals/BookMeeting";
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
import { useTheme } from "styled-components";
import { Fallback } from "types";
import { MeetingRoomType } from "types/cowork/locations/enum";
import { MeetRoom, MeetRoomsResponse } from "types/locations";

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

  const meetingRoomsPromise = apiClient.get<MeetRoomsResponse>(
    "/cowork/meetrooms?page=1"
  );
  const meetingRoomsNextPagePromise = apiClient.get<MeetRoomsResponse>(
    "/cowork/meetrooms?page=2"
  );
  const [{ data: meetingRooms }, { data: meetingRoomsNextPage }] =
    await Promise.all([meetingRoomsPromise, meetingRoomsNextPagePromise]);

  return {
    props: {
      fallback: {
        "/cowork/meetrooms?page=1": meetingRooms,
      },
      fallbackNextPage: {
        "/cowork/meetrooms?page=2": meetingRoomsNextPage,
      },
    },
  };
};

interface MeetingRoomProps {
  fallback: Fallback;
  fallbackNextPage: Fallback;
}
const MeetingRoom = ({ fallback, fallbackNextPage }: MeetingRoomProps) => {
  const theme = useTheme();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<MeetRoom>();

  const [paginationState, setPaginationState] = useState({
    count: 1,
    index: 0,
    size: 10,
  });
  const [skipPageReset, setSkipPageReset] = useState(true);
  const [data, setData] = useState<MeetRoom[]>();
  const [allData, setAllData] = useState<{ [key: string]: MeetRoom[] }>();

  const {
    data: { result: meetingRooms, pagination } = {},
    mutate,
    isValidating,
    error,
  } = useFetch<MeetRoomsResponse>(
    `/cowork/meetrooms?page=${paginationState.count}`,
    { fallback }
  );

  const {
    data: {
      result: meetingRoomsNextPage,
      pagination: { page: nextPage } = {},
    } = {},
  } = useFetch<MeetRoomsResponse>(
    `/cowork/meetrooms?page=${paginationState.count + 1}`,
    {
      fallback: fallbackNextPage,
    }
  );

  const lastPage = Math.ceil(pagination?.total / paginationState.size);
  const hasMounted = useRef(true);

  useEffect(() => {
    if (hasMounted.current) {
      if (meetingRooms) {
        setData(meetingRooms.slice(0, 5));
      }
      hasMounted.current = false;
    }

    if (meetingRooms) {
      setAllData({
        ...allData,
        [pagination.page]: meetingRooms,
      });

      if (meetingRoomsNextPage) {
        const all = {
          ...allData,
          [pagination.page]: meetingRooms,
          [nextPage]: meetingRoomsNextPage,
        };

        setAllData(all);
      }
    }
  }, [meetingRooms, meetingRoomsNextPage]);

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
    const handleEdit = (id: number) => {
      router.push({
        pathname: "/services/add/meeting-room",
        query: { id },
      });
    };
    const handlePreview = (id: number) => {
      router.push({
        pathname: "/spaces/services/[id]",
        query: { id, serviceType: "MEETING_ROOM" },
      });
    };
    const handleDelete = async (id: number) => {
      mutate(
        {
          result: meetingRooms?.filter((meetingRoom) => meetingRoom.id !== id),
          pagination,
        },
        false
      );
      await api.delete(`/cowork/meetrooms/${id}`);
      toast.success("Meeting Room Deleted");
      mutate();
    };
    const handleBookMeeting = (id: number) => {
      const meetroom = meetingRooms?.find((service) => service.id === id);
      setSelectedId(meetroom);
      setIsModalOpen(true);
    };

    const handleToggleVisibility =
      (id: number) => async (isActive: boolean) => {
        try {
          await api.post(`/cowork/meetrooms/${id}/changeavailability`, {
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
        Header: "Room Category",
        accessor: "category",
        className: "align__center",
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
        Cell: ({ value }: { value: number }) => (
          <Menu
            id={value}
            onGreenButtonClick={handlePreview}
            onYellowButtonClick={handleEdit}
            onRedButtonClick={handleDelete}
            extraOptions={
              <OptionsButton
                onClick={() => handleBookMeeting(value)}
                icon={
                  <Icomoon iconName="calendar" color={theme.colors.blue800} />
                }
              >
                BOOK A MEETING
              </OptionsButton>
            }
          />
        ),
      },
    ];
  }, [data, mutate, router]);

  const tableData = useMemo(
    () =>
      data?.map((meetingRoom) => ({
        thumbnail: meetingRoom.photos[0],
        name: `${meetingRoom.name}&${meetingRoom.location}`,
        category: MeetingRoomType[meetingRoom.category],
        openBalances: meetingRoom.open_balance,
        visibility: {
          value: meetingRoom.visibility ? true : false,
          id: meetingRoom.id,
        },
        menu: meetingRoom.id,
      })),
    [data]
  );

  // ── states: loading / error / empty / normal ──
  const isLoading = isValidating && meetingRooms === undefined && data === undefined;
  const hasError = error && meetingRooms === undefined && data === undefined;
  const isEmpty =
    !isValidating && !error && Array.isArray(meetingRooms) && meetingRooms.length === 0;

  if (isLoading) {
    return (
      <>
        <Head><title>Meeting Room | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Meeting Room</h2></div>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Loading meeting rooms…
        </div>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <Head><title>Meeting Room | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Meeting Room</h2></div>
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
        <Head><title>Meeting Room | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Meeting Room</h2></div>
          <Link href={`/services/add/meeting-room?pageCount=${paginationState.count}`}>
            <Button text="Add New Room" />
          </Link>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          No meeting rooms configured yet.
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Meeting Room | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/services/dashboard">Services</Link>
          </h1>
          <h2>Meeting Room</h2>
        </div>

        <Link
          href={`/services/add/meeting-room?pageCount=${paginationState.count}`}
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

      <BookMeeting
        initialValue={selectedId}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

MeetingRoom.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default MeetingRoom;
