import { Chart, sunburstOptions } from "@components/Chart";
import { ChartCard } from "@components/Chart/ChartCard";
import { ChartCardSummary } from "@components/Chart/ChartCardSummary";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { MailboxOverview } from "@components/MailboxOverview";
import { useFetch } from "@hooks/useFetch";
import { getAPIClient } from "@services/apiClient";
import { formatSunburstChartData } from "@utils/helpers";
import Money from "dinero.js";
import { ECharts } from "echarts";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";
import { Fallback, RelationshipDashboardData } from "types";
import { ServicesNameEnum } from "types/enums";
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

  const { data } = await apiClient.get<RelationshipDashboardData>(
    "/cowork/dashboard/relationship"
  );

  return {
    props: {
      fallback: {
        "/cowork/dashboard/relationship": data,
      },
    },
  };
};
interface MapData {
  name: string;
  value?: number;
  children?: MapData[];
}

interface RelationshipDashboardProps {
  fallback: Fallback;
}
const RelationshipDashboard = ({ fallback }: RelationshipDashboardProps) => {
  const [sunburtsChart, setSunburtsChart] = useState<ECharts>();
  const [sunbrustData, setSunbrustData] = useState<MapData[]>();

  const { data: { result: dashboardData } = {} } =
    useFetch<RelationshipDashboardData>("/cowork/dashboard/relationship", {
      fallback,
    });

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await formatSunburstChartData(
        dashboardData.users_location
      );
      setSunbrustData(response);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (sunbrustData) {
      sunburtsChart.setOption({
        ...sunburstOptions,
        series: {
          ...sunburstOptions.series,
          name: "Location:",
          data: sunbrustData,
        },
      });
    }
  }, [sunbrustData]);

  return (
    <>
      <Head>
        <title>Dashboard | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Relationship</h1>
          <h2>Dashboard</h2>
        </div>
      </PageHeader>

      <div className={styles.container}>
        <div className={styles.row}>
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
            title="Global Customer Lifetime Value"
            value={dashboardData?.lifetime_value}
            direction="column"
            type="currency"
          />
          <ChartCardSummary
            title="Average Revenue per Member per Month"
            value={dashboardData?.average_revenue}
            direction="column"
            type="monthly"
          />
        </div>

        <div className={styles.row}>
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
                  source: Object.entries(
                    dashboardData?.clients_per_category
                  ).map(([name, value]) => ({
                    value,
                    name: ServicesNameEnum[name],
                  })),
                },
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Lifetime Value per Product Category</h3>
            <Chart
              type="pie"
              option={{
                series: [{ name: "Average" }],
                valueFormatter: (value: number) =>
                  Money({ amount: value }).toFormat("$0,0.00"),
                dataset: {
                  source: Object.entries(
                    dashboardData?.average_value_per_category
                  ).map(([name, value]) => ({
                    value,
                    name: ServicesNameEnum[name],
                  })),
                },
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Benefits Usage per Cycle</h3>
            <Chart
              type="gauge"
              option={{
                series: [
                  {
                    data: [
                      {
                        value: dashboardData?.benefits_usage,
                      },
                    ],
                  },
                  {
                    data: [
                      {
                        value: dashboardData?.benefits_usage,
                      },
                    ],
                  },
                ],
              }}
            />
          </ChartCard>
        </div>

        <div className={styles.row}>
          <ChartCard>
            <h3>Leads &amp; Members Location</h3>
            <Chart
              type="sunburst"
              onChart={(chart) => setSunburtsChart(chart)}
            />
          </ChartCard>
          <ChartCard>
            <h3>Contracts Attention &amp; Actions</h3>
            <Chart
              type="singleBar"
              option={{
                series: [
                  {
                    name: "Contracts Attention & Actions",
                    data: [
                      {
                        value: dashboardData.contracts_attention.auto_renewal,
                        name: "Open",
                      },
                    ],
                  },
                  {
                    name: "Contracts Attention & Actions",
                    data: [
                      {
                        value: dashboardData.contracts_attention.cancelation,
                        name: "Partially Paid",
                      },
                    ],
                  },
                  // {
                  //   data: [
                  //     {
                  //       value: dashboardData.contracts_attention.overdue,
                  //       name: "Overdue",
                  //     },
                  //   ],
                  // },
                ],
              }}
            />
          </ChartCard>
          <ChartCard>
            <MailboxOverview
              title="Mailbox Overview per Requested Actions"
              pickingUp={dashboardData?.mailbox_actions.picking_up}
              hold={dashboardData?.mailbox_actions.hold}
              forward={dashboardData?.mailbox_actions.forward}
              trash={dashboardData?.mailbox_actions.trash}
            />
          </ChartCard>
        </div>
      </div>
    </>
  );
};

RelationshipDashboard.getLayout = (
  page: ReactElement,
  componentsProps: PagesProps
) => <CoworkingLayout componentProps={componentsProps}>{page}</CoworkingLayout>;
export default RelationshipDashboard;
