import { SelectComponent } from "@components/FormElements/Select";
import { PageHeader } from "@components/Headers/PageHeader";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { DayPass } from "@components/SingleBooking/Daypass";
import { Meetroom } from "@components/SingleBooking/Meetroom";
import { Tour } from "@components/SingleBooking/Tour";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import {
  Container,
  TopRow,
} from "@styles/pages/relationship/agenda/single-booking/styles";
import { Row } from "@styles/reusable";
import { formatDateNew, formatTime } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement } from "react";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import { BookMeetroom } from "types";
import {
  DayPass as DayPassType,
  Tour as TourType,
} from "types/cowork/relationship";
import { BookingsStatusColorEnum, BookingStatusEnum } from "types/enums";
import { OptionType } from "types/form";
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

  const { id, bookingId } = context.params;
  const { type } = context.query;

  let url: string;

  switch (type) {
    case "DAYPASS":
      url = `/client/daypass/${bookingId}`;
      break;
    case "TOUR":
      url = `/client/tours/${bookingId}`;
      break;
    case "MEETING":
      url = `/client/meeting/${bookingId}`;
      break;
  }

  const {
    data: { result: eventResponse },
  } = await apiClient.get(url);

  return {
    props: {
      event: { ...eventResponse, type },
      id,
      bookingId,
    },
  };
};

type BookingType = "TOUR" | "DAYPASS" | "MEETING";

interface SingleBookingProps {
  id: number;
  bookingId: number;
  event: TourType & DayPassType & BookMeetroom & { type: BookingType };
}
const SingleBooking = ({ id, bookingId, event }: SingleBookingProps) => {
  const theme = useTheme();
  const router = useRouter();

  const BookingComponent = () => {
    if (event.type === "TOUR") {
      return <Tour event={event as TourType} />;
    }
    if (event.type === "DAYPASS") {
      return <DayPass event={event as DayPassType} />;
    }
    if (event.type === "MEETING") {
      return <Meetroom event={event as BookMeetroom} />;
    }
    return null;
  };

  const handleAction = async (option: OptionType) => {
    switch (option.value) {
      case "CANCEL":
        try {
          await api.post(`/client/meeting/${bookingId}/cancel`);
          router.push(`client/membership/${id}/booking-schedule`);
          toast.success("Booking canceled.");
        } catch (error) {
          if (error?.response.data) {
            const { error: apiError } = error.response.data;
            toast.error(apiError.message);
          }
        }
        break;
    }
  };

  return (
    <>
      <Head>
        <title>Bookings | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>
              <Link href={`/client/membership/${id}/booking-schedule`}>
                Booking Schedule
              </Link>
            </h1>
            <h2>Booking #{event.id}</h2>
          </div>

          <div>
            <SelectComponent
              placeHolder="Command Action"
              width={200}
              backgroundColor={theme.colors.darkGray}
              onChange={handleAction}
              options={[
                {
                  value: "CANCEL",
                  label: "Cancel Booking",
                },
              ]}
            />
          </div>
        </PageHeader>

        <Container>
          <TopRow>
            <Row gap={15}>
              <Row gap={10} bordered>
                <p>Booking Date:</p>
                <time>{formatDateNew(event.date_start)} </time>
                <p>from</p>
                <time>{formatTime(event.date_start)}</time>
                <p>to</p>
                <time>{formatTime(event.date_end)}</time>
              </Row>
            </Row>

            <StatusContainer bgColor={BookingsStatusColorEnum[event.status]}>
              {BookingStatusEnum[event.status]}
            </StatusContainer>
          </TopRow>
          <BookingComponent />
        </Container>
      </div>
    </>
  );
};

SingleBooking.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <ClientLayout componentProps={componentProps}>
      <MemberLayout>{page}</MemberLayout>
    </ClientLayout>
  );
};
export default SingleBooking;
