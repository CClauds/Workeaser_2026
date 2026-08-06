import { OptionsButton } from "@components/Button/OptionsButton";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { Icomoon } from "@components/Icomoon";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { ParseSmall } from "@utils/helpers";
import { formatDate } from "@utils/numberFormat";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import { Fallback } from "types";
import { InvoiceDataResponse } from "types/cowork/clients";
import { InvoiceStatusColorEnum, InvoiceStatusEnum } from "types/enums";
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

  const { data: invoices } = await apiClient.get<InvoiceDataResponse>(
    `/client/membership/${id}/invoices`
  );

  return {
    props: {
      fallback: {
        [`/client/membership/${id}/invoices`]: invoices,
      },
    },
  };
};

interface PaymentAndInvoicesProps {
  fallback: Fallback;
}
const PaymentAndInvoices = ({ fallback }: PaymentAndInvoicesProps) => {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();

  const { data: { result: invoices } = {} } = useFetch<InvoiceDataResponse>(
    `/client/membership/${id}/invoices`,
    { fallback }
  );

  const columns = useMemo(() => {
    const handleView = (invoiceId: string, handleClose: () => void) => {
      handleClose();
      router.push({
        pathname: "/client/membership/[id]/payment-and-invoices/[invoiceId]",
        query: {
          id,
          invoiceId,
        },
      });
    };
    const handlePay = async (invoiceId: string, handleClose: () => void) => {
      const { data: response } = await api.get(
        `/client/finance/invoices/${invoiceId}`
      );
      handleClose();
      router.push({
        pathname: "/invoice-payment/[id]",
        query: {
          id: response.result.uuid,
          // membershipId: id,
        },
      });
    };

    const handleCopyLink = async (
      invoiceId: string,
      handleClose: () => void
    ) => {
      const hostName = window.location.hostname;
      navigator.clipboard
        .writeText(`${hostName}/invoice-payment/${invoiceId}`)
        .then(
          () => {
            toast.success("Link da fatura copiado!");
          },
          (e) => {
            console.log(e);
          }
        );
      handleClose();
    };

    return [
      {
        Header: "Invoice Number",
        accessor: "id",
      },
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }) => formatDate(new Date(value)),
      },
      {
        Header: "Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }: { value: string }) => (
          <StatusContainer bgColor={InvoiceStatusColorEnum[value]}>
            {InvoiceStatusEnum[value]}
          </StatusContainer>
        ),
      },
      {
        Header: "Open Amount",
        accessor: "amount",
        className: "align__center",
        Cell: ({ value }: { value: number }) =>
          Money({ amount: value }).toFormat("$0,0.00"),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }: { value: { status: string; uuid: string } }) => (
          <MenuWrapper>
            {(handleClose) => (
              <>
                <OptionsButton
                  onClick={() => handleView(value.uuid, handleClose)}
                  icon={<Icomoon iconName="eye" color={theme.colors.blue800} />}
                >
                  VIEW INVOICE
                </OptionsButton>
                <OptionsButton
                  onClick={() => handleCopyLink(value.uuid, handleClose)}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <defs>
                        <clipPath>
                          <rect
                            width="16"
                            height="16"
                            transform="translate(1141 466)"
                            fill="#2b3450"
                            stroke="#707070"
                            strokeWidth="1"
                          />
                        </clipPath>
                      </defs>
                      <g transform="translate(-1141 -466)">
                        <g id="Share" transform="translate(1140.273 465.272)">
                          <path
                            d="M3.273,1.455A1.818,1.818,0,1,0,5.091,3.273,1.818,1.818,0,0,0,3.273,1.455ZM.727,3.273A2.545,2.545,0,1,1,3.273,5.818,2.545,2.545,0,0,1,.727,3.273Z"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                          <path
                            d="M3.273,12.364a1.818,1.818,0,1,0,1.818,1.818A1.818,1.818,0,0,0,3.273,12.364ZM.727,14.182a2.545,2.545,0,1,1,2.545,2.545A2.545,2.545,0,0,1,.727,14.182Z"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                          <path
                            d="M5.254,3.675l7.273,3.636-.325.65L4.928,4.325Z"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                          <path
                            d="M5.254,13.78l7.273-3.636-.325-.65L4.928,13.129Z"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                          <path
                            d="M14.182,6.909A1.818,1.818,0,1,0,16,8.727,1.818,1.818,0,0,0,14.182,6.909ZM11.636,8.727a2.545,2.545,0,1,1,2.545,2.545A2.545,2.545,0,0,1,11.636,8.727Z"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                        </g>
                      </g>
                    </svg>
                  }
                >
                  GET SHAREABLE LINK
                </OptionsButton>
                {InvoiceStatusEnum[value.status] !==
                  InvoiceStatusEnum.FULLY_PAID && (
                  <OptionsButton
                    onClick={() => handlePay(value.uuid, handleClose)}
                    icon={
                      <Icomoon iconName="money" color={theme.colors.blue800} />
                    }
                  >
                    PAY INVOICE
                  </OptionsButton>
                )}
              </>
            )}
          </MenuWrapper>
        ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () =>
      invoices?.map((invoice) => ({
        id: ParseSmall(invoice.uuid),
        date: invoice.date,
        status: invoice.status,
        amount: invoice.open_amount,
        menu: { status: invoice.status, uuid: invoice.uuid },
      })),
    [invoices]
  );

  return (
    <>
      <Head>
        <title>Payment &amp; Invoices</title>
      </Head>
      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>Payment &amp; Invoices</h1>
          <span className={styles.line}></span>
        </header>

        <div>
          <StyledTable
            columns={columns}
            data={tableData ?? []}
            columnsWidth={[15, 30, 26, 27, 2]}
          />
        </div>
      </main>
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
