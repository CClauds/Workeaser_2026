import { Button } from "@components/Button";
import { Select } from "@components/Form/Select";
import { api } from "@services/api";
import { CardElement } from "@stripe/react-stripe-js";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";
import { ThemeContext } from "styled-components";
import { BankAccount, Card } from "types/wallet";
import {
  BankTab,
  Container,
  Content,
  Navigation,
  NavigationButton,
} from "./styles";

type Navigation = "CARD" | "BANK_ACCOUNT";

interface PaymentFormProps {
  activeTab: Navigation;
  setActiveTab: Dispatch<SetStateAction<Navigation>>;
  onBankSuccess: PlaidLinkOnSuccess;
  bankName?: string;
  cards?: Card[];
  bankAccounts?: BankAccount[];
}
export const PaymentForm: React.FC<PaymentFormProps> = ({
  activeTab,
  setActiveTab,
  onBankSuccess,
  bankName,
  cards,
  bankAccounts,
}) => {
  const themeContext = useContext(ThemeContext);

  const [cardNumberError, setCardNumberError] = useState(false);
  const [cardNumberFocus, setCardNumberFocus] = useState(false);
  const [plaidToken, setPlaidToken] = useState("");

  useEffect(() => {
    const fetchPlaidToken = async () => {
      try {
        const { data } = await api.get<{
          result: {
            token: string;
          };
        }>("/wallet/token_link");
        setPlaidToken(data.result.token);
      } catch (error) {
        console.log(error.response);
      }
    };
    if (activeTab === "BANK_ACCOUNT") fetchPlaidToken();
  }, [activeTab]);

  const { open, ready } = usePlaidLink({
    token: plaidToken,
    onSuccess: onBankSuccess,
  });

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

  return (
    <Container>
      <Navigation>
        <NavigationButton
          type="button"
          isActive={activeTab === "CARD"}
          onClick={() => setActiveTab("CARD")}
        >
          Credit/Debit Card
        </NavigationButton>
        <NavigationButton
          type="button"
          isActive={activeTab === "BANK_ACCOUNT"}
          onClick={() => setActiveTab("BANK_ACCOUNT")}
        >
          Bank Account
        </NavigationButton>
      </Navigation>

      <Content>
        {activeTab === "CARD" ? (
          <div>
            {cards && (
              <Select
                instanceId="payment_card_id"
                name="payment_card_id"
                options={cards?.map((option) => ({
                  value: option.id,
                  label: option.nickname,
                }))}
              />
            )}
            <CardElement
              onFocus={() => {
                setCardNumberFocus(true);
                setCardNumberError(false);
              }}
              onBlur={() => setCardNumberFocus(false)}
              options={options}
              className={`cardInput
            ${cardNumberError ? "error" : ""}
            ${cardNumberFocus ? "focus" : ""}
            `}
            />
          </div>
        ) : (
          <BankTab>
            {bankAccounts && (
              <Select
                instanceId="payment_bank_id"
                name="payment_bank_id"
                options={bankAccounts?.map((option) => ({
                  value: option.id,
                  label: option.nickname,
                }))}
              />
            )}
            {bankName && (
              <h3>
                Bank connected: <strong>{bankName}</strong>
              </h3>
            )}
            <Button
              text="Connect a bank account"
              onClick={() => open()}
              color="secondary"
              disabled={!ready}
            />
          </BankTab>
          // <>
          //   <Input name="name" placeholder="Name on the Card" />
          //   <Input name="number" placeholder="1234 5678 9000 0000" />

          //   <Row gap={15}>
          //     <Input name="date" placeholder="Exp. Date" />
          //     <Input name="cvv" placeholder="CVV" />
          //     <Input name="zip_code" placeholder="Zip Code" />
          //   </Row>
          // </>
          // <>
          //   <Input name="name" placeholder="Name of Account Holder" />
          //   <CustomSelect name="checking" label="checking" options={[]} />

          //   <Row gap={15}>
          //     <Input name="number" placeholder="Routing Number" />
          //     <Input name="acc_number" placeholder="Account Number" />
          //   </Row>
          // </>
        )}
      </Content>
    </Container>
  );
};
