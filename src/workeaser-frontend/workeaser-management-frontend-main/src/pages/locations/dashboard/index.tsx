import { Button } from "@components/Button";
import { Chart, sunburstOptions } from "@components/Chart";
import { ChartCard } from "@components/Chart/ChartCard";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { useFetch } from "@hooks/useFetch";
import { getAPIClient } from "@services/apiClient";
import { ECharts, EChartsOption } from "echarts";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";
import { Fallback, LocationsDashboardData, SpacesOccupancy } from "types";
import styles from "./styles.module.scss";

import { formatSunburstChartData } from "@utils/helpers";

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

  const { data } = await apiClient.get<LocationsDashboardData>(
    "/cowork/dashboard/locations"
  );

  return {
    props: {
      fallback: {
        "/cowork/dashboard/locations": data,
      },
    },
  };
};

interface MapData {
  name: string;
  value?: number;
  children?: MapData[];
}

interface LocationDashboardProps {
  fallback: Fallback;
}
const LocationDashboard = ({ fallback }: LocationDashboardProps) => {
  const [sunburtsChart, setSunburtsChart] = useState<ECharts>();
  const [sunbrustData, setSunbrustData] = useState<MapData[]>();

  const { data: { result: dashboardData } = {} } =
    useFetch<LocationsDashboardData>("/cowork/dashboard/locations", {
      fallback,
    });

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await formatSunburstChartData(
        dashboardData.units_location
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
          name: "Units Quantity:",
          data: sunbrustData,
        },
      });
    }
  }, [sunbrustData]);

  return (
    <>
      <Head>
        <title>Locations | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Filiais</h1>
          <h2>Painel</h2>
        </div>

        <Link href="/locations/add">
          <Button text="Adicionar Filial" color="primary" />
        </Link>
      </PageHeader>

      <div>
        <ChartCard>
          <h3>Spaces Occupancy Overview</h3>
          <Chart
            type="multBar"
            option={{
              dataset: {
                source: formatChartData(dashboardData?.spaces_occupancy),
              },
            }}
          />
        </ChartCard>

        <div className={styles.row}>
          <ChartCard>
            <h3>Units Location</h3>
            <Chart
              type="sunburst"
              onChart={(chart) => setSunburtsChart(chart)}
            />
          </ChartCard>
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
        </div>
      </div>
    </>
  );
};

LocationDashboard.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default LocationDashboard;

const formatChartData = (data: SpacesOccupancy[]) => {
  const currentYear = new Date().getFullYear();
  return data.reduce(
    (response, item) =>
      item.year === currentYear
        ? [
            ...response,
            {
              "Service Ocuppancy": MONTHS[item.month],
              "Open Desk": item.open_desk,
              "Private Room": item.private_room,
              "Metting Room": item.meet_room,
            },
          ]
        : response,
    []
  );
};

const MONTHS = {
  "1": "Jan",
  "2": "Feb",
  "3": "Mar",
  "4": "Apr",
  "5": "May",
  "6": "Jun",
  "7": "Jul",
  "8": "Ago",
  "9": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

// const scatterOptions: EChartsOption = {
//   xAxis: {},
//   yAxis: {},
//   series: [
//     {
//       symbolSize: 10,
//       data: [
//         [10.0, 8.04],
//         [8.07, 6.95],
//         [13.0, 7.58],
//         [9.05, 8.81],
//         [11.0, 8.33],
//         [14.0, 7.66],
//         [13.4, 6.81],
//         [10.0, 6.33],
//         [14.0, 8.96],
//         [12.5, 6.82],
//         [9.15, 7.2],
//         [11.5, 7.2],
//         [3.03, 4.23],
//         [12.2, 7.83],
//         [2.02, 4.47],
//         [1.05, 3.33],
//         [4.05, 4.96],
//         [6.03, 7.24],
//         [12.0, 6.26],
//         [12.0, 8.84],
//         [7.08, 5.82],
//         [5.02, 5.68],
//       ],
//       type: "scatter",
//     },
//   ],
// };

// const sunburstOptions: EChartsOption = {
//   backgroundColor: "#ffffff",
//   tooltip: {
//     trigger: "item",
//   },
//   series: {
//     name: "",
//     type: "sunburst",
//     radius: ["20%", "90%"],
//     itemStyle: {
//       borderRadius: 8,
//       borderWidth: 3,
//       borderColor: "white",
//     },
//     label: {
//       show: false,
//       color: "#2b3450",
//     },
//     color: ["#f3722c", "#43aa8b", "#2a7da1", "#f9c64f", "#f44245"],
//     emphasis: {
//       label: {
//         show: false,
//         fontSize: "25",
//         fontWeight: "bold",
//       },
//     },
//   },
// };
