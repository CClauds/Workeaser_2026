import { ActivityElement } from "@components/ActivityElement";
import { InputComponent } from "@components/FormElements/Input";
import { SelectComponent } from "@components/FormElements/Select";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { PaymentModal } from "@components/Modals/PaymentModal";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { getAPIClient } from "@services/apiClient";
import {
  ActivitiesSection,
  ActivitySection,
  BorderedSection,
  Content,
  InfosBlock,
  InfoSection,
  PaymentElement,
  SummarySection,
  TopRow,
} from "@styles/pages/finances/invoices/single";
import { Row } from "@styles/reusable";
import { ParseSmall } from "@utils/helpers";
import { dateMask } from "@utils/masks";
import { formatDate, formatDateNew } from "@utils/numberFormat";
import Money from "dinero.js";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo, useState } from "react";
import { useTheme } from "styled-components";
import { Fallback, OptionType } from "types";
import { InvoiceStatusEnum } from "types/cowork/financial/enums";
import {
  InvoiceFee,
  InvoiceInfoResponse,
  InvoiceItem,
} from "types/cowork/financial/invoices";
import {
  InvoiceActionsEnum,
  InvoiceStatusColorEnum,
  PaymentStatusEnum,
} from "types/enums";

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

  const { id } = context.params;

  if (id) {
    const apiClient = getAPIClient(context);
    try {
      const { data: invoice } = await apiClient.get<InvoiceInfoResponse>(
        `/cowork/finance/invoices/info/${id}`
      );
      return {
        props: {
          fallback: {
            [`/cowork/finance/invoices/info/${id}`]: invoice,
          },
        },
      };
    } catch (error) {
      return {
        props: {
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

type InvoiceActions = keyof typeof InvoiceActionsEnum;

interface InvoicePageProps {
  fallback: Fallback;
}
const InvoicePage = ({ fallback }: InvoicePageProps) => {
  const router = useRouter();
  const theme = useTheme();
  const { id } = router.query;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<InvoiceActions>();

  const { data: { result: invoice } = {} } = useFetch<InvoiceInfoResponse>(
    id ? `/cowork/finance/invoices/info/${id}` : null,
    { fallback }
  );

  const handleAction = (option: OptionType) => {
    setSelectedAction(option.value as InvoiceActions);
    setIsModalOpen(true);
  };

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
      // {
      //   Header: "Taxes & Fees",
      //   accessor: "taxesAndFees",
      //   className: "align__center",
      //   Cell: ({ value }) => (
      //     <span>{Money({ amount: value }).toFormat("$0,0.00")}</span>
      //   ),
      // },
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

  let iniFeeDate = invoice?.items[0].date;
  let tableData = [
    {
      date: "00/00/00",
      name: "",
      quantity: 0,
      unit_price: 0,
      total_amount: 0,
    },
  ];

  tableData = useMemo(() => {
    const services = invoice.items.map((item) => ({
      date: dateMask(item.date),
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      // taxesAndFees: item.total_taxes + item.total_taxes_overdue,
      total_amount: item.unit_price,
    }));

    const fees = invoice.items.map((item) =>
      item.fees.map((fee) => ({
        date: formatDateNew(fee.created_at),
        name: fee.name,
        quantity: 1,
        unit_price: fee.value,
        taxesAndFees: fee.value,
        total_amount: fee.value + calculateFeeTaxesPrice(fee),
      }))
    );

    // console.log({ feesFlat: fees.flat() });

    return [...services];
  }, [invoice]);

  invoice?.iniFees.map((item) => {
    tableData.push({
      date: dateMask(iniFeeDate),
      name: item.name,
      quantity: 1,
      unit_price: item.value,
      total_amount: item.value,
    });
  });

  return (
    <>
      <Head>
        <title>Invoices | Workeaser</title>
      </Head>
      <PageHeader>
        <div>
          <h1>
            <Link href="/finances/dashboard">Finances</Link>
          </h1>
          <h2>
            <Link href="/finances/invoices">Invoices</Link>
          </h2>
          <h2>Invoice {ParseSmall(invoice?.uuid)}</h2>
        </div>

        <div>
          <SelectComponent
            placeHolder="Command Action"
            width={200}
            backgroundColor={theme.colors.darkGray}
            onChange={handleAction}
            options={Object.keys(InvoiceActionsEnum).map((item) => ({
              value: item,
              label: InvoiceActionsEnum[item],
            }))}
          />
        </div>
      </PageHeader>

      {invoice ? (
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
                        value={`${invoice.user.first_name} ${invoice.user.last_name}`}
                        readOnly
                      />
                    </div>
                    <Row gap={15}>
                      <InputComponent
                        value={invoice.user.email}
                        title={invoice.user.email}
                        readOnly
                      />

                      <InputComponent
                        value={invoice.user.personal_phone}
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
                        value={
                          invoice.user?.personalAddress?.fulltext ??
                          "Not informed"
                        }
                        readOnly
                      />
                    </div>
                  </InfoSection>

                  <InfoSection>
                    <div>
                      <InputComponent value={invoice.location.name} readOnly />
                    </div>
                    <Row gap={15}>
                      <InputComponent
                        value={invoice.location.email ?? "Not informed"}
                        title={invoice.location.email ?? ""}
                        readOnly
                      />

                      <InputComponent
                        value={invoice.location.phone ?? "Not informed"}
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
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

                    {/* <div>
                      <p>Taxes &amp; Fees:</p>
                      <span>
                        {Money({
                          amount: calculateTaxesAndFeesPrice(invoice.items),
                        }).toFormat("$0,0.00")}
                      </span>
                    </div> */}

                    {/* <div>
                    <p>Taxes:</p>
                    <span>
                      {Money({
                        amount: calculateTaxesPrice(invoice.items[0].fees),
                      }).toFormat("$0,0.00")}
                    </span>
                  </div> */}

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
                        {Money({
                          amount: invoice.total,
                          // amount: invoice.total + invoice.total_taxes,
                        }).toFormat("$0,0.00")}
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

                  {/* <ActivityElement
                title="Invoice Viewed:"
                text="Latest Visualization"
                date={invoice.date}

              /> */}
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
      ) : null}

      <PaymentModal
        initialData={{
          uuid: invoice.uuid,
          user_uuid: invoice?.user?.uuid,
          status: invoice.status,
          due_date: invoice.due_date,
          total: invoice.total,
        }}
        action={selectedAction}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const calculateTaxesAndFeesPrice = (items: InvoiceItem[]) => {
  const total = items.reduce((total, item) => {
    return total + item.total_taxes;
  }, 0);
  return total;
};
const calculateFeesPrice = (fees: InvoiceFee[]) => {
  fees.reduce((total, fee) => {
    return total + fee.value;
  }, 0);
};

const calculateTaxesPrice = (fees: InvoiceFee[]) =>
  fees.reduce(
    (total, fee) =>
      total +
      fee?.taxes?.reduce(
        (totalTaxes, tax) =>
          tax.method === "FIXED"
            ? totalTaxes + tax.value
            : totalTaxes +
              Money({
                amount: fee.value,
              })
                .percentage(tax.value / 100)
                .getAmount(),
        0
      ),

    0
  );

const calculateFeeTaxesPrice = (fee: InvoiceFee) =>
  fee?.taxes?.reduce(
    (totalTaxes, tax) =>
      tax.method === "FIXED"
        ? totalTaxes + tax.value
        : totalTaxes +
          Money({
            amount: fee.value,
          })
            .percentage(tax.value / 100)
            .getAmount(),
    0
  );

InvoicePage.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);
export default InvoicePage;
