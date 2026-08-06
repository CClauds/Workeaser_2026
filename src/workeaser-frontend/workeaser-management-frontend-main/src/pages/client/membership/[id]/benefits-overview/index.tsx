import { Chart } from "@components/Chart";
import { ChartCardSummary } from "@components/Chart/ChartCardSummary";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { EChartsOption } from "echarts";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import React, { ReactElement } from "react";
import { formatCalendarDate } from "utils/numberFormat";

import styles from "./styles.module.scss";

interface BenefitsOverviewProps {
  id: string;
}

const BenefitsOverview = () => {
  return (
    <>
      <Head>
        <title>Benefits | Workeaser</title>
      </Head>

      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>Benefits Overview</h1>
          <span className={styles.line}></span>
        </header>

        <div className={styles.card__border}>
          <Chart option={heatmapChartoptions} height={220} />
        </div>

        <div>
          <div className={styles.row}>
            <ChartCardSummary
              title="Lifetime Usage of Metting Hours"
              value={195}
              valueLabel="Total Hours"
            />
            <ChartCardSummary
              title="Lifetime Usage of Desk Days"
              value={17}
              valueLabel="Total Days"
            />
            <ChartCardSummary
              title="Lifetime Usage of Cowrking Credits"
              value={54}
              valueLabel="Total Credits"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.row__card}>
              <Chart
                type="pie"
                option={{
                  title: {
                    text: "Metting Hours Usage",
                  },
                }}
              />
            </div>
            <div className={styles.row__card}>
              <Chart
                type="pie"
                option={{
                  title: {
                    text: "Desk Days Usage",
                  },
                }}
              />
            </div>
            <div className={styles.row__card}>
              <Chart
                type="pie"
                option={{
                  title: { text: "Credits Usage" },
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

BenefitsOverview.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => (
  <ClientLayout componentProps={componentProps}>
    <MemberLayout>{page}</MemberLayout>
  </ClientLayout>
);
export default BenefitsOverview;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      id,
    },
  };
};

const getVirtulData = (year: string) => {
  year = year || "2021";
  const date = Date.parse(year + "-01-01") + 3600 * 3 * 1000; // Palito
  const end = Date.parse(Number(year + 1) + "-01-01") + 3600 * 3 * 1000;
  const dayTime = 3600 * 24 * 1000 * 25;
  const data = [];
  for (let time = date; time < end; time += dayTime) {
    data.push([formatCalendarDate(time), Math.floor(Math.random() * 10)]);
  }
  return data;
};

// const heatmapChartoptions: EChartsOption = {
//   title: {
//     // show: false,
//     top: 0,
//     left: "left",
//     text: "Account Space & Benefits Usage Over Year",
//     textStyle: {
//       fontFamily: "laca",
//       fontSize: 13,
//       fontWeight: "normal",
//       color: "#2b3450",
//     },
//   },
//   tooltip: {},
//   visualMap: {
//     type: "piecewise",
//     // min: 0,
//     // max: 10,
//     pieces: [
//       { value: 0 },
//       { min: 1, max: 2 },
//       { min: 3, max: 4 },
//       { min: 5, max: 7 },
//       { min: 8 },
//     ],
//     orient: "horizontal",
//     left: "center",
//     bottom: 0,
//     inRange: {
//       symbol: "circle",
//       color: ["#fff", "#A9D6E5", "#89C2D9", "#61A5C2", "#468FAF", "#2C7DA0"],
//     },
//   },
//   calendar: {
//     top: 45,
//     left: 25,
//     right: 5,
//     // bottom: 0,
//     cellSize: ["auto", 15],
//     range: new Date().getFullYear(),
//     itemStyle: {
//       borderWidth: 0.5,
//       // borderColor: "#000",
//     },
//     yearLabel: { show: false },
//     splitLine: {
//       lineStyle: {
//         color: "#ecf1f6",
//         // width: 1,
//       },
//     },
//   },
//   series: {
//     type: "heatmap",
//     coordinateSystem: "calendar",
//     data: getVirtulData("2020"),
//   },
// };
const heatmapChartoptions: EChartsOption = {
  title: {
    // top: 30,
    left: "left",
    text: "Account Space & Benefits Usage Over Year",
    textStyle: {
      fontFamily: "laca",
      fontSize: 13,
      fontWeight: "normal",
      color: "#2b3450",
    },
  },
  tooltip: {},
  visualMap: {
    type: "piecewise",
    // min: 0,
    // max: 10,
    pieces: [
      // { value: 0 },
      { min: 1, max: 2 },
      { min: 3, max: 4 },
      { min: 5, max: 7 },
      { min: 8 },
    ],
    orient: "horizontal",
    left: "center",
    bottom: "8%",
    inRange: {
      symbol: "circle",
      color: ["#A9D6E5", "#89C2D9", "#61A5C2", "#468FAF", "#2C7DA0"],
    },
  },
  calendar: {
    // top: 75,
    left: 40,
    right: 30,
    cellSize: ["auto", 15],
    range: new Date().getFullYear(),
    itemStyle: {
      borderWidth: 0.5,
      // borderColor: "#000",
    },
    yearLabel: { show: false },
    dayLabel: {
      firstDay: 1,
      nameMap: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    splitLine: {
      lineStyle: {
        color: "#ecf1f6",
        // width: 1,
      },
    },
  },
  series: {
    type: "scatter",
    coordinateSystem: "calendar",
    // data: getVirtulData("2022"),
  },
};

const pieChartOptions: EChartsOption = {
  title: {
    left: "center",
    textStyle: {
      fontFamily: "laca",
      fontSize: 13,
      fontWeight: "normal",
      color: "#2b3450",
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
