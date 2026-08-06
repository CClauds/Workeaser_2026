import { Button } from "@components/Button";
import { Chart } from "@components/Chart";
import { ChartCard } from "@components/Chart/ChartCard";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { useFetch } from "@hooks/useFetch";
import { getAPIClient } from "@services/apiClient";
import { capitalizeFirstLetter } from "@utils/helpers";
import Money from "dinero.js";
import type { SeriesOption } from "echarts";
import { EChartsOption } from "echarts";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement } from "react";
import { Cashflow, Fallback, FinancesDashboardData } from "types";
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

  const { data } = await apiClient.get<FinancesDashboardData>(
    "/cowork/dashboard/finance"
  );

  return {
    props: {
      fallback: {
        "/cowork/dashboard/finance": data,
      },
    },
  };
};

interface FinancesDashboardProps {
  fallback: Fallback;
}
const FinancesDashboard = ({ fallback }: FinancesDashboardProps) => {
  const { data: { result: dashboardData } = {} } =
    useFetch<FinancesDashboardData>("/cowork/dashboard/finance", { fallback });

  return (
    <>
      <Head>
        <title>Finances | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Financeiro</h1>
          <h2>Painel</h2>
        </div>

        <div>
          <Link href="/finances/invoices/create">
            <Button text="Criar Fatura" />
          </Link>
        </div>
      </PageHeader>

      <div>
        <ChartCard>
          <h3>Company Cash Flow</h3>
          <Chart
            type="cashFlowChart"
            option={{
              valueFormatter: (value: number) =>
                Money({ amount: value }).toFormat("$0,0.00"),
              series: formatChartData(dashboardData.cashflow),
            }}
          />
        </ChartCard>
        <div className={styles.row}>
          <ChartCard extraClass={styles.chart__big}>
            <h3>Income per Product Category</h3>
            <Chart
              type="pieBig"
              option={{
                ...doughnutChartOptions,
                series: [{ ...doughnutChartOptions.series[0], name: "Income" }],
                valueFormatter: (value: number) =>
                  Money({ amount: value }).toFormat("$0,0.00"),
                dataset: {
                  source: Object.entries(
                    dashboardData?.income_per_product_category
                  ).map(([name, value]) => ({
                    value,
                    name: capitalizeFirstLetter(name),
                  })),
                },
              }}
            />
          </ChartCard>
          <ChartCard extraClass={styles.chart__small}>
            <h3>Open Invoices per Status</h3>
            <Chart
              type="singleBar"
              option={{
                series: [
                  {
                    name: "Invoice Status:",
                    data: [
                      {
                        value: dashboardData.open_invoices_per_status.open,
                        name: "Open",
                      },
                    ],
                  },
                  {
                    name: "Invoice Status:",
                    data: [
                      {
                        value:
                          dashboardData.open_invoices_per_status.partly_paid,
                        name: "Partially Paid",
                      },
                    ],
                  },
                  {
                    name: "Invoice Status:",
                    data: [
                      {
                        value: dashboardData.open_invoices_per_status.overdue,
                        name: "Overdue",
                      },
                    ],
                  },
                ],
              }}
            />
          </ChartCard>
          <ChartCard extraClass={styles.chart__big}>
            <h3>Expenses per Product Category</h3>
            <Chart
              type="pieBig"
              option={{
                ...doughnutChartOptions,
                series: [
                  { ...doughnutChartOptions.series[0], name: "Expense" },
                ],
                valueFormatter: (value: number) =>
                  Money({ amount: value }).toFormat("$0,0.00"),
                dataset: {
                  source: Object.entries(
                    dashboardData?.expenses_per_product_category
                  ).map(([name, value]) => ({
                    value,
                    name: capitalizeFirstLetter(name),
                  })),
                },
              }}
            />
          </ChartCard>
        </div>
      </div>
    </>
  );
};

FinancesDashboard.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default FinancesDashboard;

const formatChartData = (data: Cashflow[]): SeriesOption[] => {
  const currentYear = new Date().getFullYear();
  const currentYearData = data.filter((datum) => {
    const [_, year] = datum.month.split("/");
    return Number(year) === currentYear;
  });

  const incomeArray: number[] = [];
  const expenseArray: number[] = [];
  const balanceArray: number[] = [];

  for (let i = 1; i <= 12; i++) {
    const find = currentYearData.find((item) => {
      const [month] = item.month.split("/");
      return i === Number(month);
    });

    if (find) {
      incomeArray.push(find.income);
      expenseArray.push(-find.expense);
      balanceArray.push(find.balance);
    } else {
      incomeArray.push(0);
      expenseArray.push(0);
      balanceArray.push(0);
    }
  }

  const response: SeriesOption[] = [
    {
      name: "Income",
      data: incomeArray,
    },
    {
      name: "Expenses",
      data: expenseArray,
    },
    {
      name: "Balance",
      data: balanceArray,
    },
  ];
  return response;
};

const doughnutChartOptions: EChartsOption = {
  legend: {
    orient: "vertical",
    top: "middle",
    left: "left",
    icon: "square",
    textStyle: {
      fontSize: 13,
      color: "#2f3853",
      fontFamily: "Roboto",
    },
    padding: 0,
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 14,
    itemStyle: {
      borderWidth: 0,
    },
  },
  tooltip: {
    trigger: "item",
  },
  series: [
    {
      name: "Service Type:",
      type: "pie",
      radius: [60, 90],
      left: "right",
      right: "-180",
      color: ["#3A7AB2", "#82D3F5", "#4E97CE", "#275B94"],
      label: {
        show: false,
        color: "#2b3450",
        position: "center",
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "white",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "14",
          fontWeight: "bold",
        },
      },
    },
  ],
};
