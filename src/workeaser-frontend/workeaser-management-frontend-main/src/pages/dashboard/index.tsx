import { Chart } from "@components/Chart";
import { ChartCard } from "@components/Chart/ChartCard";
import { ChartCardSummary } from "@components/Chart/ChartCardSummary";
import { DashboardCard } from "@components/Dashboard/DashboardCard";
import { Menu } from "@components/DotsMenu/Menu";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { getAPIClient } from "@services/apiClient";
import { formatDate, formatTime } from "@utils/numberFormat";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Router from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { DashboardData, Fallback } from "types";
import {
  ActivityTypeEmum,
  ClientMailboxStatusEnum,
  ServiceTypeEnum,
} from "types/enums";
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
    const { data } = await apiClient.get<DashboardData>("/cowork/dashboard");
    return {
      props: {
        fallback: {
          "/cowork/dashboard": data,
        },
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/login?error=true&status=" + error?.response?.status,
        permanent: false,
      },
    };
  }
};

interface DashboardProps {
  fallback: Fallback;
}
const Dashboard = ({ fallback }: DashboardProps) => {
  const { data: { result: dashboardData } = {} } = useFetch<DashboardData>(
    "/cowork/dashboard",
    { fallback }
  );

  const bookingsColumns = useMemo(
    () => [
      {
        Header: "Reservation Type",
        accessor: "reservationType",
        Cell: ({ value }) => (
          <StatusContainer bgColor="blue">
            {ServiceTypeEnum[value]}
          </StatusContainer>
        ),
      },
      {
        Header: "Unit / Room Name",
        accessor: "unitRoomName",
      },
      {
        Header: "Date & Time",
        accessor: "dateAndTime",
        className: "align__center",
        Cell: ({ value }) =>
          `${formatDate(new Date(value))} at ${formatTime(value)}`,
      },
      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }) => <Menu id={value} optionsType="view" />,
      },
    ],
    []
  );

  const membersColumns = useMemo(
    () => [
      {
        Header: "Activity Type",
        accessor: "activityType",
        Cell: ({ value }) => (
          <StatusContainer bgColor="blue">
            {ActivityTypeEmum[value]}
          </StatusContainer>
        ),
      },
      {
        Header: "Member Name",
        accessor: "memberName",
        minWidth: 200,
        width: 220,
      },
      {
        Header: "Priority / Request",
        accessor: "priorityRequest",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer>{ClientMailboxStatusEnum[value]}</StatusContainer>
        ),
      },
      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }) => <Menu id={value} optionsType="view" />,
      },
    ],
    []
  );

  const bookingsData = useMemo(
    () =>
      dashboardData?.upcoming_bookings.map((booking) => ({
        reservationType: booking.reservation_type,
        unitRoomName: booking.name,
        dateAndTime: booking.datetime,
        menu: booking.id,
      })),
    [dashboardData?.upcoming_bookings]
  );

  const membersData = useMemo(
    () =>
      dashboardData?.mailbox_requests.map((member) => ({
        activityType: member.activity_type,
        memberName: member.name,
        priorityRequest: member.request,
        menu: member.id,
      })),
    [dashboardData?.mailbox_requests]
  );

  return (
    <>
      <Head>
        <title>Painel | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.row}>
          <ChartCardSummary
            title="Active Locations"
            value={dashboardData?.active_locations}
            direction="column"
          />
          <ChartCardSummary
            title="Open Opportunities"
            value={dashboardData?.open_opportunities}
            direction="column"
          />
          <ChartCardSummary
            title="Active Members"
            value={dashboardData?.active_members}
            direction="column"
          />
          <ChartCardSummary
            title="Receivable Income"
            value={dashboardData?.receivable_income}
            direction="column"
            type="currency"
          />
        </div>

        <div className={styles.row}>
          <ChartCard>
            <h3>Total Occupancy</h3>
            <Chart
              type="gauge"
              option={{
                series: [
                  {
                    data: [
                      {
                        value: dashboardData?.total_occupancy,
                      },
                    ],
                  },
                  {
                    data: [
                      {
                        value: dashboardData?.total_occupancy,
                      },
                    ],
                  },
                ],
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Sales Pipeline Funnel</h3>
            <Chart
              type="funnel"
              option={{
                series: [
                  {
                    name: "Sales Pipeline",
                    data: [
                      {
                        name: "Oppotunity",
                        value: dashboardData.sales_pipeline.opportunity,
                      },
                      {
                        name: "Contacted",
                        value: dashboardData.sales_pipeline.contacted,
                      },
                      {
                        name: "Requested",
                        value: dashboardData.sales_pipeline.requested,
                      },
                      {
                        name: "Quoted",
                        value: dashboardData.sales_pipeline.quoted,
                      },
                      {
                        name: "Converted",
                        value: dashboardData.sales_pipeline.converted,
                      },
                    ],
                  },
                ],
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Clients per Product Category</h3>
            <Chart
              type="pie"
              option={{
                series: [{ name: "Category" }],
                dataset: {
                  source: [
                    {
                      value: dashboardData?.clients_per_category.virtual_office,
                      name: "Virtual Office",
                    },
                    {
                      value: dashboardData?.clients_per_category.meeting_room,
                      name: "Metting Room",
                    },
                    {
                      value: dashboardData?.clients_per_category.open_desk,
                      name: "Open Desk",
                    },
                    {
                      value: dashboardData?.clients_per_category.private_room,
                      name: "Private Room",
                    },
                  ],
                },
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Invoices per Status</h3>
            <Chart
              type="pie"
              option={{
                series: [{ name: "Status" }],
                dataset: {
                  source: [
                    {
                      value: dashboardData?.invoice_per_status.fully_paid,
                      name: "Paid in Full",
                    },
                    {
                      value: dashboardData?.invoice_per_status.open,
                      name: "Open",
                    },

                    {
                      value: dashboardData?.invoice_per_status.fully_refunded,
                      name: "Fully Refunded",
                    },
                    {
                      value: dashboardData?.invoice_per_status.partly_refunded,
                      name: "Partially Refunded",
                    },
                    {
                      value: dashboardData?.invoice_per_status.overdue,
                      name: "Overdue",
                    },
                  ],
                },
              }}
            />
          </ChartCard>
        </div>

        <div className={styles.row}>
          <DashboardCard title="Upcoming Bookings, Day Passes and Tours">
            <StyledTable
              columns={bookingsColumns}
              data={bookingsData}
              columnsWidth={[25, 43, 30, 2]}
              theme="gray"
            />
          </DashboardCard>
          <DashboardCard title="Member Support and Mailbox Requests">
            <StyledTable
              columns={membersColumns}
              data={membersData}
              columnsWidth={[25, 51, 22, 2]}
              theme="gray"
            />
          </DashboardCard>
        </div>
      </div>
    </>
  );
};

Dashboard.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default Dashboard;
