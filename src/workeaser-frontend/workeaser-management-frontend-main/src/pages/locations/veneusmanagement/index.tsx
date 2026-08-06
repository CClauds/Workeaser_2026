import AntdTable from "@components/AntdTable";
import { Button as GenericButton } from "@components/Button";
import { LocationsOptions } from "@components/DotsMenu/LocationsOptions";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { ServicesRow } from "@components/Table/Row/ServicesRow";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { Thumbnail } from "@components/Thumbnail";
import { api } from "@services/api";
import { deleteLocation } from "@services/api/cowork/locations";
import { getAPIClient } from "@services/apiClient";
import { Empty } from "@components/antd-client";
import type { ColumnsType, TableProps } from "antd/es/table";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Service } from "types/infos";
import { Location, LocationData } from "types/locations";
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

  try {
    const servicesPromise = apiClient.get("/infos/services");
    const [
      {
        data: { result: services },
      },
    ] = await Promise.all([servicesPromise]);

    return {
      props: {
        services,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.response.data,
        services: [],
      },
    };
  }
};

interface LocationsProps {
  services: Service[];
}
const Locations = ({ services }: LocationsProps) => {
  const router = useRouter();
  const { page }: { page?: string } = router.query;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>();
  const [currPage, setCurrPage] = useState<number>(
    page && !isNaN(parseFloat(page)) ? parseFloat(page) : 1
  );
  const [pagination, setPagination] = useState<{
    pageSize: number;
    total: number;
  }>();

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { result: locs, pagination } = {} } =
        await api.get<LocationData>(`/cowork/locations?page=${currPage}`);
      setLocations(locs);
      setPagination({
        pageSize: pagination.perPage,
        total: pagination.total,
      });
    } catch (error) {
      console.log("error fetching locations", error);
      toast.error("Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currPage]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handlePreview = (id: number) => {
    router.push({
      pathname: "/spaces/locations/[id]",
      query: { id },
    });
  };

  const handleEdit = (id: number) => {
    router.push({
      pathname: `/locations/add`,
      query: { id },
    });
  };

  const handleDelete = async (id: number) => {
    await deleteLocation(id);
    toast.success("Deleted");
  };

  const columns: ColumnsType<any> = [
    {
      title: " ",
      dataIndex: "thumbnail",
      key: "thumbnail",
      className: "align__center",
      render: (value) => <Thumbnail url={value} alt="" size={50} />,
    },
    {
      title: "Location Name & Address",
      dataIndex: "name",
      key: "name",
      render: (value) => {
        const parsedValue = value.split("&");
        return (
          <DoublelineCell
            title={parsedValue[0]}
            subtitle={parsedValue[1]}
            style={{ paddingLeft: "10px" }}
          />
        );
      },
    },
    {
      title: "Offered Services",
      dataIndex: "services",
      key: "services",
      render: (value) => {
        return (
          <ServicesRow
            services={services}
            selectedServices={formatServicesArray(value, services)}
          />
        );
      },
    },
    {
      title: "Active Members",
      dataIndex: "activeMembers",
      className: "align__center",
      key: "activeMembers",
      render: (value) => (
        <StatusContainer bgColor="green">{value ?? 0}</StatusContainer>
      ),
    },
    {
      title: "Open Balances",
      dataIndex: "openBalances",
      key: "openBalances",
      render: (value) => (
        <StatusContainer bgColor="yellow">
          {Money({ amount: value ?? 0 }).toFormat("$0,0.00")}
        </StatusContainer>
      ),
    },
    {
      title: "Overdue Payments",
      dataIndex: "overduePayments",
      key: "overduePayments",
      render: (value) => (
        <StatusContainer bgColor="red">
          {Money({ amount: value ?? 0 }).toFormat("$0,0.00")}
        </StatusContainer>
      ),
    },
    {
      title: " ",
      dataIndex: "menu",
      key: "menu",
      render: (value) => (
        <LocationsOptions
          id={value}
          onGreenButtonClick={handlePreview}
          onYellowButtonClick={handleEdit}
          onRedButtonClick={handleDelete}
        />
      ),
    },
  ];

  const onChange: TableProps<any>["onChange"] = (pagination) => {
    setCurrPage(pagination.current);
  };

  return (
    <>
      <Head>
        <title>Locations | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Locations</h1>
          <h2>Venues Management</h2>
        </div>

        <Link href={`/locations/add`}>
          <GenericButton text="Add New Location" color="primary" />
        </Link>
      </PageHeader>

      <div className={styles.tableContainer}>
        <AntdTable
          className={styles.antTable}
          columns={columns}
          onChange={onChange}
          pagination={{
            ...pagination,
            current: currPage,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={isLoading}
          locale={{
            emptyText: isLoading ? (
              "Searching their locations."
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No locations found"
              />
            ),
          }}
          dataSource={locations?.map((location) => {
            const { address, city, state, country } = location;
            const locationAddress = city
              ? `${city}, ${state}, ${country}`
              : address;
            return {
              key: location.id,
              thumbnail: location.photos[0],
              name: `${location.name}&${locationAddress}`,
              services: location.contracted_services,
              activeMembers: location.active_members,
              openBalances: location.open_balance,
              overduePayments: location.overdue_payments,
              menu: location.id,
            };
          })}
        />
      </div>
    </>
  );
};

const formatServicesArray = (
  contractedservices: string[],
  services: Service[]
) =>
  contractedservices.map((item) => ({
    id: services.find((service) => service.slug === item).id,
  }));

Locations.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default Locations;
