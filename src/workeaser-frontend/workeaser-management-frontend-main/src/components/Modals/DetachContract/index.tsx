import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import Money from "dinero.js";
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { OptionType } from "types";
import { Client, ClientsResponse } from "types/cowork/clients";
import { OpenContractsResponse } from "types/cowork/relationship";
import * as Yup from "yup";
import styles from "./styles.module.scss";

interface FormData {
  contract_id: number;
  client_uuid: string;
  companyName: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  confirmation: string;
}

interface CancelInfosResponse {
  result: CancelInfos;
}
interface CancelInfos {
  days_left_to_expire: number;
  future_income_lost: number;
  open_balance: number;
}

interface DetachContractProps {
  initialClient?: Client;
  isOpen: boolean;
  onRequestClose: () => void;
}
export const DetachContract: React.FC<DetachContractProps> = ({
  initialClient,
  isOpen,
  onRequestClose,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>();
  const [selectedContractId, setSelectedContractId] = useState<number>();
  const [confirmation, setConfirmation] = useState("NO");

  const { data: { result: clients } = {} } =
    useFetch<ClientsResponse>("/cowork/clients");

  const { data: { result: clientContracts } = {} } =
    useFetch<OpenContractsResponse>(
      selectedClientId
        ? `/cowork/relationship/contracts/getopencontracts/${selectedClientId}`
        : null
    );
  const { data: { result: cancelInfos } = {} } = useFetch<CancelInfosResponse>(
    selectedContractId
      ? `/cowork/relationship/contracts/getcancelinfo/${selectedContractId}`
      : null
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedContractId(null);
      if (initialClient) {
        setSelectedClientId(initialClient.uuid);
      } else {
        setSelectedClientId(null);
      }
    }
  }, [isOpen]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        client_uuid: Yup.string().required(),
        contract_id: Yup.string().required(),
        confirmation: Yup.string().matches(/YES/i, "You must confirm"),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      await api.delete(`/cowork/relationship/contracts/${data.contract_id}`);
      mutate("/cowork/relationship/contracts");
      toast.success("Contract Detached");
      setIsLoading(false);
      onRequestClose();
    } catch (err) {
      setIsLoading(false);
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

  const handleClientChange = (option: OptionType) => {
    if (option) {
      setSelectedClientId(option.value as string);
      const client = clients?.find((client) => client.uuid === option.value);
      formRef.current.setFieldValue("firstName", client.first_name);
      formRef.current.setFieldValue("lastName", client.last_name);
      formRef.current.setFieldValue("email", client.email);
      formRef.current.setFieldValue(
        "phone",
        client.personal_phone ?? "Not informed"
      );
      formRef.current.setFieldValue(
        "companyName",
        client.clientAccount.company_name
      );
    } else {
      formRef.current.clearField("firstName");
      formRef.current.clearField("lastName");
      formRef.current.clearField("email");
      formRef.current.clearField("phone");
      formRef.current.clearField("companyName");
    }
  };

  const handleServiceChange = (option: OptionType) => {
    if (option) {
      setSelectedContractId(option.value as number);
      return;
    }
    setSelectedContractId(null);
  };
  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Detach Client to a Service</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.formContainer}
          initialData={{
            maintaingOpenBalance: "yes",
            confirmation: "NO",
            client_uuid: initialClient
              ? {
                  value: initialClient.uuid,
                  label: initialClient.first_name,
                }
              : null,
            firstName: initialClient?.first_name ?? "",
            lastName: initialClient?.last_name ?? "",
            email: initialClient?.email ?? "",
            phone: initialClient?.personal_phone ?? "",
            companyName: initialClient?.clientAccount?.company_name ?? "",
          }}
        >
          <div className={styles.formContent}>
            <section>
              <Select
                instanceId="client_uuid"
                name="client_uuid"
                placeholder="Pull Client Information with the ID or Email"
                onChange={handleClientChange}
                isLoading={!clients}
                isDisabled={!!initialClient}
                options={clients?.map((client) => ({
                  value: client.uuid,
                  label: client.first_name,
                  photo: client.photo?.file,
                  first_name: client.first_name,
                  last_name: client.last_name,
                  company_name: client.clientAccount.company_name,
                  email: client.email,
                  personal_phone: client.personal_phone,
                }))}
                formatType="user"
              />
              <div className={styles.row}>
                <Input name="firstName" placeholder="First Name" disabled />
                <Input name="lastName" placeholder="Last Name" disabled />
              </div>
              <div className={styles.row}>
                <Input name="email" placeholder="Email" disabled />
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  mask="phone"
                  disabled
                />
              </div>

              <Input name="companyName" placeholder="Company Name" disabled />
            </section>

            <section>
              <Select
                instanceId="contract_id"
                name="contract_id"
                placeholder="Services"
                onChange={handleServiceChange}
                isDisabled={!clientContracts}
                options={clientContracts?.map((contract) => ({
                  value: contract.id,
                  label: contract.service_name,
                }))}
              />

              <div className={styles.row}>
                <p>Days left to expire or renewal:</p>

                <span>
                  <strong>{cancelInfos?.days_left_to_expire ?? ""} Days</strong>
                </span>
              </div>
              <div className={styles.row}>
                <p>Future income that will be lost:</p>

                <span>
                  <strong>
                    {Money({
                      amount: cancelInfos?.future_income_lost ?? 0,
                    }).toFormat("$0,0.00")}
                  </strong>
                </span>
              </div>

              <div>
                <div className={styles.row}>
                  <p>
                    Maintain the{" "}
                    <strong>
                      {Money({
                        amount: cancelInfos?.open_balance ?? 0,
                      }).toFormat("$0,0.00")}
                    </strong>{" "}
                    of open balance?
                  </p>

                  <Radio
                    name="maintaingOpenBalance"
                    options={[
                      { value: "yes", label: "Yes" },
                      {
                        value: "no",
                        label: "No",
                      },
                    ]}
                  />
                </div>
                <footer>
                  <p>
                    * If you choose to maintain the open balance, this client
                    will still be counted as an active customer from the system,
                    and you will be charged for it.
                  </p>
                </footer>
              </div>
              <div className={styles.row}>
                <p>Do you still wants to proceed?</p>

                <Radio
                  name="confirmation"
                  onChange={(e) => setConfirmation(e.currentTarget.value)}
                  options={[
                    { value: "YES", label: "Yes" },
                    {
                      value: "NO",
                      label: "No",
                    },
                  ]}
                />
              </div>
            </section>
          </div>

          <div className={styles.buttonContainer}>
            <Button
              text="START DETACHMENT"
              type="submit"
              loading={isLoading}
              className={isLoading ? styles.loading : ""}
              disabled={confirmation === "NO"}
            />
          </div>
        </Form>
      </>
    </Modal>
  );
};
