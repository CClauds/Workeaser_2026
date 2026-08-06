import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DayPass } from "@components/SingleBooking/Daypass";
import { Meetroom } from "@components/SingleBooking/Meetroom";
import { Tour } from "@components/SingleBooking/Tour";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { getAPIClient } from "@services/apiClient";
import {
  Container,
  TopRow,
} from "@styles/pages/relationship/agenda/single-booking/styles";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement } from "react";
import { Tour as TourType } from "types/cowork/relationship";
import { DayPass as DayPassType } from "types/cowork/relationship";
import { BookingsStatusColorEnum, BookingStatusEnum } from "types/enums";
import { BookMeetroom } from "types";
import { Row } from "@styles/reusable";
import { formatDateNew, formatTime } from "@utils/numberFormat";

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

  const { id } = context.params;
  const { type } = context.query;

  let url: string;

  switch (type) {
    case "DAYPASS":
      url = `/cowork/relationship/daypass/${id}`;
      break;
    case "TOUR":
      url = `/cowork/relationship/tours/${id}`;
      break;
    case "MEETING_ROOM":
    case "MEETING":
      url = `/cowork/meetrooms/book/${id}`;
      break;
  }

  const {
    data: { result: eventResponse },
  } = await apiClient.get(url);

  return {
    props: {
      event: { ...eventResponse, type },
    },
  };
};

type BookingType = "TOUR" | "DAYPASS" | "MEETING" | "MEETING_ROOM";

enum BookingTypeEnum {
  DAYPASS = "Day Pass",
  MEETING = "Meeting Room",
  MEETING_ROOM = "Meeting Room",
  TOUR = "Tour",
}

interface SingleBookingProps {
  event: TourType & DayPassType & BookMeetroom & { type: BookingType };
}
const SingleBooking = ({ event }: SingleBookingProps) => {
  const BookingComponent = () => {
    if (event.type === "TOUR") {
      return <Tour event={event as TourType} />;
    }
    if (event.type === "DAYPASS") {
      return <DayPass event={event as DayPassType} />;
    }
    if (event.type === "MEETING" || event.type === "MEETING_ROOM") {
      return <Meetroom event={event as BookMeetroom} />;
    }
    return null;
  };

  const RenderTopRow = () => {
    if (event.type === "MEETING" || event.type === "MEETING_ROOM") {
      return (
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
      );
    }
    return null;
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
          <h2>
            <Link href="/relationship/agenda">Bookings &amp; Agenda</Link>
          </h2>
          <h2>Booking #{event.id}</h2>
        </div>

        <div></div>
      </PageHeader>

      <Container>
        <header>
          <h1>
            {BookingTypeEnum[event.type]} ID: #{event.id}
          </h1>
        </header>

        <RenderTopRow />

        <BookingComponent />
      </Container>
    </>
  );
};

export default SingleBooking;
SingleBooking.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
