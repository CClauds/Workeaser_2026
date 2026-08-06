import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ButtonContainer } from "@styles/pages/settings/waller/add";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";
import { toast } from "react-toastify";
import { ThemeContext } from "styled-components";
import { mutate } from "swr";
import { BankAccount, Card } from "types/wallet";
import * as Yup from "yup";
import styles from "../../styles.module.scss";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  const { "user-token": token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: "/login?expired=true",
        permanent: false,
      },
    };
  }

  const { id, payment_method } = context.query;
  if (id) {
    try {
      const { data } = await apiClient.get(`/wallet/${payment_method}/${id}`);
      return {
        props: {
          payment_method,
          initialData: data.result,
        },
      };
    } catch (error) {
      return {
        props: {
          error: error.response.data,
        },
      };
    }
  } else {
    return {
      props: {},
    };
  }
};

interface FormData {
  nickname: string;
  payment_method: "CARD" | "BANK_ACCOUNT";
  name?: string;
}

interface PlaidTokenResponse {
  result: {
    token: string;
  };
}

interface AddWallterProps {
  payment_method: string;
  initialData: Card & BankAccount;
}

const AddWallet = ({ payment_method, initialData }: AddWallterProps) => {
  const formRef = useRef<FormHandles>(null);

  const themeContext = useContext(ThemeContext);
  const elements = useElements();
  const stripe = useStripe();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isCard, setIsCard] = useState(true);
  const [plaidToken, setPlaidToken] = useState("");
  const [cardNumberError, setCardNumberError] = useState(false);
  const [cardNumberFocus, setCardNumberFocus] = useState(false);

  useEffect(() => {
    if (payment_method && initialData) {
      const formData = {
        ...initialData,
        name: initialData.cardholder_name,
      };
      formRef.current?.setData(formData);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchPlaidToken = async () => {
      try {
        const { data } = await api.get<PlaidTokenResponse>(
          "/wallet/token_link"
        );
        setPlaidToken(data.result.token);
      } catch (error) {
        console.log(error.response);
      }
    };
    if (!isCard) fetchPlaidToken();
  }, [isCard]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const { nickname, payment_method, ...additional_data } = data;

      setCardNumberError(false);

      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        nickname: Yup.string().required(),
        name: payment_method === "CARD" ? Yup.string().min(2).required() : null,
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      if (payment_method === "CARD") {
        if (!stripe || !elements) {
          return;
        }

        const card = elements.getElement(CardElement);
        if (!card) {
          throw new Error("Card Element not found");
        }

        const { error, token } = await stripe.createToken(card, {
          ...additional_data,
        });

        if (error) {
          console.log("[error]", error);
          setCardNumberError(true);
          throw new Error(error.message);
        }

        const body = {
          nickname,
          payment_method,
          token: token.id,
        };

        await api.post("/wallet/card", body);
        toast.success("Card added.");
        mutate("/wallet");
        router.push("/settings/wallet");
      } else {
        throw new Error("No account connected");
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            console.log(error.message);
            validationErrors[error.path] = error.message;
          });
          formRef.current.setErrors(validationErrors);
        }
      } else {
        console.log(err);
        if (err.message) {
          toast.error(err.message);
          return;
        }
        if (err.response?.data) {
          err?.response?.data.error.message.forEach((message) => {
            console.log("message", message.message);
            toast.error(message.message);
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = () => {
    setIsCard(!isCard);
  };

  const options = {
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

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      const { accounts } = metadata;

      setIsLoading(true);
      const data = formRef.current.getData();
      const { nickname, payment_method } = data;

      const body = {
        nickname,
        payment_method,
        token: publicToken,
        account_id: accounts[0].id,
      };

      try {
        await api.post("/wallet/bank_account", body);
        toast.success("Account added.");
        mutate("/wallet");
        router.push("/settings/wallet");
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const { open, ready } = usePlaidLink({
    token: plaidToken,
    onSuccess,
  });

  const handleConnectBank = async () => {
    try {
      formRef.current.setErrors({});
      const data = formRef.current.getData();

      const schema = Yup.object().shape({
        nickname: Yup.string().required(),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      open();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            console.log(error.message);
            validationErrors[error.path] = error.message;
          });
          formRef.current.setErrors(validationErrors);
        }
      } else {
        console.log("ERR0R", err);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Add Wallet | Workeaser</title>
      </Head>

      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        initialData={{ payment_method: "CARD" }}
        className={styles.walletFormContainer}
      >
        <section>
          <header>
            <h2>Payment Account:</h2>
            <span className={styles.line}></span>
          </header>

          <div className={styles.content}>
            <div className={styles.inputFieldsContainer}>
              <Input name="nickname" placeholder="Payment Nickname" />
              <div className={styles.flexRow}>
                <p>Payment Method</p>
                <div className={styles.radioContainer}>
                  <Radio
                    name="payment_method"
                    onChange={handleMethodChange}
                    options={[
                      {
                        value: "CARD",
                        label: "Credit/Debit Card",
                      },
                      {
                        value: "BANK_ACCOUNT",
                        label: "Bank Account",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          {isCard ? (
            <>
              <header>
                <h2>Credit/Debit Card:</h2>
                <span className={styles.line}></span>
              </header>

              <div className={styles.content}>
                <div className={styles.inputFieldsContainer}>
                  <Input name="name" placeholder="Card Holder Name" />
                  <CardElement
                    onFocus={() => {
                      setCardNumberFocus(true);
                      setCardNumberError(false);
                    }}
                    onBlur={() => setCardNumberFocus(false)}
                    options={options}
                    className={`
                      ${styles.cardInput} 
                      ${cardNumberError ? styles.error : ""}
                      ${cardNumberFocus ? styles.focus : ""}
                    `}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <header>
                <h2>Bank Account:</h2>
                <span className={styles.line}></span>
              </header>

              <div className={styles.content}>
                <div className={styles.banck__button}>
                  <Button
                    text="Connect a bank account"
                    onClick={handleConnectBank}
                    color="secondary"
                    disabled={!ready}
                  />
                </div>
              </div>
            </>
          )}
        </section>

        <ButtonContainer>
          <Button
            type="submit"
            text="SAVE PAYMENT ACCOUNT"
            loading={isLoading}
            className={isLoading ? "loading" : ""}
          />
        </ButtonContainer>
      </Form>
    </>
  );
};

AddWallet.authRoles = ["COWORKING"];
AddWallet.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default AddWallet;
