import { Button } from "@components/Button";
import { Menu } from "@components/DotsMenu/Menu";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { ServicesRow } from "@components/Table/Row/ServicesRow";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import Money from "dinero.js";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { TaxesResponse } from "types/cowork/financial/taxes";
import {
  RecurringTypeEnum,
  TaxMethodEnum,
  TaxTypeEnum,
} from "types/cowork/financial/taxes/enum";
import { Service } from "types/infos";

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

  try {
    const apiClient = getAPIClient(context);
    const taxesPromise = apiClient.get<TaxesResponse>("/cowork/finance/taxes");
    const servicesPromise = apiClient.get<{ result: Service[] }>(
      "/infos/services"
    );
    const [{ data: taxes }, { data: services }] = await Promise.all([
      taxesPromise,
      servicesPromise,
    ]);
    return {
      props: {
        services: services.result,
        fallback: {
          "/cowork/finance/taxes": taxes,
        },
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.response.data,
        services: [],
        fallback: {},
      },
    };
  }
};

interface TaxesAndFeesProps {
  services: Service[];
  fallback: Fallback;
}
const TaxesAndFees = ({ services, fallback }: TaxesAndFeesProps) => {
  const {
    data: { result: taxes, pagination },
    mutate,
  } = useFetch<TaxesResponse>("/cowork/finance/taxes", {
    fallback,
  });

  const router = useRouter();

  const columns = useMemo(() => {
    const handleDelete = async (id: number) => {
      mutate(
        { result: taxes?.filter((tax) => tax.id !== id), pagination },
        false
      );
      try {
        await api.delete(`/cowork/finance/taxes/${id}`);
        toast.success("Deleted");
      } catch (error) {
        console.log(error.response);
      }
      mutate();
    };

    const handleEdit = (id: number) => {
      router.push({
        pathname: `/finances/taxes/create`,
        query: { id },
      });
    };

    return [
      {
        Header: "Tax & Fee Name",
        accessor: "name",
      },
      {
        Header: "Tax & Fee Type",
        accessor: "type",
      },
      {
        Header: "Pre-Selected Services",
        accessor: "services",
        Cell: ({ value }) => (
          <ServicesRow services={services} selectedServices={value} />
        ),
      },
      {
        Header: "Recurring Type",
        accessor: "recurringType",
      },
      {
        Header: "Calculation Method",
        accessor: "method",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="gray">{value}</StatusContainer>
        ),
      },
      {
        Header: "Amount",
        accessor: "value",
        className: "align__center",
      },

      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }) => (
          <Menu
            id={value}
            onYellowButtonClick={handleEdit}
            onRedButtonClick={handleDelete}
            // onViewClick={handleView}
          />
        ),
      },
    ];
  }, [taxes, mutate, router]);

  const tableData = useMemo(
    () =>
      taxes?.map((tax) => ({
        name: tax.name,
        type: TaxTypeEnum[tax.type],
        services: tax.services,
        method: TaxMethodEnum[tax.method],
        recurringType: RecurringTypeEnum[tax.recurring_type],
        value:
          tax.method === "FIXED"
            ? Money({ amount: tax.value }).toFormat("$0,0.00")
            : `${Money({ amount: tax.value }).toFormat("0.00")}%`,
        menu: tax.id,
      })),
    [taxes]
  );

  return (
    <>
      <Head>
        <title>Impostos e Taxas | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/finances/dashboard">Finances</Link>
          </h1>
          <h2>Taxes &amp; Extra Fees</h2>
        </div>

        <Link href="/finances/taxes/create">
          <Button text="Create New Tax or Fee" color="primary" />
        </Link>
      </PageHeader>

      <div>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[16, 30, 18, 12, 12, 10, 2]}
        />
      </div>
    </>
  );
};

TaxesAndFees.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default TaxesAndFees;
