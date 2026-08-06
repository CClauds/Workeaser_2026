import AntdTable from "@components/AntdTable";
import { Button } from "@components/Button";
import { InvoiceOptions } from "@components/DotsMenu/InvoiceOptions";
import { Menu } from "@components/DotsMenu/Menu";
import { FilterButton } from "@components/Filters/FilterButton";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { PaymentModal } from "@components/Modals/PaymentModal";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { InvoiceFiltersComponent } from "@features/Filters/InvoiceFilters";
import { api } from "@services/api";
import { ParseSmall } from "@utils/helpers";
import { formatDate } from "@utils/numberFormat";
import { Empty } from "@components/antd-client";
import type { ColumnsType, TableProps } from "antd/es/table";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  InvoiceActionsEnum,
  InvoiceStatusEnum,
} from "types/cowork/financial/enums";
import type {
  Invoice,
  InvoicesResponse,
} from "types/cowork/financial/invoices";
import { InvoiceStatusColorEnum } from "types/enums";
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
  return {
    props: {},
  };
};

type ActionType = keyof typeof InvoiceActionsEnum;

export interface InvoiceFilters {
  searchTerm: string;
  dueDateFrom: string;
  dueDateTo: string;
  docStatusSent: 0 | 1;
  docStatusViewed: 0 | 1;
  docStatusPaid: 0 | 1;
  docStatusDeposit: 0 | 1;
  OPEN_DESK: 0 | 1;
  VIRTUAL_OFFICE: 0 | 1;
  PRIVATE_ROOM: 0 | 1;
  MEETING_ROOM: 0 | 1;
  balanceOpen: 0 | 1;
  balancePartiallyPaid: 0 | 1;
  balanceFullyPaid: 0 | 1;
  balanceOverdue: 0 | 1;
}

interface Pagination {
  pageSize: number;
  total: number;
}

const Invoices = () => {
  const router = useRouter();

  const { page }: { page?: string } = router.query;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  const [selectedAction, setSelectedAction] = useState<ActionType>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [invoices, setInvoices] = useState<Invoice[]>();

  const [currPage, setCurrPage] = useState<number>(
    page && !isNaN(parseFloat(page)) ? parseFloat(page) : 1
  );
  const [pagination, setPagination] = useState<Pagination>();

  const [filters, setFilters] = useState<InvoiceFilters>({
    searchTerm: "",
    dueDateFrom: "",
    dueDateTo: "",
    docStatusSent: null,
    docStatusViewed: null,
    docStatusPaid: null,
    docStatusDeposit: null,
    OPEN_DESK: null,
    VIRTUAL_OFFICE: null,
    PRIVATE_ROOM: null,
    MEETING_ROOM: null,
    balanceOpen: null,
    balancePartiallyPaid: null,
    balanceFullyPaid: null,
    balanceOverdue: null,
  });

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { result: invoices, pagination } = {} } =
        await api.get<InvoicesResponse>(formatUrl(currPage, filters));
      setInvoices(invoices);
      setPagination({
        pageSize: pagination.perPage,
        total: pagination.total,
      });
    } catch (error) {
      console.log("error fetching invoices", error);
      toast.error("Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currPage, filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const onChange: TableProps<any>["onChange"] = (pagination) => {
    setCurrPage(pagination.current);
  };

  const columns = useMemo<ColumnsType<any>>(() => {
    const handleCapturePayment =
      (id: string) => (e: MouseEvent<HTMLButtonElement>) => {
        if (invoices) {
          const currentInvoice = invoices.find(
            (invoice) => invoice.uuid === id
          );
          setSelectedAction(e.currentTarget.value as ActionType);
          setSelectedInvoice(currentInvoice);
          setIsModalOpen(true);
        }
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

    const handleEdit = (id: string) => {
      router.push({
        pathname: `/finances/invoices/create`,
        query: { id },
      });
    };

    const handleResend = async (id: string) => {
      try {
        await api.post(`cowork/finance/invoices/resend/${id}`);
        toast.success("Invoice resended");
      } catch (error) {
        toast.error("Something went wrong when trying to send the reminder.");
      }
    };

    const handleDelete = async (uuid: string) => {
      await api.delete(`/cowork/finance/invoices/${uuid}`);
      toast.success("Invoice deleted.");
    };

    const handleDuplicate = (dup: string) => () => {
      router.push({
        pathname: `/finances/invoices/create`,
        query: { dup },
      });
    };

    return [
      {
        title: "ID",
        dataIndex: "id",
        // wdith: "10%",
        key: "id",
      },
      {
        title: "Member & Company Name",
        dataIndex: "name",
        key: "name",

        render: (value) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",

        className: "align__center",
        render: (value) => (
          <StatusContainer bgColor={InvoiceStatusColorEnum[value]}>
            {InvoiceStatusEnum[value]}
          </StatusContainer>
        ),
      },
      {
        title: "Creation Date",
        dataIndex: "date",
        key: "date",

        className: "align__center",
        render: (value) => formatDate(new Date(`${value}T00:00`)),
      },
      {
        title: "Due Date",
        dataIndex: "dueDate",
        key: "dueDate",

        render: (value) => formatDate(new Date(`${value}T00:00`)),
      },
      {
        title: "Open Amount",
        dataIndex: "amount",
        key: "amount",

        className: "align__center",
        render: (value) => Money({ amount: value ?? 0 }).toFormat("$0,0.00"),
      },
      {
        title: "",
        dataIndex: "menu",
        key: "menu",
        disableSortBy: true,
        render: (value: { id: string; status: string }) => (
          <Menu
            id={value.id}
            optionsType="view"
            onGreenButtonClick={handleView}
            onYellowButtonClick={handleEdit}
            onRedButtonClick={handleDelete}
            extraOptions={
              <InvoiceOptions
                id={value.id}
                invoiceId={value.uuid /* HF-SPRINT-N-04 */}
                status={value.status}
                onResend={handleResend}
                onCopyClick={handleCopyLink}
                onCaptureClick={handleCapturePayment}
                onDuplicate={handleDuplicate}
              />
            }
          />
        ),
      },
    ];
  }, [invoices, router]);

  const tableData = useMemo(
    () =>
      invoices?.map((invoice) => ({
        id: ParseSmall(invoice.uuid),
        date: invoice.date,
        customer: `${invoice.user.first_name} ${invoice.user.last_name}`,
        status: invoice.status,
        dueDate: invoice.due_date,
        amount: invoice.open_amount,
        name: `${invoice?.user?.first_name} ${invoice?.user?.last_name}&${
          invoice?.user.clientAccount?.company_name ?? ""
        }`,
        menu: { id: invoice.uuid, uuid: invoice.uuid, status: invoice.status },
      })),
    [invoices]
  );

  return (
    <>
      <Head>
        <title>Faturas | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/finances/dashboard">Finances</Link>
          </h1>
          <h2>Invoices</h2>
        </div>

        <div className={styles.headerButtonsContainer}>
          <FilterButton buttonText="Search &amp; Filters" theme="secondary">
            <InvoiceFiltersComponent
              filters={filters}
              setFilters={setFilters}
            />
          </FilterButton>

          <Link href="/finances/invoices/create">
            <Button text="Create Invoice" />
          </Link>
        </div>
      </PageHeader>

      <div className={styles.tableContainer}>
        <AntdTable
          columns={columns}
          rowKey="id"
          onChange={onChange}
          pagination={{
            ...pagination,
            current: currPage,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={isLoading}
          locale={{
            // HF-SPRINT-L-04: empty state com CTA (antes era "No invoice found").
            // Mantem Empty da antd pra integracao com a tabela mas com mensagem PT-BR + CTA.
            emptyText: isLoading ? (
              "Buscando faturas..."
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div style={{ padding: "16px 0" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      Nenhuma fatura ainda
                    </div>
                    <div style={{ fontSize: 13, color: "#737373", marginBottom: 16 }}>
                      Crie sua primeira fatura ou aguarde até que um contrato gere a primeira automaticamente.
                    </div>
                    <Link
                      href="/finances/invoices/create"
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        background: "#1677ff",
                        color: "#fff",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Criar primeira fatura →
                    </Link>
                  </div>
                }
              />
            ),
          }}
          dataSource={tableData}
        />
      </div>

      <PaymentModal
        initialData={
          selectedInvoice
            ? {
                uuid: selectedInvoice?.uuid,
                user_uuid: selectedInvoice?.user?.uuid,
                status: selectedInvoice?.status,
                due_date: selectedInvoice?.due_date,
                total: selectedInvoice?.total,
              }
            : null
        }
        action={selectedAction}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

Invoices.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);

const formatUrl = (currentPageCount: number, filters: InvoiceFilters) => {
  let url = `/cowork/finance/invoices?page=${currentPageCount}`;
  if (filters.searchTerm) {
    url += `&general_query=${filters.searchTerm}`;
  }
  if (filters.dueDateFrom) {
    url += `&due_date_start=${filters.dueDateFrom}`;
  }
  if (filters.dueDateTo) {
    url += `&due_date_end=${filters.dueDateTo}`;
  }
  if (filters.docStatusSent) {
    url += `&invoice_status=${filters.docStatusSent}`;
  }
  if (filters.docStatusPaid) {
    url += `&partial_paid_or_fully=${filters.docStatusPaid}`;
  }
  if (filters.docStatusViewed) {
    url += `&viewed_by_customer=${filters.docStatusViewed}`;
  }
  if (filters.docStatusDeposit) {
    url += `&payment_deposited=${filters.docStatusDeposit}`;
  }
  if (filters.VIRTUAL_OFFICE) {
    url += `&contr_virtual_office=${filters.VIRTUAL_OFFICE}`;
  }
  if (filters.OPEN_DESK) {
    url += `&contr_shared_desk=${filters.OPEN_DESK}`;
    url += `&contr_exclusive_desk=${filters.OPEN_DESK}`;
  }
  if (filters.PRIVATE_ROOM) {
    url += `&contr_shared_office=${filters.PRIVATE_ROOM}`;
    url += `&contr_exclusive_office=${filters.PRIVATE_ROOM}`;
  }
  if (filters.MEETING_ROOM) {
    url += `&contr_meeting_room=${filters.MEETING_ROOM}`;
  }
  if (filters.balanceOpen) {
    url += `&bl_status_open=${filters.balanceOpen}`;
  }
  if (filters.balanceFullyPaid) {
    url += `&bl_status_fully_paid=${filters.balanceFullyPaid}`;
  }
  if (filters.balancePartiallyPaid) {
    url += `&bl_status_partially_paid=${filters.balancePartiallyPaid}`;
  }
  if (filters.balanceOverdue) {
    url += `&bl_status_overdue=${filters.balanceOverdue}`;
  }
  return url;
};

export default Invoices;
