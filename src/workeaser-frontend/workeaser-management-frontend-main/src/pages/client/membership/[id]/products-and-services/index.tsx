import { Circle } from "@components/Circle";
import { ClientProductsOptions } from "@components/DotsMenu/ClientProductsOptions";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { EmbbedSignModal } from "@components/Modals/EmbbedSignModal";
import { ServiceTag } from "@components/Table/Row/ServiceTag";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { Row } from "@styles/reusable";
import { errorHandler } from "@utils/errors";
import { formatDate } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { ClientProductResponse } from "types/cowork/clients";
import {
  ContractStatusEnum,
  InvoiceStatusColorEnum,
  ServicesAbbrEnum,
  ServicesNameEnum,
} from "types/enums";
import styles from "./styles.module.scss";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const apiClient = getAPIClient(context);
  const { id } = context.query;

  const { data: services } = await apiClient.get<ClientProductResponse>(
    `/client/membership/${id}/services`
  );

  return {
    props: {
      fallback: {
        [`/client/membership/${id}/services`]: services,
      },
    },
  };
};

type ContratStatus = keyof typeof ContractStatusEnum;

interface PaymentAndInvoicesProps {
  fallback: Fallback;
}
interface IEmbbedModal {
  isOpen: boolean;
  link: string;
}

const PaymentAndInvoices = ({ fallback }: PaymentAndInvoicesProps) => {
  const router = useRouter();
  const { id } = router.query;
  const [embbedSignModal, setEmbbedSignModal] = useState<IEmbbedModal>({
    isOpen: false,
    link: "",
  });
  const { data: { result: services } = {} } = useFetch<ClientProductResponse>(
    `/client/membership/${id}/services`,
    {
      fallback,
    }
  );

  const columns = useMemo(() => {
    const handleViewContract = async (contractFile: string) => {
      window.open(
        `${api.defaults.baseURL}/documents/${contractFile}`,
        "_blank"
      );
    };
    const handleViewDocuments = async (documents: { file: string }[]) => {
      if (!documents.length) {
        toast.error("No Documents to show.");
        return;
      }
      documents.forEach((doc) => {
        window.open(`${api.defaults.baseURL}/documents/${doc.file}`, "_blank");
      });
    };

    const RenderContractStatus = (status: string): string => {
      if (
        [
          ContractStatusEnum.SIGN_BY_COWORK,
          ContractStatusEnum.CONTRACT_SENT,
        ].includes(ContractStatusEnum[status])
      ) {
        return "Waiting Your Signature";
      } else if (
        ContractStatusEnum[status] === ContractStatusEnum.SIGN_BY_CLIENT
      ) {
        return "Waiting Coworking";
      }
      return ContractStatusEnum[status];
    };

    const handleSignContract = async (id: number) => {
      try {
        const { data: contractResponse } = await api.get(
          `/client/contracts/${id}/url`
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
              "Contrato ainda não foi assinado pelo cliente."
          );
        } else if (error.response.status === 409) {
          toast.warn("Você já assinou esse contrato.");
        } else {
          toast.error("Não foi possível assinar esse contrato. Tente novamente.");
        }
      }
    };

    return [
      {
        Header: "Service ID",
        accessor: "id",
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
        Header: "Start / Action Date",
        accessor: "startActionDate",
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
            documents: { file: string }[];
            contractFile: string;
            status: ContratStatus;
          };
        }) => (
          <MenuWrapper>
            {(handleClose) => (
              <ClientProductsOptions
                handleClose={handleClose}
                onViewContract={() => handleViewContract(value.contractFile)}
                onViewDocuments={() => handleViewDocuments(value.documents)}
                onSignContract={
                  [
                    ContractStatusEnum.CONTRACT_SENT,
                    ContractStatusEnum.SIGN_BY_COWORK,
                  ].includes(ContractStatusEnum[value.status])
                    ? () => handleSignContract(value.id)
                    : null
                }
              />
            )}
          </MenuWrapper>
        ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () =>
      services?.map((service) => ({
        id: service.id,
        serviceType: ServicesNameEnum[service.type],
        serviceName: { serviceName: service.name, serviceType: service.type },
        status: service.status,
        autoRenew: service.auto_renewal,
        startActionDate: service.service_started_date
          ? `${formatDate(
              new Date(service.service_started_date)
            )} / ${formatDate(new Date(service.service_renew_cancel_date))}`
          : "Not Active Yet",
        menu: {
          id: service.id,
          documents: service.documents,
          contractFile: service.document_file,
          status: service.status,
        },
      })),
    [services]
  );
  return (
    <>
      <Head>
        <title>Products &amp; Services</title>
      </Head>
      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>Products &amp; Services</h1>
          <span className={styles.line} />
        </header>

        <div>
          <StyledTable
            columns={columns}
            data={tableData ?? []}
            columnsWidth={[12, 38, 14, 10, 24, 2]}
          />
        </div>
      </main>
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
    </>
  );
};

PaymentAndInvoices.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => (
  <ClientLayout componentProps={componentProps}>
    <MemberLayout>{page}</MemberLayout>
  </ClientLayout>
);
export default PaymentAndInvoices;
