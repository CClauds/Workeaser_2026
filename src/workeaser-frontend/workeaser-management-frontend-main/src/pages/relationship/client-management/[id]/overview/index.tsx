import { Chart } from "@components/Chart";
import { ChartCard } from "@components/Chart/ChartCard";
import { ChartCardSummary } from "@components/Chart/ChartCardSummary";
import { ClientManagementLayout } from "@components/Layouts/ClientManagementLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { getAPIClient } from "@services/apiClient";
import { Row } from "@styles/reusable";
import { ECharts, EChartsOption } from "echarts";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";
import { Fallback } from "types";
import {
  BenefitsDataResponse,
  OverviewData,
  OverviewResponse,
} from "types/cowork/clients";
import styles from "../styles.module.scss";
import { leadingZero } from "@utils/helpers";

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

  const { id } = context.query;
  const apiClient = getAPIClient(context);

  const overviewPromise = apiClient.get<OverviewResponse>(
    `/cowork/clients/${id}/overview`
  );
  const benefitsPromise = apiClient.get<BenefitsDataResponse>(
    `/cowork/clients/${id}/benefits`
  );

  const [{ data: overview }, { data: benefits }] = await Promise.all([
    overviewPromise,
    benefitsPromise,
  ]);

  return {
    props: {
      overviewFallback: {
        [`/cowork/clients/${id}/overview`]: overview,
      },
      benefitsFallback: {
        [`/cowork/clients/${id}/benefits`]: benefits,
      },
    },
  };
};

interface OverviewProps {
  overviewFallback: Fallback;
  benefitsFallback: Fallback;
}
const ClientOverview = ({
  overviewFallback,
  benefitsFallback,
}: OverviewProps) => {
  const router = useRouter();
  const { id } = router.query;

  const [chartRef, setChartRef] = useState<ECharts>();

  const { data: { result: overviewData } = {} } = useFetch<OverviewResponse>(
    `/cowork/clients/${id}/overview`,
    {
      fallback: overviewFallback,
    }
  );
  const { data: { result: benefitsData } = {} } =
    useFetch<BenefitsDataResponse>(`/cowork/clients/${id}/benefits`, {
      fallback: benefitsFallback,
    });

  useEffect(() => {
    if (overviewData) {
      const chartData = getChartData(overviewData);
      chartRef?.setOption({
        series: {
          data: chartData,
        },
      });
    }
  }, [overviewData, chartRef]);

  return (
    <>
      <Head>
        <title>Overview | Workeaser</title>
      </Head>

      <div className={styles.overview__content}>
        <ChartCard>
          <h3>Meeting & Desk Usage</h3>
          <Chart type="heatmap" onChart={(chart) => setChartRef(chart)} />
        </ChartCard>
        <Row gap={15}>
          <ChartCard>
            <h3>Meeting Room Hours Usage</h3>
            <span>{benefitsData.meetingHours}</span>
            <Chart
              type="pie"
              option={{
                series: [{ name: "Usage" }],
                dataset: {
                  source: [
                    {
                      value: benefitsData.meetingHoursUsage.paid,
                      name: "Paid",
                    },
                    {
                      value: benefitsData.meetingHoursUsage.included,
                      name: "Included",
                    },
                    {
                      value: benefitsData.meetingHoursUsage.free,
                      name: "Free",
                    },
                  ],
                },
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Open Desk Days Usage</h3>
            <span>{benefitsData.deskTotalDaysUsage}</span>
            <Chart
              type="pie"
              option={{
                series: [{ name: "Usage" }],
                dataset: {
                  source: [
                    {
                      value: benefitsData.deskDaysUsage.paid,
                      name: "Paid",
                    },
                    {
                      value: benefitsData.deskDaysUsage.included,
                      name: "Included",
                    },
                    {
                      value: benefitsData.deskDaysUsage.free,
                      name: "Free",
                    },
                  ],
                },
              }}
            />
          </ChartCard>
          <ChartCard>
            <h3>Member Credits Usage</h3>
            <span>{benefitsData.totalCreditsUsage}</span>
            <Chart
              type="pie"
              option={{
                series: [{ name: "Usage" }],
                dataset: {
                  source: [
                    {
                      value: benefitsData.creditsUsage.included,
                      name: "Included",
                    },
                    {
                      value: benefitsData.creditsUsage.free,
                      name: "Free",
                    },
                  ],
                },
              }}
            />
          </ChartCard>
        </Row>
      </div>
    </>
  );
};

ClientOverview.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <ClientManagementLayout>{page}</ClientManagementLayout>
  </CoworkingLayout>
);
export default ClientOverview;

const getChartData = (data: OverviewData) => {
  const year = new Date().getFullYear();
  let response: [string, number][] = [];
  const date = +new Date(year, 0, 1);
  const end = +new Date(year + 1, 0, 1);
  const dayTime = 3600 * 24 * 1000;
  const chartData = [];
  Object.entries(data).forEach(([month, dayObj]) => {
    Object.entries(dayObj).forEach(([day, value]) => {
      response.push([
        `${year}-${leadingZero(month)}-${leadingZero(day)}`,
        value,
      ]);
    });
  });
  for (let time = date; time < end; time += dayTime) {
    const datumDate = echarts.time.format(time, "{yyyy}-{MM}-{dd}", false);
    const foundDate = response.find((datum) => datum[0] === datumDate);
    chartData.push([datumDate, foundDate ? foundDate[1] : 0]);
  }
  return chartData;
};
