import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { EditableCell } from "@components/Table/Cell/EditableCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { api } from "@services/api";
import { Row } from "@styles/reusable";
import { FormHandles, SubmitHandler } from "@unform/core";
import { capitalizeFirstLetter, ParseSmall } from "@utils/helpers";
import { formatDate } from "@utils/numberFormat";
import axios, { AxiosError } from "axios";
import Money from "dinero.js";
import { useFetch } from "hooks/useFetch";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "react-modal";
import { ColumnInstance, Row as RowType } from "react-table";
import { toast } from "react-toastify";
import { KeyedMutator } from "swr";
import {
  InvoiceActionsEnum,
  InvoiceStatusEnum,
} from "types/cowork/financial/enums";
import {
  InvoiceInfoResponse,
  InvoicesResponse,
} from "types/cowork/financial/invoices";
import { InvoiceStatusColorEnum } from "types/enums";

import { NEW_CARD_VALUE } from "@utils/constants";
import { OptionType } from "types/form";
import { WalletResponse } from "types/wallet";
import * as Yup from "yup";
import {
  AmountCard,
  AmountCardsContainer,
  ButtonContainer,
  Content,
  Form,
  Intersection,
  PaymentContainer,
  PaymentFooter,
  PaymentForm,
  PriceCard,
  RadioButton,
  SummaryContainer,
  TableContainer,
} from "./styles";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ThemeContext } from "styled-components";
import styles from "./styles.module.scss";

interface PaymentArrayType {
  invoice_item_id?: number;
  invoice_ini_fee_id?: number;
  amount: number;
  maxAmount: number;
}
interface PaymentOption {
  payment_id: number;
  id: number;
  type: string;
  nickname: string;
  name: string;
  firstInfo: string;
  secondInfo: string;
}
interface FormData {
  payment_id: number;
  card_nickname: string;
  card_name: string;
  name: string;
  option_first_info: string;
  option_second_info: string;
  items: string[];
}
type ActionType = keyof typeof InvoiceActionsEnum;

export interface InitialInvoiceData {
  id?: number;
  uuid: string;
  status: string;
  due_date: string;
  total: number;
  open_amount?: number;
  user_uuid: string;
}

interface ApiError {
  error: {
    message: string | { message: string }[];
  };
}
interface TableDataFees {
  date: string;
  service: string;
  amount: number;
}
interface PaymentModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  initialData: InitialInvoiceData;
  action: ActionType;
  setReload?: Dispatch<SetStateAction<boolean>>;
  invoiceMutate?: KeyedMutator<any>;
  invoiceNextPageMutate?: KeyedMutator<InvoicesResponse>;
}
export const PaymentModal: React.FC<PaymentModalProps> = ({
  initialData,
  action,
  setReload,
  invoiceMutate,
  invoiceNextPageMutate,
  isOpen,
  onRequestClose,
}) => {
  const [isNewCard, setIsNewCard] = useState<boolean>(false);

  const [paymentArray, setPaymentArray] = useState<
    { items: PaymentArrayType }[]
  >([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [selectedPaymentOption, setSelectedPaymentOption] =
    useState<PaymentOption>();
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number>(null);
  const [refundItemError, setRefundItemError] = useState(false);
  const elements = useElements();
  const stripe = useStripe();
  const themeContext = useContext(ThemeContext);

  const { data: { result: invoice } = {}, mutate } =
    useFetch<InvoiceInfoResponse>(
      initialData ? `/cowork/finance/invoices/info/${initialData.uuid}` : null
    );
  const { data: { result: paymentAccount } = {} } = useFetch<WalletResponse>(
    action === "CAPTURE_PAYMENT" && initialData
      ? `cowork/finance/invoices/userpaymentmethods/${initialData.user_uuid}`
      : null
  );

  const formRef = useRef<FormHandles>(null);

  useEffect(() => {
    if (isOpen) {
      setRefundItemError(false);
      setIsLoading(false);
      setSelectedItem(null);
      if (invoice) {
        const totalPaymentsArray =
          invoice?.items?.map((item) => ({
            items: {
              invoice_item_id: item.id,
              amount: item.total_amount,
              maxAmount: item.total_amount,
            },
          })) || [];

        const iniFees =
          invoice?.iniFees?.map((item) => ({
            items: {
              invoice_ini_fee_id: item.id,
              amount: item.value,
              maxAmount: item.value,
            },
          })) || [];

        setPaymentArray([...totalPaymentsArray, ...iniFees]);
      }
    }
  }, [invoice, isOpen]);

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

  useEffect(() => {
    if (paymentAccount) {
      const paymentMergedOptions = [
        ...paymentAccount.cards.map((card) => ({
          payment_id: card.id,
          type: "CARD",
          nickname: card.nickname,
          name: card.cardholder_name,
          firstInfo: String(card.exp_year),
          secondInfo: String(card.exp_month),
        })),
        ...paymentAccount.bank_accounts.map((account) => ({
          payment_id: account.id,
          type: "BANK_ACCOUNT",
          nickname: account.nickname,
          name: account.holder_name,
          firstInfo: account.routing_number,
          secondInfo: account.last_digits,
        })),
      ];

      setPaymentOptions(
        paymentMergedOptions.map((option, index) => ({
          ...option,
          id: index,
        }))
      );
    }
  }, [paymentAccount]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        payment_id:
          action === "CAPTURE_PAYMENT"
            ? Yup.string().required("Payment Required")
            : null,
        card_nickname:
          action === "CAPTURE_PAYMENT" &&
          isNewCard &&
          Yup.string().required("Payment nickname is required"),
        card_name:
          action === "CAPTURE_PAYMENT" &&
          isNewCard &&
          Yup.string().required("Card Name is required"),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      if (action === "CAPTURE_PAYMENT") {
        const body = {
          payment_method: isNewCard ? "CARD" : selectedPaymentOption.type,
          ...(isNewCard
            ? {
                card: {
                  name: data.card_name,
                  nickname: data.card_nickname,
                },
              }
            : {
                [selectedPaymentOption.type === "CARD"
                  ? "card_id"
                  : "bank_account_id"]: selectedPaymentOption.payment_id,
              }),
          items: paymentArray.reduce(
            (acc, payment) =>
              payment.items.amount > 0
                ? [
                    ...acc,
                    {
                      invoice_item_id: payment.items.invoice_item_id,
                      invoice_ini_fee_id: payment.items.invoice_ini_fee_id,
                      amount: payment.items.amount,
                    },
                  ]
                : acc,
            []
          ),
        } as {
          payment_method: string;
          items: any[];
          card?: {
            number: string;
            name: string;
            year: string;
            month: string;
          };
          card_id?: string;
          bank_account_id?: string;
        };

        if (isNewCard) {
          if (!stripe || !elements) {
            return;
          }

          const card = elements.getElement(CardElement);

          if (!card) {
            throw new Error("Card Element not found");
          }

          const { error, token } = await stripe.createToken(card, {
            name: data.card_name,
          });

          if (error) {
            throw new Error(error.message);
          }

          await api.post(
            `/cowork/finance/invoices/capturepayment/${initialData.uuid}`,
            {
              ...body,
              card: {
                nickname: data.card_nickname,
                token: token.id,
              },
            }
          );
          toast.success(
            `The Payment to invoice ${ParseSmall(initialData.uuid)} captured.`
          );
          formRef.current.reset();
          handleRequestClose();
          return;
        }

        await api.post(
          `/cowork/finance/invoices/capturepayment/${initialData.uuid}`,
          body
        );
        toast.success(
          `The Payment to invoice ${ParseSmall(initialData.uuid)} captured.`
        );
      } else if (action === "RECEIVE_PAYMENT") {
        const body = {
          items: paymentArray.reduce(
            (acc, payment) =>
              payment.items.amount > 0
                ? [
                    ...acc,
                    {
                      invoice_item_id: payment.items.invoice_item_id,
                      invoice_ini_fee_id: payment.items.invoice_ini_fee_id,
                      amount: payment.items.amount,
                    },
                  ]
                : acc,
            []
          ),
        };

        await api.post(
          `/cowork/finance/invoices/receivepayment/${initialData.uuid}`,
          body
        );
        toast.success("Payment received.");
      } else {
        if (selectedItem === null) {
          setRefundItemError(true);
          throw new Error("Select Payment Item");
        }

        const body = {
          payment_id: invoice.payments[selectedItem].id,
        };

        await api.post(
          `/cowork/finance/invoices/refundpayment/${initialData.uuid}`,
          body
        );
        toast.success("Payment refunded.");
      }
      if (setReload) {
        setReload(true);
        invoiceNextPageMutate();
      }
      if (invoiceMutate) {
        invoiceMutate();
      }
      mutate();
      setIsLoading(false);
      handleRequestClose();
    } catch (err) {
      setIsLoading(false);
      console.log(err);

      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          console.log(error.message);
          validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
        return;
      }
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<ApiError>;
        if (!Array.isArray(error.response.data.error.message)) {
          toast.error(error.response.data.error.message);
          return;
        }

        error.response.data.error.message.forEach((message) => {
          toast.error(message.message);
        });
        return;
      }

      if (err.message) {
        toast.error(err.message);
        return;
      }
    }
  };

  const handleCardChange = (option: OptionType) => {
    if (option && paymentOptions) {
      if (option.value === NEW_CARD_VALUE) {
        formRef.current.clearField("card_nickname");
        formRef.current.clearField("card_name");
        formRef.current.clearField("name");
        formRef.current.clearField("option_first_info");
        formRef.current.clearField("option_second_info");
        setSelectedPaymentOption(null);
        setIsNewCard(true);
        return;
      }

      const selectedPaymentOption = paymentOptions.find(
        (paymentOption) => paymentOption.id === option.value
      );
      console.log("selected", selectedPaymentOption);
      if (selectedPaymentOption) {
        console.log(
          "after selected -> ",
          selectedPaymentOption.name,
          formRef?.current
        );
        setIsNewCard(false);
        setSelectedPaymentOption(selectedPaymentOption);
        formRef.current.setFieldValue("name", selectedPaymentOption.name);
        formRef.current.setFieldValue(
          "option_first_info",
          selectedPaymentOption.firstInfo
        );
        formRef.current.setFieldValue(
          "option_second_info",
          selectedPaymentOption.secondInfo
        );
        return;
      }
    }
    console.log("render here =(");
    setIsNewCard(false);
    setSelectedPaymentOption(null);
    formRef.current.clearField("card_nickname");
    formRef.current.clearField("card_name");
    formRef.current.clearField("name");
    formRef.current.clearField("option_first_info");
    formRef.current.clearField("option_second_info");
  };

  const handleRefundChange = (index: number) => () => {
    setRefundItemError(false);
    setSelectedItem(index);
    setTotal(invoice.payments[index].amount);
  };

  const columns = useMemo(
    () => [
      {
        Header: "Service Date",
        accessor: "date",
        Cell: ({ value }) => formatDate(new Date(value)),
      },
      {
        Header: "Product/Service",
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

  const tableData: TableDataFees[] = useMemo(
    () => [
      ...(invoice?.items?.map((item) => ({
        date: item.date,
        service: item.name,
        amount: item.total_amount,
      })) || []),
      ...(invoice?.iniFees?.map((fee) => ({
        date: fee.created_at,
        service: fee.name,
        amount: fee.value,
      })) || []),
    ],
    [invoice]
  );

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

  const handleRequestClose = () => {
    setPaymentArray([]);
    onRequestClose();
  };

  const options = {
    hidePostalCode: true,
    style: {
      base: {
        fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
        color: themeContext.colors.blue800,
        "::placeholder": {
          color: "rgba(43, 52, 80, 0.3)",
        },
      },
      invalid: {
        iconColor: themeContext.colors.notifyFail,
        color: themeContext.colors.notifyFail,
      },
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={handleRequestClose} />

      <header>
        <h1>{capitalizeFirstLetter(InvoiceActionsEnum[action])}</h1>
      </header>

      {!initialData ? (
        <h1>loading</h1>
      ) : (
        <Content>
          <Intersection>
            <p>
              <strong>Invoice: {ParseSmall(initialData.uuid)}</strong>
            </p>
            <hr />
            <StatusContainer
              bgColor={InvoiceStatusColorEnum[initialData?.status]}
            >
              {InvoiceStatusEnum[initialData?.status]}
            </StatusContainer>
          </Intersection>

          <SummaryContainer>
            <Row>
              <p>Due Date:</p>
              <time>{formatDate(new Date(initialData.due_date))}</time>
            </Row>
            <Row>
              <p>Original Amount</p>
              <span>
                {Money({ amount: initialData.total }).toFormat("$0,0.00")}
              </span>
            </Row>
            <Row>
              <p>Open Amount</p>

              <span>
                {Money({ amount: invoice?.open_amount ?? 0 }).toFormat(
                  "$0,0.00"
                )}
              </span>
            </Row>

            <hr />
          </SummaryContainer>

          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            initialData={{ refund: Money({ amount: 0 }).toFormat("$0,0.00") }}
          >
            {invoice ? (
              <TableContainer>
                <StyledTable columns={columns} data={tableData} editable />

                {action === "REFUND_PAYMENT" ? null : (
                  <StyledTable
                    columns={summaryColumn}
                    data={paymentArray}
                    editable
                    bordered
                    theme="blue"
                    className="summary__table"
                  />
                )}
              </TableContainer>
            ) : null}

            <PaymentContainer>
              {action === "CAPTURE_PAYMENT" ? (
                <PaymentForm>
                  <Select
                    instanceId="payment_id"
                    name="payment_id"
                    placeholder="Select the payment method..."
                    onChange={handleCardChange}
                    isLoading={!paymentOptions}
                    options={[
                      {
                        value: NEW_CARD_VALUE,
                        label: "Add New Card",
                      },
                      ...(paymentOptions
                        ? paymentOptions?.map((option) => ({
                            value: option.id,
                            label: option.nickname,
                          }))
                        : []),
                    ]}
                  />
                  {isNewCard && (
                    <>
                      <Input
                        name="card_nickname"
                        placeholder="Payment Nickname"
                      />
                      <Input name="card_name" placeholder="Card Holder Name" />
                      <CardElement
                        options={options}
                        className={styles.cardInput}
                      />
                    </>
                  )}
                  {!isNewCard && selectedPaymentOption && (
                    <>
                      <Input
                        name="name"
                        value={selectedPaymentOption?.name || ""}
                        placeholder={
                          selectedPaymentOption?.type === "BANK_ACCOUNT"
                            ? "Holder name"
                            : "Name on the card"
                        }
                        disabled={true}
                      />
                      <Row gap={15}>
                        <Input
                          name="option_first_info"
                          value={selectedPaymentOption?.firstInfo || ""}
                          placeholder={
                            selectedPaymentOption?.type === "BANK_ACCOUNT"
                              ? "Routing Number"
                              : "Year"
                          }
                          textAlign="left"
                          mask="year"
                          disabled={true}
                        />
                        <Input
                          name="option_second_info"
                          value={selectedPaymentOption?.secondInfo || ""}
                          placeholder={
                            selectedPaymentOption?.type === "BANK_ACCOUNT"
                              ? "Last Digits"
                              : "Month"
                          }
                          type="text"
                          textAlign="left"
                          mask="month"
                          disabled={true}
                        />
                      </Row>
                    </>
                  )}
                </PaymentForm>
              ) : action === "RECEIVE_PAYMENT" ? (
                <PaymentFooter>
                  <p>
                    * Only use receive payment once you have received any
                    payment from an external source, like cash, Zelle, and
                    check.
                  </p>
                </PaymentFooter>
              ) : null}

              <div>
                <AmountCardsContainer>
                  {invoice?.payments.map((item, index) => (
                    <AmountCard
                      key={item.id}
                      clickable={action === "REFUND_PAYMENT"}
                      onClick={handleRefundChange(index)}
                    >
                      <div>
                        <p>
                          Payment ID: <strong>#{item.id}</strong>
                        </p>
                        <p>
                          Paid{" "}
                          <strong>
                            {Money({ amount: item?.amount ?? 0 }).toFormat(
                              "$0,0.00"
                            )}
                          </strong>{" "}
                          on{" "}
                          <strong>
                            {formatDate(new Date(item.created_at))}
                          </strong>
                        </p>
                      </div>

                      {action === "REFUND_PAYMENT" ? (
                        <RadioButton
                          isActive={selectedItem === index}
                          error={refundItemError}
                        />
                      ) : // <Input
                      //   name="refund"
                      //   mask="currency"
                      //   width={100}
                      //   backgroundColor="white"
                      //   className="text__center"
                      // />
                      null}
                    </AmountCard>
                  ))}
                </AmountCardsContainer>
                <Row>
                  <p className="form__text">
                    {action === "CAPTURE_PAYMENT"
                      ? "Total Payment:"
                      : action === "RECEIVE_PAYMENT"
                      ? "Total Receivement:"
                      : "Total Refund Amount:"}
                  </p>
                  <PriceCard>
                    <span>
                      {Money({ amount: invoice?.total ?? 0 }).toFormat(
                        "$0,0.00"
                      )}
                    </span>
                  </PriceCard>
                </Row>
              </div>
            </PaymentContainer>

            <ButtonContainer>
              <Button
                type="submit"
                text={InvoiceActionsEnum[action]}
                loading={isLoading}
                className={isLoading ? "loading" : ""}
              />
            </ButtonContainer>
          </Form>
        </Content>
      )}
    </Modal>
  );
};
