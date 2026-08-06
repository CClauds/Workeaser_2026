import Head from "next/head";
import { ReactElement, useMemo } from "react";
import { Menu } from "@components/DotsMenu/Menu";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { formatMoney } from "@utils/numberFormat";
import { PagesProps } from "pages/_app";
import { ColumnInterface } from "react-table";

const CommissionsAndPayouts = () => {
  const columns: ColumnInterface[] = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Payout Month",
        accessor: "payoutMonth",
      },
      {
        Header: "Incidences",
        accessor: "incidences",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="gray">{value}</StatusContainer>
        ),
      },
      {
        Header: "Total Gross Income",
        accessor: "totalIncome",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="yellow">
            {formatMoney(value)}
          </StatusContainer>
        ),
      },
      {
        Header: "Workeaser Commissions",
        accessor: "workeaserCommissions",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="red">{formatMoney(value)}</StatusContainer>
        ),
      },
      {
        Header: "Coworking Payout",
        accessor: "coworkingPayout",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="green">
            {formatMoney(value)}
          </StatusContainer>
        ),
      },
      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }) => <Menu id={value} />,
      },
    ],
    []
  );

  const tableData = useMemo(() => [], []);

  return (
    <>
      <Head>
        <title>Commissions &amp; Payouts | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Finances</h1>
          <h2>Commissions &amp; Payouts</h2>
        </div>
      </PageHeader>

      <div>
        <StyledTable
          columns={columns}
          data={tableData}
          columnsWidth={[6, 26, 6, 20, 20, 20, 2]}
        />
      </div>
    </>
  );
};

CommissionsAndPayouts.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default CommissionsAndPayouts;
