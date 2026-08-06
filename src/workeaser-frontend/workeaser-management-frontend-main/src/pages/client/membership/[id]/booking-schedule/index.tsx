import { OptionsButton } from "@components/Button/OptionsButton";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { Icomoon } from "@components/Icomoon";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
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
import { useTheme } from "styled-components";
import { Fallback } from "types";
import { BookingDataResponse } from "types/cowork/clients";
import { BookingStatusEnum, ServiceTypeEnum } from "types/enums";
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

  const { data: bookings } = await apiClient.get<BookingDataResponse>(
    `/client/membership/${id}/bookings`
  );

  return {
    props: {
      fallback: {
        [`/client/membership/${id}/bookings`]: bookings,
      },
    },
  };
};

interface BookingScheduleProps {
  fallback: Fallback;
}
const BookingSchedule = ({ fallback }: BookingScheduleProps) => {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();

  const { data: { result: bookings } = {}, mutate } =
    useFetch<BookingDataResponse>(`/client/membership/${id}/bookings`, {
      fallback,
    });

  const columns = useMemo(() => {
    const handleView = (bookingId: number, handleClose: () => void) => {
      handleClose();
      router.push({
        pathname: "/client/membership/[id]/booking-schedule/[bookingId]",
        query: {
          id,
          bookingId,
          type: "MEETING",
        },
      });
    };
    const cancelBoking = async (bookingId: number, handleClose: () => void) => {
      handleClose();
      try {
        await api.post(`/client/meeting/${bookingId}/cancel`);
        mutate();
        toast.success("Booking canceled.");
      } catch (error) {
        if (error?.response.data) {
          const { error: apiError } = error.response.data;
          toast.error(apiError.message);
        }
      }
    };
    return [
      {
        Header: "Reservation ID",
        accessor: "id",
      },
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
        Cell: ({ value }: { value: { id: number } }) => (
          <MenuWrapper>
            {(handleClose) => (
              <>
                <OptionsButton
                  onClick={() => handleView(value.id, handleClose)}
                  icon={<Icomoon iconName="eye" color={theme.colors.blue800} />}
                >
                  VIEW BOOKING
                </OptionsButton>
                <OptionsButton
                  onClick={() => cancelBoking(value.id, handleClose)}
                  icon={
                    <Icomoon iconName="trash" color={theme.colors.blue800} />
                  }
                >
                  CANCEL BOOKING
                </OptionsButton>
              </>
            )}
          </MenuWrapper>
        ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () =>
      bookings?.map((book) => ({
        id: book.id,
        type: ServiceTypeEnum[book.type],
        name: book.name,
        status: book.status,
        date: book.date,
        menu: { id: book.id },
      })),
    [bookings]
  );

  return (
    <>
      <Head>
        <title>Booking Schedule</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>Booking Schedule</h1>
        <span className={styles.line}></span>
      </header>

      <div>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[12, 15, 30, 10, 20, 2]}
        />
      </div>
    </>
  );
};

BookingSchedule.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => (
  <ClientLayout componentProps={componentProps}>
    <MemberLayout>{page}</MemberLayout>
  </ClientLayout>
);
export default BookingSchedule;
