import { ActivityElement } from "@components/ActivityElement";
import { InputComponent } from "@components/FormElements/Input";
import { SelectComponent } from "@components/FormElements/Select";
import { PageHeader } from "@components/Headers/PageHeader";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import {
  ActivitiesSection,
  ActivitySection,
  BorderedSection,
  Content,
  SummarySection,
  InfosBlock,
  InfoSection,
  PaymentElement,
  TopRow,
} from "@styles/pages/finances/invoices/single";
import { Row } from "@styles/reusable";
import { ParseSmall } from "@utils/helpers";
import { dateMask } from "@utils/masks";
import { formatDate } from "@utils/numberFormat";
import Money from "dinero.js";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { useTheme } from "styled-components";
import { Fallback } from "types";
import { InvoiceStatusEnum } from "types/cowork/financial/enums";
import { InvoiceInfoResponse } from "types/cowork/financial/invoices";
import { InvoiceStatusColorEnum, PaymentStatusEnum } from "types/enums";
import { OptionType } from "types/form";
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

  const { id, invoiceId } = context.params;

  const apiClient = getAPIClient(context);
  const { data: invoice } = await apiClient.get<InvoiceInfoResponse>(
    `/client/finance/invoices/${invoiceId}`
  );
  return {
    props: {
      id,
      invoiceId,
      fallback: {
        [`/client/finance/invoices/${invoiceId}`]: invoice,
      },
    },
  };
};

interface InvoicePageProps {
  id: number;
  invoiceId: number;
  fallback: Fallback;
}
const InvoicePage = ({ id, invoiceId, fallback }: InvoicePageProps) => {
  const router = useRouter();
  const theme = useTheme();

  const { data: { result: invoice } = {} } = useFetch<InvoiceInfoResponse>(
    `/client/finance/invoices/${invoiceId}`,
    { fallback }
  );

  const columns = useMemo(() => {
    return [
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }) => dateMask(value),
      },
      {
        Header: "Item",
        accessor: "name",
      },
      {
        Header: "Quantity",
        accessor: "quantity",
        className: "align__center",
        Cell: ({ value }) => value,
      },
      {
        Header: "Unit Price",
        accessor: "unit_price",
        className: "align__center",
        Cell: ({ value }) => (
          <span>{Money({ amount: value }).toFormat("$0,0.00")}</span>
        ),
      },
      {
        Header: "Total Amount",
        accessor: "total_amount",
        className: "align__center",
        Cell: ({ value }) => (
          <span>{Money({ amount: value }).toFormat("$0,0.00")}</span>
        ),
      },
    ];
  }, []);

  const columnsIniFees = useMemo(() => {
    return [
      {
        accessor: "date",
        Cell: ({ value }) => dateMask(value),
      },
      {
        accessor: "name",
      },
      {
        accessor: "quantity",
        className: "align__center",
        Cell: ({ value }) => value,
      },
      {
        accessor: "unit_price",
        className: "align__center",
        Cell: ({ value }) => (
          <span>{Money({ amount: value }).toFormat("$0,0.00")}</span>
        ),
      },
      {
        accessor: "total_amount",
        className: "align__center",
        Cell: ({ value }) => (
          <span>{Money({ amount: value }).toFormat("$0,0.00")}</span>
        ),
      },
    ];
  }, []);

  let iniFeeDate = invoice?.items[0].date;
  let totalIniFee: number = 0;

  let tableData = useMemo(
    () =>
      invoice?.items.map((item) => ({
        date: item.date,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.unit_price,
      })),
    [invoice]
  );

  invoice?.iniFees.map((item) => {
    tableData.push({
      date: iniFeeDate,
      name: item.name,
      quantity: 1,
      unit_price: item.value,
      total_amount: item.value,
    });
    totalIniFee += item.value;
  });

  const handleAction = async (option: OptionType) => {
    const { uuid } = invoice;
    switch (option.value) {
      case "PAY":
        router.push({
          pathname: "/invoice-payment/[id]",
          query: {
            id: uuid,
            // membershipId: id,
          },
        });
        break;
      case "VIEW":
        window.open(`${api.defaults.baseURL}/invoice/${uuid}/pdf`, "_blank");
        break;
    }
  };

  return (
    <>
      <Head>
        <title>Invoice | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>
              <Link href={`/client/membership/${id}/payment-and-invoices`}>
                Payment &amp; Invoices
              </Link>
            </h1>
            <h2>Invoice {ParseSmall(invoice?.uuid)}</h2>
          </div>

          <div>
            <SelectComponent
              placeHolder="Command Action"
              width={200}
              backgroundColor={theme.colors.darkGray}
              onChange={handleAction}
              options={[
                {
                  value: "PAY",
                  label: "Pay Invoice",
                },
                {
                  value: "VIEW",
                  label: "View Invoice",
                },
              ].filter((action) =>
                InvoiceStatusEnum[invoice.status] ===
                  InvoiceStatusEnum.FULLY_PAID && action.value === "PAY"
                  ? false
                  : true
              )}
            />
          </div>
        </PageHeader>

        <div>
          <TopRow>
            <Row gap={15}>
              <Row gap={15} bordered>
                <p>Invoice Date:</p>
                <time>{dateMask(invoice.date)}</time>
              </Row>
              <Row gap={15} bordered>
                <p>Invoice Due Date:</p>
                <time>{dateMask(invoice.due_date)}</time>
              </Row>
            </Row>

            <StatusContainer bgColor={InvoiceStatusColorEnum[invoice.status]}>
              {InvoiceStatusEnum[invoice.status]}
            </StatusContainer>
          </TopRow>

          <Content>
            <Row gap={15} align="stretch" wrap="wrap">
              <InfosBlock>
                <Row gap={15} align="stretch" wrap="wrap">
                  <InfoSection>
                    <div>
                      <InputComponent
                        placeholder="Customer Name"
                        value={`${invoice.user.first_name} ${invoice.user.last_name}`}
                        readOnly
                      />
                    </div>
                    <Row gap={15}>
                      <InputComponent
                        placeholder="Email"
                        value={invoice.user.email}
                        title={invoice.user.email}
                        readOnly
                      />

                      <InputComponent
                        placeholder="Phone"
                        value={invoice.user.personal_phone}
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
                        value={
                          invoice.user?.personalAddress?.fulltext ||
                          "Not defined"
                        }
                        title={
                          invoice.user?.personalAddress?.fulltext ||
                          "Not defined"
                        }
                        placeholder="Customer Address"
                        readOnly
                      />
                    </div>
                  </InfoSection>

                  <InfoSection>
                    <div>
                      <InputComponent
                        placeholder="Location Name"
                        value={invoice.location.name}
                        readOnly
                      />
                    </div>
                    <Row gap={15}>
                      <InputComponent
                        placeholder="Email"
                        value={invoice.location.email ?? "Not informed"}
                        title={invoice.location.email ?? ""}
                        readOnly
                      />
                      <InputComponent
                        placeholder="Phone"
                        value={invoice.location.phone ?? "Not informed"}
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
                        placeholder="Location Address"
                        value={invoice.location.address.fulltext ?? ""}
                        title={invoice.location.address.fulltext ?? ""}
                        readOnly
                      />
                    </div>
                  </InfoSection>
                </Row>

                <section>
                  <StyledTable
                    columns={columns}
                    data={tableData ?? []}
                    editable
                  />
                </section>

                <Row gap={15} align="stretch" wrap="wrap">
                  <BorderedSection>
                    <header>
                      <h3>Invoice Notes:</h3>
                    </header>
                    <div>
                      <p>{invoice.additional_notes ?? "None"}</p>
                    </div>
                  </BorderedSection>

                  <SummarySection>
                    <div>
                      <p>Subtotal:</p>
                      <span>
                        {Money({ amount: invoice.subtotal }).toFormat(
                          "$0,0.00"
                        )}
                      </span>
                    </div>

                    <div>
                      <p>Taxes &amp; Fees:</p>
                      <span>
                        {Money({ amount: invoice.total_taxes }).toFormat(
                          "$0,0.00"
                        )}
                      </span>
                    </div>

                    {invoice.status == "OVERDUE" && (
                      <div>
                        <p>Taxes Overdue:</p>
                        <span>
                          {Money({
                            amount: invoice.total_taxes_overdue,
                          }).toFormat("$0,0.00")}
                        </span>
                      </div>
                    )}

                    <hr />
                    <div>
                      <p>Total:</p>
                      <span>
                        {Money({ amount: invoice.total }).toFormat("$0,0.00")}
                      </span>
                    </div>
                  </SummarySection>
                </Row>
              </InfosBlock>

              <ActivitySection>
                <header>
                  <h3>Invoice Activity Track</h3>
                </header>
                <ActivitiesSection>
                  <ActivityElement
                    title="Invoice Sent:"
                    text="Sent on"
                    date={invoice.date}
                    isLastChild={!invoice.historic?.length}
                  />

                  {!!invoice.historic.length && (
                    <ActivityElement
                      title={`Invoice Payments:`}
                      isLastChild={true}
                    >
                      {invoice.historic
                        .sort((a, b) => {
                          return (
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                          );
                        })
                        .map((item, index) => (
                          <PaymentElement key={item.payment_id}>
                            <p>
                              Payment ID: <strong>#{item.payment_id}</strong>
                            </p>
                            <p>
                              Paid{" "}
                              <strong>
                                {Money({ amount: item.amount }).toFormat(
                                  "$0,0.00"
                                )}
                              </strong>{" "}
                              on{" "}
                              <strong>
                                <time>
                                  {formatDate(new Date(item.created_at))}
                                </time>
                              </strong>
                            </p>
                            <p>
                              Actual status{" "}
                              <strong>{PaymentStatusEnum[item.status]}</strong>
                            </p>
                          </PaymentElement>
                        ))}
                    </ActivityElement>
                  )}
                  {/* <ActivityElement
                title="Payment Deposits:"
                icon={
                  <svg width="21" height="21" viewBox="0 0 21 21">
                    <defs>
                      <clipPath>
                        <rect
                          width="21"
                          height="21"
                          transform="translate(-0.074 -0.095)"
                          fill="#2b3450"
                          stroke="#707070"
                          strokeWidth="1"
                        />
                      </clipPath>
                    </defs>
                    <g transform="translate(0.074 0.095)">
                      <g transform="translate(0 0.485)">
                        <path
                          d="M.727,3.394A1.939,1.939,0,0,1,2.666,1.455h.485a.485.485,0,0,1,0,.97H2.666a.97.97,0,0,0-.97.97v.97a.97.97,0,0,0,.97.97H17.21a.97.97,0,0,0,.97-.97v-.97a.97.97,0,0,0-.97-.97h-.485a.485.485,0,0,1,0-.97h.485A1.939,1.939,0,0,1,19.15,3.394v.97a1.93,1.93,0,0,1-.259.97h1.229a1.939,1.939,0,0,1,1.939,1.939V18.907a1.939,1.939,0,0,1-1.939,1.939H2.666A1.939,1.939,0,0,1,.727,18.907ZM1.7,6.043V18.907a.97.97,0,0,0,.97.97H20.119a.97.97,0,0,0,.97-.97V7.272a.97.97,0,0,0-.97-.97H2.666A1.93,1.93,0,0,1,1.7,6.043Z"
                          transform="translate(-0.727 -0.485)"
                          fill="#2b3450"
                          fillRule="evenodd"
                        />
                        <path
                          d="M11.636,9.939A1.939,1.939,0,0,1,13.576,8h4.363v.97H13.576a.97.97,0,0,0-.97.97v1.939a.97.97,0,0,0,.97.97h4.363v.97H13.576a1.939,1.939,0,0,1-1.939-1.939Z"
                          transform="translate(2.908 1.696)"
                          fill="#2b3450"
                          fillRule="evenodd"
                        />
                        <path
                          d="M7.515,1.7a3.64,3.64,0,0,0-3.58,4.278l-.955.17a4.606,4.606,0,1,1,9.068,0l-.955-.17A3.64,3.64,0,0,0,7.515,1.7Z"
                          transform="translate(0 -0.727)"
                          fill="#2b3450"
                          fillRule="evenodd"
                        />
                        <path
                          d="M9.383,1.7a3.621,3.621,0,0,0-1.5.321l-.4-.883a4.609,4.609,0,0,1,6.431,5.01l-.955-.17A3.639,3.639,0,0,0,9.383,1.7Z"
                          transform="translate(1.525 -0.727)"
                          fill="#2b3450"
                          fillRule="evenodd"
                        />
                      </g>
                    </g>
                  </svg>
                }
              >
                <PaymentElement>
                  <p>
                    Payment ID: <strong>#0</strong>
                  </p>
                  <p>
                    Paid <strong></strong> on{" "}
                    <strong>
                      <time>{dateMask(invoice.date)}</time>
                    </strong>
                  </p>
                </PaymentElement>
              </ActivityElement> */}
                </ActivitiesSection>
              </ActivitySection>
            </Row>
          </Content>
        </div>
      </div>
    </>
  );
};

InvoicePage.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <ClientLayout componentProps={componentProps}>
    <MemberLayout>{page}</MemberLayout>
  </ClientLayout>
);
export default InvoicePage;
