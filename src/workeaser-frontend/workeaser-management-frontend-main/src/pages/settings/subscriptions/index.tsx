import { Button } from "@components/Button";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { DetailsModal } from "@components/Modals/DetailsModal";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Footer } from "@styles/pages/settings/cowerkersubscriptions";
import { formatMoney } from "@utils/numberFormat";
import { SubscriptionButton } from "@components/Subscription/Button";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import React, { ReactElement, useContext, useMemo, useState } from "react";
import styles from "../styles.module.scss";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { getAPIClient } from "@services/apiClient";
import { Fallback, SubscriptionsResponse } from "types";
import { useFetch } from "@hooks/useFetch";
import { AuthContext } from "@contexts/AuthContext";

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
  try {
    const { data } = await apiClient.get<SubscriptionsResponse>(
      "/cowork/settings/subscriptions"
    );
    return {
      props: {
        fallback: {
          "/cowork/settings/subscriptions": data,
        },
        loadError: null,
      },
    };
  } catch (error) {
    const apiError = error?.response?.data?.error;
    return {
      props: {
        loadError:
          apiError?.message ||
          "We couldn't load your subscription details. Please try again in a moment.",
        fallback: {},
      },
    };
  }
};

interface SubscriptionsProps {
  fallback: Fallback;
  loadError: string | null;
}
const Subscriptions = ({ fallback, loadError }: SubscriptionsProps) => {
  const { user } = useContext(AuthContext);
  const { role } = user || {};

  const [modalType, setModalType] = useState("locations");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: { result: subscriptions } = {} } =
    useFetch<SubscriptionsResponse>("/cowork/settings/subscriptions", {
      fallback,
    });

  const columns = useMemo(
    () => [
      {
        Header: "Asset Type",
        accessor: "assetType",
      },
      {
        Header: "Active Assets",
        accessor: "activesAssets",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="green">{value}</StatusContainer>
        ),
      },
      {
        Header: "Average Cost",
        accessor: "averageCost",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="yellow">
            {formatMoney(value)}
          </StatusContainer>
        ),
      },
      {
        Header: "Additional Asset",
        accessor: "additionalAsset",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="red">{formatMoney(value)}</StatusContainer>
        ),
      },
      {
        Header: "Payment Amount",
        accessor: "paymentAmount",
        className: "align__center",
        Cell: ({ value }) => formatMoney(value),
      },
      {
        Header: "",
        accessor: "button",
        className: "flex__end",
        Cell: ({ value }) => (
          <Button
            text="View Details"
            color="secondary"
            extraClass="table__button"
            onClick={handleButtonClick(value)}
          />
        ),
      },
    ],
    []
  );
  const tableData = useMemo(
    () => [
      {
        assetType: "Locations",
        activesAssets: subscriptions?.locations,
        averageCost: 0,
        additionalAsset: 0,
        paymentAmount: 0,
        button: "locations",
      },
      {
        assetType: "Customers",
        activesAssets: subscriptions?.customers,
        averageCost: 0,
        additionalAsset: 0,
        paymentAmount: 0,
        button: "customers",
      },
    ],
    [subscriptions]
  );

  const locationsColumns = useMemo(
    () => [
      {
        Header: "Asset Range",
        accessor: "assetRange",
      },
      {
        Header: "Unit Price",
        accessor: "unitPrice",
        className: "align__center",
        Cell: ({ value }) => formatMoney(value),
      },
      {
        Header: "Active Units",
        accessor: "activeUnits",
        className: "align__center",
      },
      {
        Header: "Payment Amount",
        accessor: "paymentAmount",
        className: "align__center",
        Cell: ({ value }) => formatMoney(value),
      },
    ],
    []
  );
  const locationsData = useMemo(() => [], []);

  const customersColumns = useMemo(
    () => [
      {
        Header: "Asset Range",
        accessor: "assetRange",
      },
      {
        Header: "Custom Price",
        accessor: "customerPrice",
        className: "align__center",
        Cell: ({ value }) => formatMoney(value),
      },
      {
        Header: "Active Customers",
        accessor: "activeCustomers",
        className: "align__center",
      },
      {
        Header: "Payment Amount",
        accessor: "paymentAmount",
        className: "align__center",
        Cell: ({ value }) => formatMoney(value),
      },
    ],
    []
  );
  const customersData = useMemo(() => [], []);

  const handleButtonClick = (type: string) => () => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Subscriptions | Workeaser</title>
      </Head>

      <div className={styles.subscriptionsContainer}>
        {loadError ? (
          <section role="alert" style={{ padding: 24, textAlign: "center" }}>
            <h3>Unable to load subscription details</h3>
            <p>{loadError}</p>
          </section>
        ) : (
          <section>
            <StyledTable
              columns={columns}
              data={tableData}
              columnsWidth={[17, 16, 16, 17, 18, 16]}
            />
          </section>
        )}

        <Footer>
          <SubscriptionButton>TOTAL MONTH AMOUNT: $0</SubscriptionButton>
        </Footer>
      </div>

      <DetailsModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        title={
          modalType === "locations"
            ? "Subscription Locations Details"
            : "Subscription Customers Details"
        }
      >
        <StyledTable
          columns={
            modalType === "locations" ? locationsColumns : customersColumns
          }
          data={modalType === "locations" ? locationsData : customersData}
          columnsWidth={[40, 20, 20, 20]}
          bordered={true}
        />

        <Footer>
          <SubscriptionButton>TOTAL MONTH AMOUNT: $0</SubscriptionButton>
        </Footer>
      </DetailsModal>
    </>
  );
};

Subscriptions.authRoles = ["COWORKING"];
Subscriptions.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default Subscriptions;
