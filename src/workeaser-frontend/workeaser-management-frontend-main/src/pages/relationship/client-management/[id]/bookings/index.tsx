import { BookingsOptions } from "@components/DotsMenu/BookingsOptions";
import { Menu } from "@components/DotsMenu/Menu";
import { ClientManagementLayout } from "@components/Layouts/ClientManagementLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
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
import { BookingDataResponse } from "types/cowork/clients";
import { BookingStatusEnum } from "types/enums";
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
      const { data: bookings } = await apiClient.get<BookingDataResponse>(
        `/cowork/clients/${id}/bookings`
      );

      return {
        props: {
          fallback: {
            [`/cowork/clients/${id}/bookings`]: bookings,
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

enum BookingType {
  MEETING_ROOM = "Meeting Room",
}

interface BookingProps {
  fallback: Fallback;
}
const Booking = ({ fallback }: BookingProps) => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { result: bookings } = {} } = useFetch<BookingDataResponse>(
    `/cowork/clients/${id}/bookings`,
    { fallback }
  );

  const columns = useMemo(() => {
    const handleView = (id: number, type: string) => () => {
      router.push(`/relationship/agenda/${id}?type=${type}`);
    };

    const handleApprove = async (id: number, type: string) => {
      let url: string;
      switch (type) {
        case "DAY_PASS":
          url = `/cowork/relationship/daypass/${id}/approve`;
          break;
        case "TOUR":
          url = `/cowork/relationship/tours/${id}/approve`;
          break;
        case "MEETING_ROOM":
        case "MEETING":
          url = `/cowork/meetrooms/book/${id}/approve`;
          break;
      }
      try {
        await api.post(url);
        toast.success("Booking approved");
      } catch (error) {
        toast.error(error.response.data.error.message);
        console.log(error.response.data);
      }
    };
    const handleReject = async (id: number, type: string) => {
      let url: string;
      switch (type) {
        case "DAY_PASS":
          url = `/cowork/relationship/daypass/${id}/reject`;
          break;
        case "TOUR":
          url = `/cowork/relationship/tours/${id}/reject`;
          break;
        case "MEETING_ROOM":
        case "MEETING":
          url = `/cowork/meetrooms/book/${id}/reject`;
          break;
      }
      try {
        await api.post(url);
        toast.error("Booking rejected");
      } catch (error) {
        toast.error(error.response.data.error.message);
        console.log(error.response.data);
      }
    };
    const handleNegotiate = (id: number, type: string) => {
      router.push("/relationship/omnichat");
    };

    return [
      {
        Header: "Service Type",
        accessor: "type",
        Cell: ({ value }) => <StatusContainer>{value}</StatusContainer>,
      },
      {
        Header: "Room Name",
        accessor: "name",
      },
      {
        Header: "Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer>{BookingStatusEnum[value]}</StatusContainer>
        ),
      },
      {
        Header: "Reservation Date",
        accessor: "date",
        className: "align__center",
        Cell: ({ value }) => formatDate(new Date(value)),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }) => (
          <Menu
            id={value.id}
            type={value.type}
            optionsType="lead"
            onGreenButtonClick={handleApprove}
            onYellowButtonClick={handleNegotiate}
            onRedButtonClick={handleReject}
            extraOptions={
              <BookingsOptions
                id={value.id}
                type={value.type}
                onViewClick={handleView}
              />
            }
          />
        ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () =>
      bookings?.map((book) => ({
        id: book.id,
        type: BookingType[book.type],
        name: book.name,
        status: book.status,
        date: book.date,
        menu: { id: book.id, type: book.type },
      })),
    [bookings]
  );

  return (
    <>
      <Head>
        <title>Booking | Workeaser</title>
      </Head>

      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[15, 52, 15, 15, 3]}
        />
      </div>
    </>
  );
};

Booking.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <ClientManagementLayout>{page}</ClientManagementLayout>
  </CoworkingLayout>
);
export default Booking;
