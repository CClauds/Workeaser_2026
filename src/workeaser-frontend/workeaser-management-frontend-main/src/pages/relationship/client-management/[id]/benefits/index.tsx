import { ChartCardSummary } from "@components/Chart/ChartCardSummary";
import { ClientManagementLayout } from "@components/Layouts/ClientManagementLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { useFetch } from "@hooks/useFetch";
import { getAPIClient } from "@services/apiClient";
import { Chart } from "components/Chart";
import { ECharts, EChartsOption } from "echarts";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";
import { Fallback } from "types";
import { BenefitsDataResponse } from "types/cowork/clients";
import styles from "../styles.module.scss";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  const { "user-token": token } = parseCookies(context);
  const { id } = context.query;

  if (!token) {
    return {
      redirect: {
        destination: "/login?expired=true",
        permanent: false,
      },
    };
  }
  if (id) {
    try {
      const { data } = await apiClient.get<BenefitsDataResponse>(
        `/cowork/clients/${id}/benefits`
      );

      return {
        props: {
          fallback: {
            [`/cowork/clients/${id}/benefits`]: data,
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

interface BenefitsProps {
  fallback: Fallback;
}

const Benefits = ({ fallback }: BenefitsProps) => {
  const router = useRouter();
  const { id } = router.query;

  const [mettingChartRef, setMettingChartRef] = useState<ECharts>();
  const [deskChartRef, setDeskChartRef] = useState<ECharts>();
  const [creditChartRef, setCreditChartRef] = useState<ECharts>();

  const { data: { result: benefitsData } = {} } =
    useFetch<BenefitsDataResponse>(`/cowork/clients/${id}/benefits`, {
      fallback,
    });

  useEffect(() => {
    if (benefitsData) {
      mettingChartRef?.setOption({
        dataset: {
          source: [
            { value: benefitsData.meetingHoursUsage.paid, name: "Paid" },
            {
              value: benefitsData.meetingHoursUsage.included,
              name: "Included",
            },
            { value: benefitsData.meetingHoursUsage.free, name: "Free" },
          ],
        },
      });
      deskChartRef?.setOption({
        dataset: {
          source: [
            { value: benefitsData.deskDaysUsage.paid, name: "Paid" },
            { value: benefitsData.deskDaysUsage.included, name: "Included" },
            { value: benefitsData.deskDaysUsage.free, name: "Free" },
          ],
        },
      });
      creditChartRef?.setOption({
        dataset: {
          source: [
            // { value: benefitsData.creditsUsage., name: "Paid" },
            { value: benefitsData.creditsUsage.included, name: "Included" },
            { value: benefitsData.creditsUsage.free, name: "Free" },
          ],
        },
      });
    }
  }, [benefitsData, mettingChartRef, deskChartRef, creditChartRef]);

  return (
    <>
      <Head>
        <title>Benefits | Workeaser</title>
      </Head>

      <div>
        <div className={styles.row}>
          <ChartCardSummary
            title="Lifetime Usage of Metting Hours"
            value={benefitsData.meetingHours}
            valueLabel="Total Hours"
          />
          <ChartCardSummary
            title="Lifetime Usage of Desk Days"
            value={benefitsData.deskTotalDaysUsage}
            valueLabel="Total Days"
          />
          <ChartCardSummary
            title="Lifetime Usage of Cowrking Credits"
            value={benefitsData.totalCreditsUsage}
            valueLabel="Total Credits"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.row__card}>
            <Chart
              onChart={(chart) => setMettingChartRef(chart)}
              option={{
                ...chartOptions,
                title: {
                  ...chartOptions.title,
                  text: "Metting Hours Usage",
                },
              }}
            />
          </div>
          <div className={styles.row__card}>
            <Chart
              onChart={(chart) => setDeskChartRef(chart)}
              option={{
                ...chartOptions,
                title: { ...chartOptions.title, text: "Desk Days Usage" },
              }}
            />
          </div>
          <div className={styles.row__card}>
            <Chart
              onChart={(chart) => setCreditChartRef(chart)}
              option={{
                ...chartOptions,
                title: { ...chartOptions.title, text: "Credits Usage" },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

Benefits.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <ClientManagementLayout>{page}</ClientManagementLayout>
  </CoworkingLayout>
);
export default Benefits;

const chartOptions: EChartsOption = {
  title: {
    left: "center",
    textStyle: {
      fontSize: 13,
      fontWeight: 400,
    },
  },
  tooltip: {
    trigger: "item",
  },
  legend: {
    bottom: "0",
    left: "center",
    icon: "circle",
  },
  color: ["#90be6d", "#f9c74f", "#f94144"],
  series: [
    {
      type: "pie",
      radius: ["35%", "60%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "12",
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
    },
  ],
};
