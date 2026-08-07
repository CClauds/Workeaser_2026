import { Button } from "@components/Button";
import { ToggleButton } from "@components/Button/ToggleButton";
import { Menu } from "@components/DotsMenu/Menu";
import { ServicesOptions } from "@components/DotsMenu/ServicesOptions";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { AttachContract } from "@components/Modals/AttachContract";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
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
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { VirtualOfficesResponse, VirtualOffice } from "types/locations";

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

  const virtualofficesPromise = apiClient.get<VirtualOfficesResponse>(
    "/cowork/virtualoffices?page=1"
  );
  const virtualofficesNextPagePromise = apiClient.get<VirtualOfficesResponse>(
    "/cowork/virtualoffices?page=2"
  );
  const [{ data: virtualoffices }, { data: virtualofficesNextPage }] =
    await Promise.all([virtualofficesPromise, virtualofficesNextPagePromise]);

  return {
    props: {
      fallback: {
        "/cowork/virtualoffices?page=1": virtualoffices,
      },
      fallbackNextPage: {
        "/cowork/virtualoffices?page=2": virtualofficesNextPage,
      },
    },
  };
};

interface VirtualOfficeProps {
  fallback: Fallback;
  fallbackNextPage: Fallback;
}
const VirtualOfficePage = ({
  fallback,
  fallbackNextPage,
}: VirtualOfficeProps) => {
  const router = useRouter();

  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedService, setselectedService] = useState<
    VirtualOffice & { type: string }
  >();
  const [paginationState, setPaginationState] = useState({
    count: 1,
    index: 0,
    size: 10,
  });

  const [skipPageReset, setSkipPageReset] = useState(true);
  const [data, setData] = useState<VirtualOffice[]>();
  const [allData, setAllData] = useState<{ [key: string]: VirtualOffice[] }>();

  const {
    data: { result: virtualOffices, pagination } = {},
    mutate,
    isValidating,
    error,
  } = useFetch<VirtualOfficesResponse>(
    `/cowork/virtualoffices?page=${paginationState.count}`,
    { fallback }
  );

  const {
    data: {
      result: virtualOfficesNextPage,
      pagination: { page: nextPage } = {},
    } = {},
  } = useFetch<VirtualOfficesResponse>(
    `/cowork/virtualoffices?page=${paginationState.count + 1}`,
    {
      fallback: fallbackNextPage,
    }
  );

  const lastPage = Math.ceil(pagination?.total / paginationState.size);
  const hasMounted = useRef(true);

  useEffect(() => {
    if (hasMounted.current) {
      if (virtualOffices) {
        setData(virtualOffices.slice(0, 5));
      }
      hasMounted.current = false;
    }

    if (virtualOffices) {
      setAllData({
        ...allData,
        [pagination.page]: virtualOffices,
      });

      if (virtualOfficesNextPage) {
        const all = {
          ...allData,
          [pagination.page]: virtualOffices,
          [nextPage]: virtualOfficesNextPage,
        };

        setAllData(all);
      }
    }
  }, [virtualOffices, virtualOfficesNextPage]);

  const handleFetchData = (currentIndex: number, pageSize: number) => {
    setPaginationState({
      ...paginationState,
      size: pageSize,
      index: currentIndex,
    });

    if (allData) {
      const startRow = pageSize * currentIndex;
      const endRow = startRow + pageSize;

      const flattenData = Object.values(allData).flat();
      setData(flattenData.slice(startRow, endRow));

      const isPrev = currentIndex < paginationState.index;
      const pageSizeRate = pagination?.perPage / pageSize;

      if (currentIndex + 1 < pageSizeRate * paginationState.count && isPrev) {
        const prevPage = paginationState.count - 1;
        if (prevPage > 0) {
          setPaginationState({
            size: pageSize,
            index: currentIndex,
            count: prevPage,
          });

          return;
        }
      }
      if (currentIndex + 1 > pageSizeRate * paginationState.count && !isPrev) {
        const nextPage = paginationState.count + 1;
        if (nextPage < pagination.lastPage) {
          setPaginationState({
            size: pageSize,
            index: currentIndex,
            count: nextPage,
          });
        }
      }
    }
  };

  const columns = useMemo(() => {
    const handleAttach = (id: number) => () => {
      const service = virtualOffices?.find((service) => service.id === id);
      setselectedService({ ...service, type: "VIRTUAL_OFFICE" });
      setIsAttachModalOpen(true);
    };

    const handlePreview = (id: number) => {
      router.push({
        pathname: "/spaces/services/[id]",
        query: { id, serviceType: "VIRTUAL_OFFICE" },
      });
    };

    const handleEdit = (id: number) => {
      router.push({
        pathname: "/services/add/virtual-office",
        query: { id },
      });
    };

    const handleDelete = async (id: number) => {
      mutate(
        {
          result: virtualOffices?.filter(
            (virtualOffice) => virtualOffice.id !== id
          ),
          pagination,
        },
        false
      );
      await api.delete(`/cowork/virtualoffices/${id}`);
      toast.success("Plan Deleted");
      mutate();
    };

    const handleToggleVisibility =
      (id: number) => async (isActive: boolean) => {
        try {
          await api.post(`/cowork/virtualoffices/${id}/changeavailability`, {
            searchable: isActive,
          });
          mutate();
          toast.success("Visiblity Changed");
        } catch (error) {
          console.log(error.response.data);
        }
      };

    return [
      {
        Header: "",
        accessor: "thumbnail",
        className: "align__center",
        disableSortBy: true,
        Cell: ({ value }) => <Thumbnail url={value} alt="" size={50} />,
      },
      {
        Header: "Plan Name & Location",
        accessor: "name",
        Cell: ({ value }) => {
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
        Header: "Active Members",
        accessor: "activeMembers",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="green">{value ?? 0}</StatusContainer>
        ),
      },
      {
        Header: "Open Balances",
        accessor: "openBalances",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor="yellow">
            {Money({ amount: value ?? 0 }).toFormat("$0,0.00")}
          </StatusContainer>
        ),
      },
      {
        Header: "Directory Visibility",
        accessor: "visibility",
        className: "align__center",
        disableSortBy: true,
        Cell: ({ value }) => (
          <ToggleButton
            initialValue={value.value}
            onToggle={handleToggleVisibility(value.id)}
          />
        ),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }) => (
          <Menu
            id={value}
            onGreenButtonClick={handlePreview}
            onYellowButtonClick={handleEdit}
            onRedButtonClick={handleDelete}
            extraOptions={
              <ServicesOptions
                id={value}
                onAttachClick={handleAttach}
                onDetachClick={(id: number) => () => {}}
              />
            }
          />
        ),
      },
    ];
  }, [data, mutate, router]);

  const tableData = useMemo(
    () =>
      data?.filter(Boolean).map((virtualOffice) => ({
        thumbnail: virtualOffice.photos[0],
        name: `${virtualOffice.name}&${virtualOffice.location}`,
        activeMembers: virtualOffice.active_members,
        openBalances: virtualOffice.open_balance,
        visibility: {
          value: virtualOffice.visibility ? true : false,
          id: virtualOffice.id,
        },
        menu: virtualOffice.id,
      })),
    [data]
  );

  // ── states: loading / error / empty / normal ──
  const isLoading =
    isValidating && virtualOffices === undefined && data === undefined;
  const hasError = error && virtualOffices === undefined && data === undefined;
  const isEmpty =
    !isValidating &&
    !error &&
    Array.isArray(virtualOffices) &&
    virtualOffices.length === 0;

  if (isLoading) {
    return (
      <>
        <Head><title>Virtual Office | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Virtual Office</h2></div>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Loading virtual office plans…
        </div>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <Head><title>Virtual Office | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Virtual Office</h2></div>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
          You don&apos;t have access to this module or the server is unavailable.
        </div>
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        <Head><title>Virtual Office | Workeaser</title></Head>
        <PageHeader>
          <div><h1><Link href="/services/dashboard">Services</Link></h1><h2>Virtual Office</h2></div>
          <Link href={`/services/add/virtual-office?pageCount=${paginationState.count}`}>
            <Button text="Add New Plan" color="primary" />
          </Link>
        </PageHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          No virtual office plans configured yet.
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Virtual Office | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/services/dashboard">Services</Link>
          </h1>
          <h2>Virtual Office</h2>
        </div>

        <Link
          href={`/services/add/virtual-office?pageCount=${paginationState.count}`}
        >
          <Button text="Add New Plan" color="primary" />
        </Link>
      </PageHeader>

      <div>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[7, 57, 11, 11, 11, 3]}
          pageCount={lastPage ?? 1}
          fetchData={handleFetchData}
          skipPageReset={skipPageReset}
        />
      </div>

      <AttachContract
        isOpen={isAttachModalOpen}
        onRequestClose={() => setIsAttachModalOpen(false)}
        initialService={selectedService}
      />
    </>
  );
};

VirtualOfficePage.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default VirtualOfficePage;
