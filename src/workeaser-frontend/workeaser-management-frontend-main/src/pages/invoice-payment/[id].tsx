import { Button } from "@components/Button";
import { PaymentForm } from "@components/FormBlocks/PaymentFormBlock";
import { EditableCell } from "@components/Table/Cell/EditableCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  Container,
  Content,
  Header,
  InfoBlock,
  PaymentBlock,
  PaymentInfoSection,
  PaymentItem,
  PriceCard,
  PriceSummarySection,
  SubmitButtonContainer,
  SummarySection,
  TableContainer,
  TableFooterr,
  TableSection,
  TopSection,
  Wrapper,
} from "@styles/pages/invoice-payment";
import { Row } from "@styles/reusable";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { ParseSmall } from "@utils/helpers";
import { dateMask } from "@utils/masks";
import { formatDate } from "@utils/numberFormat";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlaidLinkOnSuccess } from "react-plaid-link";
import { ColumnInstance, Row as RowType } from "react-table";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { InvoiceStatusEnum } from "types/enums";
import { User } from "types/user";
import { WalletData, WalletResponse } from "types/wallet";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);

  const apiClient = getAPIClient(context);

  const { id } = context.params;
  const { membershipId } = context.query;

  const { data } = await apiClient.get(`/invoice/${id}`);

  let wallet: WalletData = null;
  let user: User = null;
  if (token) {
    const userPromise = apiClient.get("/me");
    const walletPromise = apiClient.get<WalletResponse>("/wallet");
    const [{ data: userResponse }, { data: walletResponse }] =
      await Promise.all([userPromise, walletPromise]);
    user = userResponse.result[0];
    wallet = walletResponse.result;
  }

  return {
    props: {
      fallback: { [`/invoice/${id}`]: data },
      wallet,
      user,
      membershipId: membershipId ?? null,
    },
  };
};

interface PaymentArrayType {
  invoice_item_id: number;
  amount: number;
  maxAmount: number;
}
interface BankInfos {
  public_token: string;
  account_id: string;
  bankName: string;
}
type Navigation = "CARD" | "BANK_ACCOUNT";

interface InvoicePaymentProps {
  fallback: Fallback;
  wallet?: WalletData;
  user?: User;
  membershipId?: number;
}
const InvoicePayment = ({
  fallback,
  user,
  wallet,
  membershipId,
}: InvoicePaymentProps) => {
  const router = useRouter();
  const elements = useElements();
  const stripe = useStripe();

  const [paymentArray, setPaymentArray] = useState<
    { items: PaymentArrayType }[]
  >([]);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<Navigation>("CARD");
  const [isLoading, setIsLoading] = useState(false);
  const [bankConnected, setBankConnected] = useState<BankInfos>();

  const formRef = useRef<FormHandles>(null);

  const { id } = router.query;

  const { data: { result: invoice } = {}, mutate } = useFetch(
    `/invoice/${id}`,
    { fallback }
  );

  let paymentItems;

  paymentItems = invoice?.items?.map((item) => ({
    items: {
      invoice_item_id: item.id,
      amount: item.unit_price,
      maxAmount: item.unit_price,
    },
  }));

  invoice?.iniFees.map((item) => {
    paymentItems.push({
      items: {
        invoice_item_id: item.invoice_id, // completly wrong, this doesnt work.
        amount: item.value,
        maxAmount: item.value,
      },
    });
  });

  paymentItems.push({
    items: {
      invoice_item_id: invoice.id, // completly wrong, this doesnt work.
      amount: invoice.total_taxes,
      maxAmount: invoice.total_taxes,
    },
  });

  if (invoice.status === "Overdue") {
    paymentItems.push({
      items: {
        invoice_item_id: invoice.id, // completly wrong, this doesnt work.
        amount: invoice.total_taxes_overdue,
        maxAmount: invoice.total_taxes_overdue,
      },
    });
  }

  useEffect(() => {
    setPaymentArray(paymentItems);
  }, [invoice]);

  useEffect(() => {
    if (paymentArray) {
      setTotal(
        paymentArray.reduce(
          (acc, currentValue) => acc + currentValue.items.amount,
          0
        )
      );
    }
  }, [paymentArray]);

  const handleSubmit: SubmitHandler = async (data) => {
    const { payment_card_id, payment_bank_id } = data;
    try {
      setIsLoading(true);

      const items = paymentArray.reduce(
        (acc, payment) =>
          payment.items.amount > 0
            ? [
                ...acc,
                {
                  invoice_item_id: payment.items.invoice_item_id,
                  amount: payment.items.amount,
                },
              ]
            : acc,
        []
      );

      if (!items.length) {
        throw new Error("Nothing to pay");
      }

      if (activeTab === "CARD") {
        console.log({ payment_card_id });
        if (payment_card_id) {
          const body = {
            payment_method: activeTab,
            card_id: payment_card_id,
            items,
          };

          await api.post(`/invoice/${id}`, body);
          toast.success("Payment successful.");
          return;
        }

        if (!stripe || !elements) {
          return;
        }

        const card = elements.getElement(CardElement);

        if (!card) {
          throw new Error("Card Element not found");
        }

        const { error, token } = await stripe.createToken(card);

        if (error) {
          throw new Error(error.message);
        }

        const body = {
          payment_method: activeTab,
          token: token.id,
          items,
        };

        await api.post(`/invoice/${id}`, body);
        toast.success("Payment successful.");
        mutate();
      } else {
        if (payment_bank_id) {
          const body = {
            payment_method: activeTab,
            bank_account_id: payment_bank_id,
            items,
          };

          await api.post(`/invoice/${id}`, body);
          toast.success("Payment successful.");
          return;
        }

        if (!bankConnected) {
          throw new Error("No account connected");
        }
        const { bankName, ...bankData } = bankConnected;

        const body = {
          payment_method: activeTab,
          items,
          ...bankData,
        };

        await api.post(`/invoice/${id}`, body);
        toast.success("Payment successful.");
        mutate();
      }
    } catch (err) {
      if (err.message) {
        toast.error(err.message);
      }
      if (err.response?.data) {
        if (!Array.isArray(err?.response?.data.error.message)) {
          toast.error(err?.response?.data.error.message);
        } else {
          err?.response?.data.error.message.forEach((message) => {
            toast.error(message.message);
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      const { accounts, institution } = metadata;
      setBankConnected({
        public_token: publicToken,
        account_id: accounts[0].id,
        bankName: institution.name,
      });
    },
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: "Service Date",
        accessor: "date",
        Cell: ({ value }) => formatDate(new Date(value)),
      },
      {
        Header: "Item",
        accessor: "service",
      },
      {
        Header: "Total Amount",
        accessor: "amount",
        className: "align__center",
        Cell: ({ value }) => Money({ amount: value }).toFormat("$0,0.00"),
      },
    ],
    []
  );

  let iniFeeDate = invoice?.items[0].date;

  const tableData = useMemo(
    () =>
      invoice?.items?.map((item) => ({
        date: item.date,
        service: item.name,
        amount: item.unit_price,
      })),
    [invoice]
  );

  invoice?.iniFees.map((item) => {
    tableData.push({
      date: iniFeeDate,
      service: item.name,
      amount: item.value,
    });
  });

  tableData.push({
    date: iniFeeDate,
    service: "Taxes & fees",
    amount: invoice.total_taxes,
  });

  if (invoice.status === "Overdue") {
    tableData.push({
      date: iniFeeDate,
      service: "Taxes overdue",
      amount: invoice.total_taxes_overdue,
    });
  }

  const summaryColumn = useMemo(
    () => [
      {
        Header: "Payment",
        accessor: "items",
        type: "currency",
        name: "items",
        className: "align__center",
        Cell: ({
          column,
          row,
          value,
        }: {
          row: RowType;
          column: ColumnInstance;
          value: PaymentArrayType;
        }) => (
          <EditableCell
            value={value.amount}
            maxvalue={value.maxAmount}
            column={column}
            row={row}
            updateMyData={updateMyData}
          />
        ),
      },
    ],
    []
  );

  const updateMyData = (rowIndex: number, columnId: string, value: string) => {
    setPaymentArray((old) =>
      old.map((row, index) =>
        index === rowIndex
          ? {
              ...old[rowIndex],
              [columnId]: {
                ...row.items,
                amount: parseInt(value),
              },
            }
          : row
      )
    );
  };

  // const Render

  return (
    <Wrapper>
      <Container>
        <Header>
          <figure>
            <Image
              src="/images/workeaser-logo.png"
              alt="workeaser logo"
              width={140}
              height={40}
            />
          </figure>

          {user && membershipId ? (
            <Link
              href={`/client/membership/${membershipId}/products-and-services`}
            >
              <span>{user.first_name}</span>
              <Thumbnail
                url={user.photo?.file}
                alt="profile picture"
                size={40}
                radius={20}
              />
            </Link>
          ) : (
            <div onClick={() => router.push("/login")}>
              <span>Log In</span>
              <svg width="26" height="26" viewBox="0 0 26 26">
                <g transform="translate(-1203 -33)">
                  <g
                    transform="translate(1203 33)"
                    fill="#fff"
                    stroke="#1a1c20"
                    strokeWidth="1"
                  >
                    <circle cx="13" cy="13" r="13" stroke="none" />
                    <circle cx="13" cy="13" r="12.5" fill="none" />
                  </g>
                  <g transform="translate(1204 34.5)">
                    <path
                      d="M17.806,26.927V25.451A2.951,2.951,0,0,0,14.854,22.5h-5.9A2.951,2.951,0,0,0,6,25.451v1.476"
                      transform="translate(0 -9.146)"
                      fill="none"
                      stroke="#000"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                    />
                    <path
                      d="M17.9,7.451A2.951,2.951,0,1,1,14.951,4.5,2.951,2.951,0,0,1,17.9,7.451Z"
                      transform="translate(-3.049)"
                      fill="none"
                      stroke="#000"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                    />
                  </g>
                </g>
              </svg>
            </div>
          )}
        </Header>

        <Content>
          <Form ref={formRef} onSubmit={handleSubmit}>
            <InfoBlock>
              <TopSection>
                <div>
                  <h1>{invoice.coworking_name}</h1>
                  <h2>{invoice.location_address}</h2>
                </div>

                <div>
                  <StatusContainer>{invoice.status}</StatusContainer>
                  <p>
                    Balance Due:{" "}
                    <strong>
                      {Money({ amount: invoice.open_amount }).toFormat(
                        "$0,0.00"
                      )}
                    </strong>
                  </p>
                </div>
              </TopSection>

              <TableSection>
                <TableContainer>
                  <StyledTable
                    columns={columns}
                    data={tableData ?? []}
                    editable
                  />

                  <StyledTable
                    columns={summaryColumn}
                    data={paymentArray ?? []}
                    editable
                    //bordered
                    theme="blue"
                    className="summary__table"
                  />
                </TableContainer>

                <TableFooterr>
                  <Row gap={10}>
                    <p>Total Payment:</p>
                    <PriceCard>
                      <span>
                        {" "}
                        {Money({ amount: invoice.amount }).toFormat("$0,0.00")}
                      </span>
                    </PriceCard>
                  </Row>
                </TableFooterr>
              </TableSection>

              <PaymentInfoSection>
                <PaymentForm
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onBankSuccess={onSuccess}
                  bankName={bankConnected?.bankName}
                  cards={wallet?.cards}
                  bankAccounts={wallet?.bank_accounts}
                />
              </PaymentInfoSection>

              <footer>
                <p>
                  © 2022 Workeaser Inc. All rights reserved. Privacy Policy |
                  Terms of Use.
                </p>
              </footer>
            </InfoBlock>
            <PaymentBlock>
              <SummarySection>
                <header>
                  <figure>
                    {invoice?.coworking_logo ? (
                      <Image
                        src={`${api.defaults.baseURL}/photos/${invoice.coworking_logo}`}
                        alt="coworking logo"
                        width={150}
                        height={80}
                        objectFit="contain"
                      />
                    ) : (
                      <Image
                        src="/images/workeaser-logo.png"
                        alt="coworking logo"
                        width={150}
                        height={80}
                        objectFit="contain"
                      />
                    )}
                  </figure>
                  <h2>{invoice.coworking_name}</h2>
                </header>
                <PriceSummarySection>
                  <Row>
                    <p>Invoice Number:</p>
                    <span>
                      <strong>{ParseSmall(invoice.uuid)}</strong>
                    </span>
                  </Row>
                  <Row>
                    <p>Due Date:</p>
                    <span>
                      <strong>{dateMask(invoice.due_date)}</strong>
                    </span>
                  </Row>
                  <Row>
                    <p>Invoice Amount:</p>
                    <span>
                      <strong>
                        {Money({ amount: invoice.amount }).toFormat("$0,0.00")}
                      </strong>
                    </span>
                  </Row>

                  {invoice.payments?.map((payment, index) => (
                    <PaymentItem
                      key={`${index}-${payment.amount}-${payment.date}`}
                      className={index !== 0 ? "margin" : ""}
                    >
                      <p>
                        Payment of{" "}
                        <strong>
                          {Money({ amount: payment.amount }).toFormat(
                            "$0,0.00"
                          )}
                        </strong>{" "}
                        on <strong>{dateMask(payment.date)}</strong>
                      </p>
                    </PaymentItem>
                  ))}

                  <Row>
                    <p>Open Amount:</p>
                    <span>
                      <strong>
                        {Money({ amount: invoice.open_amount }).toFormat(
                          "$0,0.00"
                        )}
                      </strong>
                    </span>
                  </Row>
                </PriceSummarySection>

                <footer>
                  <a
                    href={`${api.defaults.baseURL}/invoice/${id}/pdf`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Button text="VIEW INVOICE" color="secondary" />
                  </a>
                </footer>
              </SummarySection>

              <SubmitButtonContainer>
                <Button
                  type="submit"
                  text={
                    invoice.status === InvoiceStatusEnum.FULLY_PAID
                      ? "INVOICE FULLY PAID"
                      : "PAY INVOICE"
                  }
                  loading={isLoading}
                  disabled={invoice.status === InvoiceStatusEnum.FULLY_PAID}
                  className={isLoading ? "loading" : ""}
                />
              </SubmitButtonContainer>
            </PaymentBlock>
          </Form>
        </Content>
      </Container>
    </Wrapper>
  );
};

InvoicePayment.authRoles = ["UNAUTH"];
export default InvoicePayment;
