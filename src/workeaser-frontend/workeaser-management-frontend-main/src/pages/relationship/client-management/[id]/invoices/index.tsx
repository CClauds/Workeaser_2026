import { InvoiceOptions } from "@components/DotsMenu/InvoiceOptions";
import { Menu } from "@components/DotsMenu/Menu";
import { ClientManagementLayout } from "@components/Layouts/ClientManagementLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import {
  InitialInvoiceData,
  PaymentModal,
} from "@components/Modals/PaymentModal";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";

import { ParseSmall } from "@utils/helpers";
import { format as formatDate } from "date-fns";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { MouseEvent, ReactElement, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { InvoiceDataResponse } from "types/cowork/clients";
import { InvoiceStatusEnum } from "types/cowork/financial/enums";
import { InvoiceActionsEnum, InvoiceStatusColorEnum } from "types/enums";
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
      const { data: invoices } = await apiClient.get<InvoiceDataResponse>(
        `/cowork/clients/${id}/invoices`
      );

      return {
        props: {
          fallback: {
            [`/cowork/clients/${id}/invoices`]: invoices,
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

type ActionType = keyof typeof InvoiceActionsEnum;

interface InvoicesProps {
  fallback: Fallback;
}
const Invoices = ({ fallback }: InvoicesProps) => {
  const router = useRouter();
  const { id } = router.query;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InitialInvoiceData>();
  const [selectedAction, setSelectedAction] = useState<ActionType>();

  const { data: { result: invoices } = {}, mutate } =
    useFetch<InvoiceDataResponse>(`/cowork/clients/${id}/invoices`, {
      fallback,
    });

  const columns = useMemo(() => {
    const handleCapturePayment =
      (uuid: string) => (e: MouseEvent<HTMLButtonElement>) => {
        const currentInvoice = invoices.find(
          (invoice) => invoice.uuid === uuid
        );
        setSelectedAction(e.currentTarget.value as ActionType);
        setSelectedInvoice({
          uuid: currentInvoice.uuid,
          status: currentInvoice.status,
          due_date: currentInvoice.date,
          total: currentInvoice.amount,
          open_amount: currentInvoice.open_amount,
          user_uuid: currentInvoice.user.uuid,
        });
        setIsModalOpen(true);
      };

    const handleCopyLink = (uuid: string) => () => {
      const hostName = window.location.hostname;
      navigator.clipboard.writeText(`${hostName}/invoice-payment/${uuid}`).then(
        () => {
          toast.success("Invoice link copied to Clipboard.");
        },
        (e) => {
          console.log(e);
        }
      );
    };

    const handleView = (uuid: string) => {
      router.push(`/finances/invoices/${uuid}`);
    };

    const handleResend = async (id: string) => {
      try {
        await api.post(`cowork/finance/invoices/resend/${id}`);
        toast.success("Invoice resended");
      } catch (error) {
        toast.error("Something went wrong when trying to send the reminder.");
      }
    };

    const handleEdit = (uuid: string) => {
      router.push({
        pathname: `/finances/invoices/create`,
        query: { id: uuid },
      });
    };

    const handleDelete = async (uuid: string) => {
      try {
        await api.delete(`/cowork/finance/invoices/${uuid}`);
        toast.success("Invoice deleted.");
        mutate();
      } catch (error) {
        toast.error("Something went wrong when trying to delete this invoice.");
      }
    };

    return [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Creation Date",
        accessor: "date",
        Cell: ({ value }) =>
          value ? formatDate(new Date(value), "MM/dd/yyyy") : "",
      },
      {
        Header: "Due Date",
        accessor: "dueDate",
        Cell: ({ value }) =>
          value ? formatDate(new Date(value), "MM/dd/yyyy") : "",
      },
      {
        Header: "Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor={InvoiceStatusColorEnum[value]}>
            {InvoiceStatusEnum[value]}
          </StatusContainer>
        ),
      },
      {
        Header: "Open Amount",
        accessor: "amount",
        className: "align__center",
        Cell: ({ value }) => Money({ amount: value }).toFormat("$0,0.00"),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }: { value: { id: string; status: string } }) => (
          <Menu
            id={value.id}
            optionsType="view"
            onGreenButtonClick={handleView}
            onYellowButtonClick={handleEdit}
            onRedButtonClick={handleDelete}
            extraOptions={
              <InvoiceOptions
                id={value.id}
                status={value.status}
                onResend={handleResend}
                onCopyClick={handleCopyLink}
                onCaptureClick={handleCapturePayment}
              />
            }
          />
        ),
      },
    ];
  }, [router]);

  const tableData = useMemo(
    () =>
      invoices?.map((invoice) => ({
        id: ParseSmall(invoice.uuid),
        date: invoice.date,
        status: invoice.status,
        amount: invoice.open_amount,
        dueDate: (invoice as any)?.due_date,
        menu: { id: invoice.uuid, status: invoice.status },
      })),
    [invoices]
  );

  return (
    <>
      <Head>
        <title>Invoices | Workeaser</title>
      </Head>

      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[15, 37, 15, 15, 15, 3]}
        />
      </div>

      <PaymentModal
        initialData={selectedInvoice}
        action={selectedAction}
        invoiceMutate={mutate}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

Invoices.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <ClientManagementLayout>{page}</ClientManagementLayout>
  </CoworkingLayout>
);
export default Invoices;
