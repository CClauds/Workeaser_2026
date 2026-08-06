import { Circle } from "@components/Circle";
import { ClientProductsOptions } from "@components/DotsMenu/ClientProductsOptions";
import { ContractOptions } from "@components/DotsMenu/ContractOptions";
import { Menu } from "@components/DotsMenu/Menu";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { ClientManagementLayout } from "@components/Layouts/ClientManagementLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DocumentsModal } from "@components/Modals/DocumentsModal";
import { ServiceTag } from "@components/Table/Row/ServiceTag/index";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { Row } from "@styles/reusable";
import { formatDate } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ContractResponse, Fallback } from "types";
import { ClientProductResponse } from "types/cowork/clients";
import {
  ContractStatusEnum,
  InvoiceStatusColorEnum,
  ServicesAbbrEnum,
} from "types/enums";
import styles from "../styles.module.scss";

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
  const { id } = context.query;

  if (id) {
    try {
      const { data: products } = await apiClient.get<ClientProductResponse>(
        `/cowork/clients/${id}/products`
      );

      return {
        props: {
          fallback: {
            [`/cowork/clients/${id}/products`]: products,
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

type ContractStatusType = keyof typeof ContractStatusEnum;

interface ProductsAndServicesProps {
  fallback: Fallback;
}
const ProductsAndServices = ({ fallback }: ProductsAndServicesProps) => {
  const router = useRouter();
  const { id } = router.query;
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    contractId: number | null;
  }>({
    isOpen: false,
    contractId: null,
  });
  const [isLoading, setIsLoading] = useState(0);

  const { data: { result: products } = {}, mutate } =
    useFetch<ClientProductResponse>(`/cowork/clients/${id}/products`, {
      fallback,
    });

  const RenderContractStatus = (status: string): string => {
    if (ContractStatusEnum[status] === ContractStatusEnum.SIGN_BY_COWORK) {
      return "Waiting Your Signature";
    } else if (
      ContractStatusEnum[status] === ContractStatusEnum.SIGN_BY_CLIENT
    ) {
      return "Waiting Coworking";
    }
    return ContractStatusEnum[status];
  };

  const columns = useMemo(() => {
    const handleViewContract = async (id: number, contractFile: string) => {
      try {
        const { data: contractResponse } = await api.get(
          `/cowork/relationship/contracts/${id}/pdf`
        );
        window.open(contractResponse.result.url, "_blank");
      } catch (error) {
        window.open(
          `${api.defaults.baseURL}/documents/${contractFile}`,
          "_blank"
        );
      }
    };

    const handleViewDocuments = async (id: number) => {
      setDocumentModal({
        contractId: id,
        isOpen: true,
      });
    };

    const handleSendContract = async (id: number) => {
      setIsLoading(id);
      try {
        await api.post(`/cowork/relationship/contracts/${id}/sendcontract`);
        mutate();
        toast.success("Contract sent.");
      } catch (error) {
        console.log(error.response.data);
      } finally {
        setIsLoading(0);
      }
    };

    const handleSignContract = async (id: number) => {
      try {
        const { data: contractResponse } = await api.get(
          `/cowork/relationship/contracts/${id}/url`
        );
        window.open(contractResponse.result.message, "_blank");
      } catch (error) {
        if (error.response.status === 404) {
          toast.error(
            error?.response?.data?.error?.message ||
              "Contract not signed by client."
          );
        }
      }
    };

    const handleCancelContract = async (id: number) => {
      await api.delete(`/cowork/relationship/contracts/${id}`);
      mutate();
      toast.success("Contract Canceled.");
    };

    return [
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
        Header: "Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }: { value: string }) => (
          <StatusContainer bgColor={InvoiceStatusColorEnum[value]}>
            {RenderContractStatus(value)}
          </StatusContainer>
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
        Header: "Start Date",
        accessor: "startDate",
        className: "align__center",
        Cell: ({ value }) => value,
      },
      {
        Header: "Action Date",
        accessor: "actionDate",
        className: "align__center",
        Cell: ({ value }) => value,
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({
          value,
        }: {
          value: {
            id: number;
            contractFile: string;
            status: ContractStatusType;
            disabled: boolean;
          };
        }) => (
          <Menu
            id={value.id}
            hideActions={true}
            optionsType="view"
            loading={isLoading === value.id}
            extraOptions={
              <ContractOptions
                onSignContract={() => handleSignContract(value.id)}
                status={value.status}
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
  }, [isLoading]);

  const tableData = useMemo(
    () =>
      products?.map((product) => ({
        id: product.id,
        serviceName: { serviceName: product.name, serviceType: product.type },
        status: product.status,
        autoRenew: product.auto_renewal,
        startDate: product.service_started_date
          ? formatDate(new Date(product.service_started_date))
          : "Not Active Yet",
        actionDate: product.service_started_date
          ? formatDate(new Date(product.service_renew_cancel_date))
          : "Not Active Yet",
        menu: {
          id: product.id,
          contractFile: product.document_file,
          status: product.status,
          disabled: product.status === "CREATED",
        },
      })),
    [products]
  );

  return (
    <>
      <Head>
        <title>Products &amp; Services | Workeaser</title>
      </Head>
      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[37, 15, 15, 15, 15, 3]}
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
      </div>
    </>
  );
};

ProductsAndServices.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => (
  <CoworkingLayout componentProps={componentProps}>
    <ClientManagementLayout>{page}</ClientManagementLayout>
  </CoworkingLayout>
);
export default ProductsAndServices;
