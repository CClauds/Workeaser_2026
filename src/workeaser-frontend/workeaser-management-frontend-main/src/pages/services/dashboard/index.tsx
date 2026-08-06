import { Chart } from "@components/Chart";
import { ChartCard } from "@components/Chart/ChartCard";
import { DashboardCard } from "@components/Dashboard/DashboardCard";
import { Menu } from "@components/DotsMenu/Menu";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { getAPIClient } from "@services/apiClient";
import { formatDate, formatTime } from "@utils/numberFormat";
import { EChartsOption } from "echarts";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { Fallback, ServiceDashboardData } from "types";
import { RenewalActionEnum, ServiceTypeEnum } from "types/enums";
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

  const { data } = await apiClient.get<ServiceDashboardData>(
    "/cowork/dashboard/services"
  );

  return {
    props: {
      fallback: {
        "/cowork/dashboard/services": data,
      },
    },
  };
};

interface ServicesDashboardProps {
  fallback: Fallback;
}
const ServicesDashboard = ({ fallback }: ServicesDashboardProps) => {
  const { data: { result: dashboardData } = {} } =
    useFetch<ServiceDashboardData>("/cowork/dashboard/services", { fallback });

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
  const renewalsColumns = useMemo(
    () => [
      {
        Header: "Member Name",
        accessor: "memberName",
        Cell: ({ value }) => (
          <StatusContainer bgColor="blue">{value}</StatusContainer>
        ),
      },
      {
        Header: "Upcoming Action",
        accessor: "upcomingAction",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer>{RenewalActionEnum[value]}</StatusContainer>
        ),
      },
      {
        Header: "Action Date",
        accessor: "actionDate",
        className: "align__center",
        Cell: ({ value }) => formatDate(new Date(value)),
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
  const renewalsData = useMemo(
    () =>
      dashboardData?.upcoming_renewals.map((item) => ({
        memberName: item.name,
        upcomingAction: item.action,
        actionDate: item.date,
        menu: item.id,
      })),
    [dashboardData?.upcoming_renewals]
  );

  return (
    <>
      <Head>
        <title>Dashboard | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Services</h1>
          <h2>Dashboard</h2>
        </div>
      </PageHeader>

      <div className={styles.container}>
        <div className={styles.row}>
          <ChartCard>
            <h3>Clients per Product Category</h3>
            <Chart
              type="pie"
              option={{
                color: ["#43AA8B", "#277DA1", "#f9c74f", "#F3722C", "#f94144"],
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
                    { value: 0, name: "Others" },
                  ],
                },
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Virtual Office Plans</h3>
            <Chart
              type="pie"
              option={{
                color: ["#90be6d", "#f9c74f", "#F3722C", "#277DA1", "#f94144"],
                series: [{ name: "Plans" }],
                dataset: {
                  source: [
                    {
                      value: dashboardData?.virtual_office_plans.fully_paid,
                      name: "Paid in Full",
                    },
                    { value: 0, name: "Open" },
                    {
                      value: dashboardData?.virtual_office_plans.partly_paid,
                      name: "Partially Paid",
                    },
                    {
                      value:
                        dashboardData?.virtual_office_plans.partly_refunded,
                      name: "Partially Refunded",
                    },
                    {
                      value: dashboardData?.virtual_office_plans.overdue,
                      name: "Overdue",
                    },
                  ],
                },
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Desk Occupancy</h3>
            <Chart
              type="gauge"
              option={{
                series: [
                  {
                    data: [
                      {
                        value: dashboardData?.desk_occupancy,
                      },
                    ],
                  },
                  {
                    data: [
                      {
                        value: dashboardData?.desk_occupancy,
                      },
                    ],
                  },
                ],
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Private Rooms Occupancy</h3>
            <Chart
              type="gauge"
              option={{
                series: [
                  {
                    data: [
                      {
                        value: dashboardData?.private_rooms_occupancy,
                      },
                    ],
                  },
                  {
                    data: [
                      {
                        value: dashboardData?.private_rooms_occupancy,
                      },
                    ],
                  },
                ],
              }}
            />
          </ChartCard>
        </div>

        <div className={styles.row}>
          <DashboardCard title="Upcoming Bookings, Day Passes and Tours">
            <StyledTable
              columns={bookingsColumns}
              data={bookingsData}
              columnsWidth={[25, 50, 23, 2]}
              theme="gray"
            />
          </DashboardCard>
          <DashboardCard title="Upcoming Renewals & Cancelations">
            <StyledTable
              columns={renewalsColumns}
              data={renewalsData}
              columnsWidth={[50, 25, 23, 2]}
              theme="gray"
            />
          </DashboardCard>
        </div>
      </div>
    </>
  );
};

export default ServicesDashboard;
ServicesDashboard.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
