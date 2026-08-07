import { Circle } from "@components/Circle";
import { ContractOptions } from "@components/DotsMenu/ContractOptions";
import { Menu } from "@components/DotsMenu/Menu";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { ServiceTag } from "@components/Table/Row/ServiceTag";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { Row } from "@styles/reusable";
import { formatDate } from "@utils/numberFormat";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ContractResponse, Fallback } from "types";
import { Contract, ContractsResponse } from "types/cowork/relationship";
import { ContractStatusEnum } from "types/cowork/relationship/enums";
import { ServicesAbbrEnum } from "types/enums";
import styles from "./styles.module.scss";
import { errorHandler } from "@utils/errors";
import { EmbbedSignModal } from "@components/Modals/EmbbedSignModal";
import {
  IdentityResponse,
  IdentityStatus,
} from "@features/GlobalSettings/ExternalServices";
import { Alert, Button as AntdButton } from "@components/antd-client";
import { useRouter } from "next/router";
import { DocumentsModal } from "@components/Modals/DocumentsModal";

enum ServiceType {
  VIRTUAL_OFFICE = 1,
  OPEN_DESK = 3,
  PRIVATE_ROOM = 5,
}

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

  const contractsPromise = apiClient.get<ContractsResponse>(
    "/cowork/relationship/contracts?page=1"
  );
  const contractsNextPagePromise = apiClient.get<ContractsResponse>(
    "/cowork/relationship/contracts?page=2"
  );
  const [{ data: contracts }, { data: contractsNextPage }] = await Promise.all([
    contractsPromise,
    contractsNextPagePromise,
  ]);

  return {
    props: {
      fallback: {
        "/cowork/relationship/contracts?page=1": contracts,
      },
      fallbackNextPage: {
        "/cowork/relationship/contracts?page=2": contractsNextPage,
      },
    },
  };
};

interface ContractsProps {
  fallback: Fallback;
  fallbackNextPage: Fallback;
}

interface IEmbbedModal {
  isOpen: boolean;
  link: string;
}

interface IDocumentModal {
  isOpen: boolean;
  contractId: number | null;
}

const Contracts = ({ fallback, fallbackNextPage }: ContractsProps) => {
  const [paginationState, setPaginationState] = useState({
    count: 1,
    index: 0,
    size: 10,
  });
  const [skipPageReset, setSkipPageReset] = useState(true);
  const [data, setData] = useState<Contract[]>();
  const [allData, setAllData] = useState<{ [key: string]: Contract[] }>();
  const [isLoading, setIsLoading] = useState(0);
  const [embbedSignModal, setEmbbedSignModal] = useState<IEmbbedModal>({
    isOpen: false,
    link: "",
  });
  const [documentModal, setDocumentModal] = useState<IDocumentModal>({
    isOpen: false,
    contractId: null,
  });

  const [bsIdentity, setBsIdentity] = useState<IdentityResponse>();
  const router = useRouter();

  const FetchBoldSignIdentity = async () => {
    try {
      const { data: { result: identity } = {} } = await api.get<{
        result: IdentityResponse;
        error: {
          message: string;
        };
      }>("/cowork/boldsign/identities/me");
      setBsIdentity(identity);
    } catch {
      // BoldSign integration not configured — neutral state
    }
  };

  const { data: { result: contracts, pagination } = {}, mutate } =
    useFetch<ContractsResponse>(
      `/cowork/relationship/contracts?page=${paginationState.count}`,
      { fallback }
    );

  const {
    data: {
      result: contractsNextPage,
      pagination: { page: nextPage } = {},
    } = {},
  } = useFetch<ContractsResponse>(
    `/cowork/relationship/contracts?page=${paginationState.count + 1}`,
    {
      fallback: fallbackNextPage,
    }
  );

  const lastPage = Math.ceil(pagination?.total / paginationState.size);
  const hasMounted = useRef(true);

  useEffect(() => {
    if (hasMounted.current) {
      setData(contracts.slice(0, 5));
      hasMounted.current = false;
    }

    if (contracts) {
      setAllData({
        ...allData,
        [pagination.page]: contracts,
      });

      if (contractsNextPage) {
        const all = {
          ...allData,
          [pagination.page]: contracts,
          [nextPage]: contractsNextPage,
        };

        setAllData(all);
      }
    }
  }, [contracts, contractsNextPage]);

  useEffect(() => {
    FetchBoldSignIdentity();
  }, []);

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

  const handleSignContract = async (id: number) => {
    try {
      const { data: contractResponse } = await api.get(
        `/cowork/relationship/contracts/${id}/url`
      );
      setEmbbedSignModal({
        isOpen: true,
        link: contractResponse.result.message,
      });
      // window.open(contractResponse.result.message, "_blank");
    } catch (error) {
      if (error.response.status === 400) {
        toast.warn(
          error?.response?.data?.error?.message ||
            "Contract not signed by client."
        );
      } else if (error.response.status === 409) {
        toast.warn("You already sign this contract.");
      } else {
        errorHandler(error);
      }
    }
  };

  const columns = useMemo(() => {
    const handleViewContract = async (id: number, contractFile: string) => {
      // try {
      //   const { data: contractResponse } = await api.get(
      //     `/cowork/relationship/contracts/${id}/pdf`
      //   );
      //   window.open(contractResponse.result, "_blank");
      // } catch (error) {
      //   window.open(
      //     `${api.defaults.baseURL}/documents/${contractFile}`,
      //     "_blank"
      //   );
      // }
      window.open(
        `${api.defaults.baseURL}/documents/${contractFile}`,
        "_blank"
      );
    };

    const handleSendContract = async (id: number) => {
      setIsLoading(id);
      try {
        await api.post(`/cowork/relationship/contracts/${id}/sendcontract`);
        mutate();
        toast.success("Contract sent.");
      } catch (error) {
        console.log(error.response.data);
        toast.error(
          error?.response?.data?.error?.message ||
            "I'm sorry, we failed to try send the contract."
        );
      } finally {
        setIsLoading(0);
      }
    };

    const handleViewDocuments = async (id: number) => {
      setDocumentModal({
        contractId: id,
        isOpen: true,
      });
    };

    const handleGetContractLink = async (id: number) => {
      const envelopId = contracts.find(
        (contract) => contract.id === id
      ).envelope_id;
      navigator.clipboard.writeText("<empty clipboard>").then(
        () => {
          navigator.clipboard.writeText(
            `https://demo.docusign.net/Signing/?ti=${envelopId}`
          );
          toast.success("Contract link copied to Clipboard.");
        },
        (e) => {
          console.log(e);
        }
      );
    };

    const RenderContractStatus = (status: string): string => {
      if (
        [
          ContractStatusEnum.SIGN_BY_CLIENT,
          ContractStatusEnum.CONTRACT_SENT,
        ].includes(ContractStatusEnum[status])
      ) {
        return "Waiting Your Signature";
      } else if (
        ContractStatusEnum[status] === ContractStatusEnum.SIGN_BY_COWORK
      ) {
        return "Waiting Client";
      }
      return ContractStatusEnum[status];
    };

    const handleCancelContract = async (id: number) => {
      try {
        await api.delete(`/cowork/relationship/contracts/${id}`);
        mutate();
        toast.success("Contract Canceled.");
      } catch (error) {
        console.log(error.response.data);
      }
    };

    return [
      {
        Header: "Member & Company Name",
        accessor: "name",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Service Name",
        accessor: "serviceName",
        Cell: ({
          value,
        }: {
          value: { serviceName: string; serviceType: string };
        }) => (
          <Row gap={10}>
            <ServiceTag isActive>
              {ServicesAbbrEnum[value.serviceType]}
            </ServiceTag>
            {value.serviceName}
          </Row>
        ),
      },
      {
        Header: "Contract Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }: { value: string }) => (
          <StatusContainer>{RenderContractStatus(value)}</StatusContainer>
        ),
      },
      {
        Header: "Auto-Renew",
        accessor: "autoRenew",
        className: "align__center",
        Cell: ({ value }: { value: number }) => (
          <Circle sizeInRem={1} active={value === 1 ? true : false} />
        ),
      },
      {
        Header: "Start / Action Date",
        accessor: "startActionDate",
        className: "align__center",
      },
      {
        Header: "",
        accessor: "menu",
        className: "flex__end",
        Cell: ({
          value,
        }: {
          value: {
            id: number;
            uuid: string;
            contractFile: string;
            disabled: boolean;
            status: string;
          };
        }) => (
          <Menu
            id={value.id}
            hideActions={true}
            optionsType="view"
            loading={isLoading === value.id}
            extraOptions={
              <ContractOptions
                status={value.status}
                onSignContract={() => handleSignContract(value.id)}
                onViewContract={() =>
                  handleViewContract(value.id, value.contractFile)
                }
                onSend={
                  value.disabled ? null : () => handleSendContract(value.id)
                }
                onViewDocuments={() => handleViewDocuments(value.id)}
                getLink={() => {}}
                onCancel={() => handleCancelContract(value.id)}
              />
            }
          />
        ),
      },
    ];
  }, [data, isLoading]);

  const tableData = useMemo(
    () =>
      data?.map((contract, index) => ({
        name: `${contract.user.first_name} ${contract.user.last_name}`,
        companyName: contract.user?.clientAccount?.company_name ?? "",
        serviceName: {
          serviceName: contract.service_name,
          serviceType: contract.service_type,
        },
        services: [{ id: ServiceType[contract.service_type] }],
        status: contract.status,
        autoRenew: contract.auto_renewal,
        startActionDate: contract.service_started_date
          ? `${formatDate(
              new Date(contract.service_started_date)
            )} / ${formatDate(new Date(contract.service_renew_cancel_date))}`
          : "Not Active Yet",
        menu: {
          uuid: contract.uuid,
          id: contract.id,
          contractFile: contract.document_file[0].file,
          status: contract.status,
          disabled: contract.status === "CREATED",
        },
      })),
    [data]
  );

  return (
    <>
      <PageHeader>
        <div>
          <h1>Relationship</h1>
          <h2>Client Management</h2>
          <h2>Contracts Follow Up</h2>
        </div>
      </PageHeader>

      {bsIdentity && bsIdentity.status !== IdentityStatus.APPROVED && (
        <Alert
          style={{
            marginBottom: 10,
          }}
          message="You must authorize the external service BoldSign to be able to send a contract."
          type="warning"
          action={
            <AntdButton
              type="ghost"
              onClick={() =>
                router.push("/settings/global-settings?tab=EXTERNAL_SERVICES")
              }
            >
              {"> Settings"}
            </AntdButton>
          }
          showIcon={true}
        />
      )}

      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[53, 11, 11, 11, 11, 3]}
          pageCount={lastPage ?? 1}
          fetchData={handleFetchData}
          skipPageReset={skipPageReset}
        />
      </div>
      <EmbbedSignModal
        isOpen={embbedSignModal.isOpen}
        embbedLink={embbedSignModal?.link || ""}
        onRequestClose={() =>
          setEmbbedSignModal((state) => ({
            ...state,
            isOpen: false,
          }))
        }
      />
      <DocumentsModal
        isOpen={documentModal.isOpen}
        contractId={documentModal?.contractId}
        onClose={() =>
          setDocumentModal((state) => ({
            ...state,
            isOpen: false,
          }))
        }
      />
    </>
  );
};

Contracts.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default Contracts;
