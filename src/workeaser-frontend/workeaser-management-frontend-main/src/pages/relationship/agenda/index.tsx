import { NavigationButton } from "@components/Button/NavigationButton";
import { Calendar } from "@components/Calendar";
import { BookingsOptions } from "@components/DotsMenu/BookingsOptions";
import { Menu } from "@components/DotsMenu/Menu";
import { SelectComponent } from "@components/FormElements/Select";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { BookMeeting } from "@components/Modals/BookMeeting";
import { DayPass } from "@components/Modals/DayPass";
import { NewTour } from "@components/Modals/NewTour";
import { ViewBookingModal } from "@components/Modals/ViewBookingModal";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { DatesSetArg, EventClickArg } from "@fullcalendar/react";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { formatDateExtendMonth, formatTime } from "@utils/numberFormat";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ThemeContext } from "styled-components";
import { OptionType } from "types";
import {
  BookingsData,
  BookingsResponse,
  GenericBooking,
  ScheduleData,
  ScheduleResponse,
} from "types/cowork/relationship";
import { BookingTypeEnum } from "types/cowork/relationship/enums";
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
  try {
    const bookingsPromise = apiClient.get<BookingsResponse>(
      "/cowork/relationship/bookings/unapproved"
    );
    const schedulePromise = apiClient.get<ScheduleResponse>(
      "/cowork/relationship/bookings/scheduled"
    );
    const [{ data: bookings }, { data: schedule }] = await Promise.all([
      bookingsPromise,
      schedulePromise,
    ]);

    return {
      props: {
        fallbackBookings: {
          "/cowork/relationship/bookings/unapproved": bookings,
        },
        fallbackSchedule: {
          "/cowork/relationship/bookings/scheduled": schedule,
        },
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        error: error.response.data,
        fallbackBookings: {},
        fallbackSchedule: {},
      },
    };
  }
};

enum BookingStatus {
  SOLICITED = "Solicited",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

type ActionModalType = "meet" | "tour" | "pass";

interface AgendaProps {
  fallbackBookings: BookingsData[];
  fallbackSchedule: ScheduleData[];
}
const Agenda = ({ fallbackBookings, fallbackSchedule }: AgendaProps) => {
  const themeContext = useContext(ThemeContext);
  const router = useRouter();

  const [activeLink, setActiveLink] = useState(
    "Unapproved Bookings".replace(/ /g, "")
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState<ActionModalType>();
  const [modalType, setModalType] = useState<"agenda" | "schedule">("agenda");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState<GenericBooking>();
  const [scheduleDate, setScheduleDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const { data: { result: bookings } = {}, mutate: bookingsMutate } =
    useFetch<BookingsResponse>("/cowork/relationship/bookings/unapproved", {
      fallback: fallbackBookings,
    });
  const { data: { result: schedule } = {}, mutate: scheduleMutate } =
    useFetch<ScheduleResponse>(
      `/cowork/relationship/bookings/scheduled?month=${scheduleDate.month}&year=${scheduleDate.year}`,
      {
        fallback: fallbackSchedule,
      }
    );

  const formatScheduleDate = (date: string) => {
    return date.replace(/\+00:00$/, "");
  };

  useEffect(() => {
    setEvents(
      schedule?.map((item) => ({
        id: String(item.id),
        title: `${BookingTypeEnum[item.type]}: ${item?.user?.first_name} ${
          item?.company_name ? `/ ${item.company_name}` : ""
        }`,
        start: formatScheduleDate(item.date_start),
        end: formatScheduleDate(item.date_end),
        color: themeContext.colors.chartGreen,
        extendedProps: item,
      }))
    );
  }, [schedule]);

  const handleTabClick = (button: string) => () => {
    setActiveLink(button.replace(/ /g, ""));
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
      bookingsMutate();
      scheduleMutate();
      toast.success("Booking approved");
    } catch (error) {
      toast.error(error.response.data.error.message);
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
      bookingsMutate();
      scheduleMutate();
      toast.error("Booking rejected");
    } catch (error) {
      toast.error(error.response.data.error.message);
      console.log(error.response.data);
    }
  };
  const handleNegotiate = (id: number, type: string) => {
    router.push("/relationship/omnichat");
  };

  const columns = useMemo(() => {
    const handleView = (id: number, type: string) => () => {
      setModalType("agenda");
      const event = bookings.find((booking) => booking.id === id);
      setSelectedEvent({
        id: event.id,
        type: event.booking_type,
        user_name: event.user_name,
        user_email: event.user_email,
        location_name: event.location_name,
        start_date: event.start_date,
        end_date: event.end_date,
        resource_name: event.resource_name,
      });
      setIsModalOpen(true);
    };

    return [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Type",
        accessor: "type",
        className: "align__center",
        Cell: ({ value }) => <StatusContainer>{value}</StatusContainer>,
      },
      {
        Header: "Requestor Information",
        accessor: "requestorInformation",
        Cell: ({ value }) => {
          const parsedValue = value?.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Room & Location",
        accessor: "location",
        Cell: ({ value }) => {
          const parsedValue = value?.split("&");
          return (
            <DoublelineCell
              title={parsedValue ? parsedValue[0] : ""}
              subtitle={parsedValue ? parsedValue[1] : ""}
            />
          );
        },
      },
      {
        Header: "Start Date & Time",
        accessor: "startDate",
        Cell: ({ value }) => {
          const parsedValue = value?.split("&");
          return (
            <DoublelineCell
              title={formatDateExtendMonth(parsedValue[0])}
              subtitle={formatTime(parsedValue[1])}
            />
          );
        },
      },
      {
        Header: "End Date & Time",
        accessor: "endDate",
        Cell: ({ value }) => {
          const parsedValue = value?.split("&");
          return (
            <DoublelineCell
              title={formatDateExtendMonth(parsedValue[0])}
              subtitle={formatTime(parsedValue[1])}
            />
          );
        },
      },
      {
        Header: "Booking Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }) => <StatusContainer>{value}</StatusContainer>,
      },
      {
        Header: "Potential Earnings",
        accessor: "potentialEarnings",
        className: "align__center",
        Cell: ({ value }: { value: number | string }) => (
          <StatusContainer bgColor="green">
            {Money({ amount: Number(value) ?? 0 }).toFormat("$0,0.00")}
          </StatusContainer>
        ),
      },
      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }: { value: { id: number; type: string } }) => (
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
      bookings?.map((booking) => ({
        id: booking.id,
        type: BookingTypeEnum[booking.booking_type],
        requestorInformation: `${booking.user_name}&${booking.user_email}`,
        location: booking.location_name,
        startDate: `${booking.start_date}&${booking.start_date}`,
        endDate: `${booking.end_date}&${booking.end_date}`,
        status: BookingStatus[booking.status],
        potentialEarnings: booking.potential_earnings,
        menu: { id: booking.id, type: booking.booking_type },
      })),

    [bookings]
  );

  const handleEventClick = (event: EventClickArg) => {
    setModalType("schedule");

    const currentEvent = event.event.extendedProps as ScheduleData;
    setSelectedEvent({
      id: currentEvent.id,
      type:
        currentEvent.type === "MEETING" ? "MEETING_ROOM" : currentEvent.type,
      user_name: `${currentEvent.user.first_name} ${currentEvent.user.last_name}`,
      user_email: currentEvent.user.email,
      location_name: currentEvent.location_name,
      start_date: currentEvent.date_start,
      end_date: currentEvent.date_end,
    });
    setIsModalOpen(true);
  };

  const handleDateChange = (event: DatesSetArg) => {
    setScheduleDate({
      year: event.start.getFullYear(),
      month: event.start.getMonth() + 1,
    });
  };

  const handleAction = (option: OptionType) => {
    setActionModalType(option.value as ActionModalType);
    setIsActionModalOpen(true);
  };

  const ActionModal = () => {
    switch (actionModalType) {
      case "meet":
        return (
          <BookMeeting
            isOpen={isActionModalOpen}
            onRequestClose={() => setIsActionModalOpen(false)}
          />
        );
      case "tour":
        return (
          <NewTour
            isOpen={isActionModalOpen}
            onRequestClose={() => setIsActionModalOpen(false)}
          />
        );
      case "pass":
        return (
          <DayPass
            isOpen={isActionModalOpen}
            onRequestClose={() => setIsActionModalOpen(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Bookings &amp; Agenda | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/relationship/dashboard">Relationship</Link>
          </h1>
          <h2>Bookings &amp; Agenda</h2>
        </div>

        <div className={styles.headerButtonsContainer}>
          <NavigationButton
            buttonTexts={["Unapproved Bookings", "Scheduled Agenda"]}
            activeButton={activeLink}
            callback={handleTabClick}
          />

          <SelectComponent
            placeHolder="Command Action"
            width={200}
            backgroundColor={themeContext.colors.darkGray}
            onChange={handleAction}
            options={[
              { value: "meet", label: "Book a Meeting" },
              { value: "pass", label: "Book a Day Pass" },
              // { value: "tour", label: "Book a Tour" },
            ]}
          />
        </div>
      </PageHeader>

      <div className={styles.contentContainer}>
        <div
          className={`${styles.tab} ${
            activeLink === "UnapprovedBookings" ? styles.visible : styles.hidden
          }`}
        >
          <StyledTable
            columns={columns}
            data={tableData ?? []}
            columnsWidth={[3, 7, 20, 22, 13, 11, 8, 14, 2]}
          />
        </div>

        <div
          className={`${styles.tab} ${
            activeLink === "ScheduledAgenda" ? styles.visible : styles.hidden
          }`}
        >
          <Calendar
            events={events}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              omitZeroMinute: false,
              meridiem: "short",
            }}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              omitZeroMinute: false,
              meridiem: "short",
            }}
            showNonCurrentDates={false}
            eventClick={handleEventClick}
            datesSet={handleDateChange}
          />
        </div>
      </div>

      {selectedEvent ? (
        <ViewBookingModal
          type={modalType}
          event={selectedEvent}
          onApproveClick={handleApprove}
          onNegotiateClick={handleNegotiate}
          onRejectClick={handleReject}
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
        />
      ) : null}

      <ActionModal />
    </>
  );
};

export default Agenda;
Agenda.getLayout = (page: ReactElement, componentsProps: PagesProps) => (
  <CoworkingLayout componentProps={componentsProps}>{page}</CoworkingLayout>
);
