import { Button } from "@components/Button";
import { Chart } from "@components/Chart";
import { ChartCard } from "@components/Chart/ChartCard";
import { ChartCardSummary } from "@components/Chart/ChartCardSummary";
import { DotsMenu } from "@components/DotsMenu";
import { LocationHeader } from "@components/Headers/LocationHeader";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { TableCard } from "@components/Table/TableCard";
import { useFetch } from "hooks/useFetch";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { LocationResponse } from "types/locations";
import styles from "./styles.module.scss";

const LocationsOverview = ({}) => {
  const router = useRouter();
  const { id } = router.query;
  const { data: { result: { location: location } = {} } = {} } =
    useFetch<LocationResponse>(`/cowork/locations/${id}`);

  const columns = useMemo(
    () => [
      {
        Header: "Activity Type",
        accessor: "activityType",
        Cell: ({ value }) => (
          <StatusContainer bgColor="blue">{value}</StatusContainer>
        ),
      },
      {
        Header: "Member Name",
        accessor: "memberName",
      },
      {
        Header: "Priority/Request",
        accessor: "priorityRequest",
        Cell: ({ value }) => <StatusContainer>{value}</StatusContainer>,
      },
      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }) => <DotsMenu id={value} />,
      },
    ],
    []
  );

  const tableData = useMemo(() => [], [location]);

  return (
    <>
      <Head>
        <title>Overview | Workeaser</title>
      </Head>
      <PageHeader>
        <div>
          <h1>
            <Link href="/locations/veneusmanagement">Locations</Link>
          </h1>
          <h2>Manage Location</h2>
          <h2>{location?.name}</h2>
        </div>

        <Link
          href={{
            pathname: `/locations/add`,
            query: { id: location?.id },
          }}
        >
          <Button text="Edit Location" color="secondary" />
        </Link>
      </PageHeader>

      <LocationHeader id={location?.id} />

      <div className={styles.content}>
        <section>
          <div className={styles.row}>
            <ChartCardSummary
              title="Active Members"
              value={38100}
              valueLabel=""
            />
            <ChartCardSummary
              title="Receivable Income"
              value={2410}
              valueLabel=""
            />
          </div>

          <div className={styles.row}>
            <ChartCard>
              <Chart
                type="pie"
                option={{
                  title: {
                    text: "Clients per Product Category",
                  },
                  color: [
                    "#43AA8B",
                    "#277DA1",
                    "#f9c74f",
                    "#F3722C",
                    "#f94144",
                  ],
                  dataset: {
                    source: [
                      { value: 10, name: "Virtual Office" },
                      { value: 25, name: "Metting Room" },
                      { value: 35, name: "Private & Shared Desk" },
                      { value: 45, name: "Private & Shared Office" },
                      { value: 65, name: "Others" },
                    ],
                  },
                }}
              />
            </ChartCard>
            <ChartCard>
              <Chart
                type="pie"
                option={{
                  title: {
                    text: "Invoices per Status",
                  },
                  color: ["#90be6d", "#f9c74f", "#F3722C", "#f94144"],
                  dataset: {
                    source: [
                      { value: 100, name: "Paid in Full" },
                      { value: 25, name: "Open" },
                      { value: 5, name: "Partially Paid" },
                      { value: 45, name: "Overdue" },
                    ],
                  },
                }}
              />
            </ChartCard>
          </div>
        </section>

        <section>
          <TableCard title="Member Support and Mailbox Requests">
            {tableData && (
              <StyledTable
                columns={columns}
                data={tableData}
                columnsWidth={[25, 51, 20, 2]}
              />
            )}
          </TableCard>
        </section>
      </div>
    </>
  );
};

LocationsOverview.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default LocationsOverview;
