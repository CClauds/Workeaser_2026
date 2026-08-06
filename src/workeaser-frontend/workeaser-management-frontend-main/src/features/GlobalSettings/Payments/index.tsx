import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { api } from "@services/api";
import { useStripe } from "@stripe/react-stripe-js";
import { FormHandles, SubmitHandler } from "@unform/core";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  BankingForm,
  BankingFormDisclaimer,
  BankingHeader,
  Container,
  PaymentStatus,
} from "./styles";
import * as Yup from "yup";
import { useFetch } from "@hooks/useFetch";
import { StatusContainer } from "@components/Table/Row/StatusContainer";

interface CoworkStatusResult {
  result: CoworkStatus;
}
interface CoworkStatus {
  inReview: number;
  needUpdate: number;
  needExternalAccount: number;
  status: string;
}
interface StripeLinkResponse {
  result: {
    url: string;
  };
}
interface ExternalAccountResponse {
  result: ExternalAccount[];
}
interface ExternalAccount {
  id: number;
  holder_name: string;
  holder_type: string;
  default_for_currency: boolean;
  bank_name: string;
  country: string;
  last_digits: string;
  routing_number: string;
}
interface FormData {
  account_holder_name: string;
  routing_number: string;
  account_number: string;
  confirm_account_number: string;
}

export const Payments: React.FC = () => {
  const stripe = useStripe();

  const [stripeLink, setStripeLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: { result: coworkStatus } = {} } =
    useFetch<CoworkStatusResult>("/cowork/status");

  const { data: externalAccounts, mutate } = useFetch<ExternalAccountResponse>(
    "/cowork/stripe/externalaccount"
  );

  const externalAccount = externalAccounts?.result?.length
    ? externalAccounts.result.find(
        (external) => !!external.default_for_currency
      ) || externalAccounts?.result[0]
    : null;

  const formRef = useRef<FormHandles>(null);

  let status = getCoworkStaus(coworkStatus);

  // const effectRun = useRef(false);
  useEffect(() => {
    const controller = new AbortController();

    const fetcStripeLink = async () => {
      const config = {
        signal: controller.signal,
      };

      const { data } = await api.get<StripeLinkResponse>(
        "/cowork/stripe/onboardingurl",
        config
      );
      setStripeLink(data.result.url);
    };

    // if (effectRun.current) {
    fetcStripeLink();
    // }

    return () => {
      controller.abort();
      // effectRun.current = true;
    };
  }, [coworkStatus]);

  useEffect(() => {
    if (externalAccounts?.result.length) {
      formRef.current?.setData({
        account_holder_name: externalAccount.holder_name,
        routing_number: externalAccount.routing_number,
        account_number: externalAccount.last_digits,
        confirm_account_number: externalAccount.last_digits,
      });
    }
  }, [externalAccounts]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    // if (externalAccount) {
    //   try {
    //     setIsLoading(true);
    //     await api.delete(
    //       `/cowork/stripe/externalaccount/${externalAccount.id}`
    //     );
    //     toast.success("Account deleted.");
    //   } catch (error) {
    //   } finally {
    //     setIsLoading(false);
    //   }
    //   return;
    // }
    try {
      formRef.current.setErrors({});
      const schema = Yup.object().shape({
        account_holder_name: Yup.string().min(2).required(),
        routing_number: Yup.string()
          .min(9, "Routing number must have 9 digits.")
          .required(),
        account_number: Yup.string().min(3).required(),
        confirm_account_number: Yup.string()
          .min(3)
          .oneOf(
            [Yup.ref("account_number"), null],
            "Account number must match."
          ),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      if (!stripe) {
        return;
      }

      const { confirm_account_number, ...bodyData } = data;

      const body = {
        ...bodyData,
        country: "US",
        currency: "usd",
        account_holder_type: "individual",
      };

      const { error, token } = await stripe.createToken("bank_account", {
        ...body,
      });

      if (error) {
        switch (error.code) {
          case "account_number_invalid":
            toast.error("Account number invalid.");
            formRef.current.setFieldError(
              "account_number",
              "Account number invalid."
            );
            break;
        }
        throw new Error(error.message);
      }

      await api.post("/cowork/stripe/externalaccount", {
        token: token.id,
        default_for_currency: true,
      });
      mutate();
      toast.success("Account added.");
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
          });
          formRef.current.setErrors(validationErrors);
        }
      } else {
        if (err.response) {
          console.log("ERR0R", err.response.data);
          toast.error(err.response.data.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const CoworkStatusComponent = () => {
    if (!status) return null;

    if (status === "VALIDATION_REQUIRED") {
      return (
        <StatusContainer bgColor="red">Validation Required</StatusContainer>
      );
    }
    if (status === "ready") {
      return <StatusContainer bgColor="green">Ready to Use</StatusContainer>;
    }
    if (status === "review") {
      return <StatusContainer bgColor="yellow">In Review</StatusContainer>;
    }
    if (status === "add") {
      return <StatusContainer bgColor="gray">Add Bank Account</StatusContainer>;
    }
    if (status === "update") {
      return <StatusContainer bgColor="red">Need Update</StatusContainer>;
    }

    return null;
  };

  const AccountStatus = () => {
    if (externalAccount) {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <defs>
            <clipPath>
              <rect
                width="16"
                height="16"
                rx="8"
                transform="translate(0 -0.186)"
                fill="#2dc9a5"
                stroke="#f3f6f9"
                strokeWidth="1"
              />
            </clipPath>
          </defs>
          <g transform="translate(0 0.186)" clipPath="url(#clipPath)">
            <g transform="translate(0 0)">
              <path
                d="M9.524,1.524a7.238,7.238,0,1,0,7.238,7.238A7.238,7.238,0,0,0,9.524,1.524Zm-8,7.238a8,8,0,1,1,8,8A8,8,0,0,1,1.524,8.762Z"
                transform="translate(-1.524 -0.762)"
                fill="#2dc9a5"
                fillRule="evenodd"
              />
              <path
                d="M12.455,6.964a.381.381,0,0,1,.01.539L8.89,11.217,6.963,9.207a.381.381,0,1,1,.55-.527l1.378,1.437,3.025-3.143A.381.381,0,0,1,12.455,6.964Z"
                transform="translate(-1.524 -0.762)"
                fill="#2dc9a5"
                fillRule="evenodd"
              />
            </g>
          </g>
        </svg>
      );
    } else {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <defs>
            <clipPath>
              <rect
                width="16"
                height="16"
                rx="8"
                transform="translate(855 341)"
                fill="#f14b5c"
                stroke="#f3f6f9"
                strokeWidth="1"
              />
            </clipPath>
          </defs>
          <g transform="translate(-855 -341)" clipPath="url(#clipPath)">
            <g transform="translate(853.477 340.238)">
              <path
                d="M9.524,1.524a7.238,7.238,0,1,0,7.238,7.238A7.238,7.238,0,0,0,9.524,1.524Zm-8,7.238a8,8,0,1,1,8,8A8,8,0,0,1,1.524,8.762Z"
                fill="#f14b5c"
                fillRule="evenodd"
              />
              <path
                d="M7.731,6.969a.381.381,0,0,1,.539,0l3.048,3.048a.381.381,0,1,1-.539.539L7.731,7.507A.381.381,0,0,1,7.731,6.969Z"
                fill="#f14b5c"
                fillRule="evenodd"
              />
              <path
                d="M11.317,6.969a.381.381,0,0,1,0,.539L8.269,10.555a.381.381,0,1,1-.539-.539l3.048-3.048A.381.381,0,0,1,11.317,6.969Z"
                fill="#f14b5c"
                fillRule="evenodd"
              />
            </g>
          </g>
        </svg>
      );
    }
  };

  return (
    <Container>
      <BankingHeader>
        <div>
          <h3>Payments Validation:</h3>
          <p>Validate your business to enable card and bank payments.</p>
        </div>

        <a href={stripeLink} rel="noopener noreferrer" target="_blank">
          <Button
            text="START VALIDATION"
            disabled={
              !stripeLink ||
              ["ready", "add"].includes(getCoworkStaus(coworkStatus))
            }
          />
        </a>
      </BankingHeader>

      <PaymentStatus>
        <p>Verification Status:</p>
        <CoworkStatusComponent />
      </PaymentStatus>

      {status !== "VALIDATION_REQUIRED" ? (
        <>
          <BankingForm ref={formRef} onSubmit={handleSubmit}>
            <div className="form__row form__first__row">
              <div>
                {/* <AccountStatus /> */}
                <Input
                  name="account_holder_name"
                  placeholder="Account Holder"
                  width={372}
                />
              </div>
              <Button
                type="submit"
                text={"SAVE"}
                color="plain"
                className="save__button"
                loading={isLoading}
              />
            </div>
            <div className="form__row">
              <Input name="routing_number" placeholder="Routing Number" />
              <Input name="account_number" placeholder="Account Number" />
              <Input
                name="confirm_account_number"
                placeholder="Confirm Account Number"
              />
            </div>
            <BankingFormDisclaimer>
              <p>
                * Once verified, this account will be receiving the deposits
                from you payment system. Only checking account is acceptable.
              </p>
            </BankingFormDisclaimer>
          </BankingForm>
        </>
      ) : null}
    </Container>
  );
};

const getCoworkStaus = (status: CoworkStatus): string => {
  if (!status) return null;

  if (status.status === "VALIDATION_REQUIRED") {
    return "VALIDATION_REQUIRED";
  }
  if (status.inReview === 1) {
    return "review";
  }
  if (status.needExternalAccount === 1) {
    return "add";
  }
  if (status.needUpdate === 1) {
    return "update";
  }

  return "ready";
};
