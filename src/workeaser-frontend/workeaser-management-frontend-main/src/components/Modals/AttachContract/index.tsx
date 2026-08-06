import { CheckCircleTwoTone, WarningTwoTone } from "@components/antd-client/icons";
import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { CustomRadio } from "@components/Form/CustomRadio";
import { DatePickerAntd } from "@components/Form/DatePickerAntd";
import { Dropzone } from "@components/Form/Dropzone";
import { FileInput } from "@components/Form/FileInput";
import { HiddenInput } from "@components/Form/HiddenInput";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { ServiceTableFormBlock } from "@components/FormBlocks/ServiceTableFormBlock";
import { InputComponent } from "@components/FormElements/Input";
import { Steps } from "@components/Steps";
import {
  IdentityResponse,
  IdentityStatus,
} from "@features/GlobalSettings/ExternalServices";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { uploadDocument } from "@services/api/fileUpload";
import { FormHandles, SubmitHandler } from "@unform/core";
import { NEW_CLIENT_VALUE } from "@utils/constants";
import { currencyUnmask } from "@utils/masks";
import { formatDateNew } from "@utils/numberFormat";
import { Alert, Button as AntdButton, Tooltip } from "@components/antd-client";
import { add, format } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import Money from "dinero.js";
import _ from "lodash";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { LocationRelation } from "types";
import { Fee, Price } from "types/cowork";
import { ClientGeneric, ClientsResponse } from "types/cowork/clients";
import { TableCellData } from "types/cowork/financial/invoices";
import { Tax } from "types/cowork/locations/meetingRoom";
import { OptionType } from "types/form";
import {
  LocationData,
  OpenDesk,
  PrivateRoom,
  VirtualOffice,
} from "types/locations";
import * as Yup from "yup";
import {
  ContractContainer,
  FooterText,
  Form,
  FormContent,
  ImagesPreviewContainer,
  InvoiceContainer,
  ReviewContainer,
  Row,
  SectionDivider,
  StepsContainer,
} from "./styles";
import styles from "./styles.module.scss";
import { Address } from "@services/api/cowork/locations/types";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

enum ServiceTypeEnum {
  OPEN_DESK = "desks",
  VIRTUAL_OFFICE = "virtualoffices",
  PRIVATE_ROOM = "rooms",
}
export type ServiceType = `${ServiceTypeEnum}`;
type ServiceSlugType = keyof typeof ServiceTypeEnum;
export enum FrindlyTermSizeEnum {
  MONTH_1 = "1 Month",
  MONTH_3 = "3 Months",
  MONTH_6 = "6 Months",
  YEAR_1 = "1 Year",
  YEAR_2 = "2 Years",
  YEAR_3 = "3 Years",
}
type TermSizeType = keyof typeof FrindlyTermSizeEnum;
enum PaymentRecurringEnum {
  MONTHLY = "Monthly",
  TOTAL = "Total",
}
type PaymentRecurringType = keyof typeof PaymentRecurringEnum;
interface ResourceResponse {
  result: Resource;
}
interface Resource {
  id: number;
  name: string;
  description: string;
  location_id: number;
  location: LocationRelation;
  coworking_usage_mo: number;
  meetroom_usage_mo: number;
  fees: Fee[];
  prices: Price[];
  taxes?: Tax[];
}
interface ServiceValue {
  amount: string;
  name: string;
  description: string;
  taxes: Tax[];
  initialInvoiceAmount?: boolean;
}
interface OfferedService {
  id: number;
  name: string;
  photo: string[];
  photos: string[];
  location: string;
}

interface FormData {
  client_uuid: string;
  client: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    personal_phone: string;
    phone?: string;
    personal_address: Address;
    company_name?: string;
  };
  location_id: number;
  documents: File[];
  service_type: ServiceSlugType;
  resource_id: number;
  term_size: TermSizeType;
  auto_renewal: string;
  request_sign: string;
  payment_recurring_style: PaymentRecurringType;
  cowork_usage_per_month: number;
  meeting_room_per_month: number;
  service_started_date: Dayjs;
  due_date: Dayjs;
  contract_document_id: File;
  amount: string;
  first_invoice_amount: number;
  initial_payment: Tax[];
  items: TableCellData[];
}

interface AttachContractProps {
  initialClient?: Partial<ClientGeneric>;
  initialService?: Partial<
    (VirtualOffice | OpenDesk | PrivateRoom) & {
      type: string;
      term_size?:
        | "MONTH_1"
        | "MONTH_3"
        | "MONTH_6"
        | "YEAR_1"
        | "YEAR_2"
        | "YEAR_3";
      auto_renewal?: boolean;
      payment_recurring_style?: "MONTHLY" | "TOTAL";
    }
  >;
  isOpen: boolean;
  onRequestClose: () => void;
}
export const AttachContract: React.FC<AttachContractProps> = ({
  initialClient,
  initialService,
  isOpen,
  onRequestClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [locationId, setLocationId] = useState<number>();
  const [serviceType, setServiceType] = useState<ServiceSlugType>();
  const [resourceId, setResourceId] = useState<string>();
  const [paymentRecurringDisabled, setPaymentRecurringDisabled] =
    useState(false);
  const [initalTableData, setInitalTableData] = useState<Fee[]>();
  const [amount, setAmount] = useState(0);
  const [bsIdentity, setBsIdentity] = useState<IdentityResponse>();
  const [isNewClient, setIsNewClient] = useState<boolean>(false);
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });
  const [personalPhone, setPersonalPhone] = useState("");
  const [phone, setPhone] = useState("");

  const router = useRouter();

  const formRef = useRef<FormHandles>(null);

  const { data: { result: coworkClients } = {} } =
    useFetch<ClientsResponse>("/cowork/clients");

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl);

  const { data: { result: offeredServices } = {} } = useFetch(
    locationId && serviceType
      ? `/cowork/${ServiceTypeEnum[serviceType]}?location=${locationId}`
      : null
  );

  let offeredServicesFiltered: OfferedService[] = offeredServices;
  if (serviceType !== "VIRTUAL_OFFICE") {
    offeredServicesFiltered = offeredServices?.filter(
      (service) => service.is_available
    );
  }

  const FetchBoldSignIdentity = async () => {
    const { data: { result: identity } = {} } = await api.get<{
      result: IdentityResponse;
      error: {
        message: string;
      };
    }>("/cowork/boldsign/identities/me");
    setBsIdentity(identity);
  };

  const { data: { result: selectedResource } = {} } =
    useFetch<ResourceResponse>(
      resourceId
        ? `/cowork/${
            initialService?.type
              ? ServiceTypeEnum[initialService.type]
              : ServiceTypeEnum[serviceType]
          }/${resourceId}`
        : null
    );

  const finalAmount = calculateTotalTaxesAmount(
    formRef.current?.getData()?.items
  );

  const restoreInitialState = () => {
    setCurrentStep(0);
    setIsLoading(false);
    setLocationId(null);
    setServiceType(null);
    setResourceId(null);
    setPaymentRecurringDisabled(false);
    setAmount(0);
  };

  useEffect(() => {
    if (locations) {
      const newLocations = [...allLocations.data, ...locations];
      setAllLocations((state) => ({ ...state, data: newLocations }));
    }
  }, [locations]);

  useEffect(() => {
    if (isOpen) {
      restoreInitialState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialService) {
      setResourceId(String(initialService.id));
    }
  }, [initialService]);

  useEffect(() => {
    if (selectedResource) {
      formRef.current?.setFieldValue(
        "cowork_usage_per_month",
        selectedResource.coworking_usage_mo ?? 0
      );
      formRef.current?.setFieldValue(
        "meeting_room_per_month",
        selectedResource.meetroom_usage_mo ?? 0
      );

      const serviceValue: ServiceValue = formatServiceValue(
        selectedResource,
        amount
      );
      setInitalTableData(formatTableData(selectedResource, serviceValue));
      return;
    }
    !initialService?.term_size && formRef.current?.clearField("term_size");
    formRef.current?.setFieldValue("cowork_usage_per_month", 0);
    formRef.current?.setFieldValue("meeting_room_per_month", 0);
  }, [selectedResource]);

  useEffect(() => {
    const serviceValue: ServiceValue = formatServiceValue(
      selectedResource,
      amount
    );
    setInitalTableData(formatTableData(selectedResource, serviceValue));
  }, [amount]);

  useEffect(() => {
    FetchBoldSignIdentity();
  }, []);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      data.client.personal_phone = personalPhone;
      data.client.phone = phone;

      const schema = Yup.object().shape({
        client_uuid: Yup.string().required(),
        location_id: Yup.string().required(),
        service_type: Yup.string().required(),
        resource_id: Yup.string().required(),
        term_size: Yup.string().required(),
        client: Yup.object()
          .optional()
          .shape({
            first_name: Yup.string().required(),
            middle_name: Yup.string().optional(),
            last_name: Yup.string().required(),
            email: Yup.string().email().required(),
            personal_phone: Yup.string().required(),
            phone: Yup.string().optional(),
            personal_address: Yup.object().shape({
              fulltext: Yup.string().optional(),
              fulltext2: Yup.string().optional(),
              country: Yup.string().optional(),
              state: Yup.string().optional(),
              city: Yup.string().optional(),
              zipcode: Yup.string().optional(),
            }),
            company_name: Yup.string().optional(),
          }),
        due_date: currentStep !== 0 ? Yup.string().required() : null,
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      if (data.client_uuid === NEW_CLIENT_VALUE) {
        delete data.client_uuid;
      }

      if (!data.contract_document_id) {
        formRef.current.setFieldError(
          "contract_document_id",
          "Document is required."
        );
        throw new Error("Document is required.");
      }

      if (currentStep === 0) {
        setCurrentStep(1);
        return;
      }
      if (currentStep === 1) {
        setCurrentStep(2);
        return;
      }

      setIsLoading(true);

      const { items, ...bodyData } = data;

      const documentsPromises = data.documents.map((doc) =>
        uploadDocument(doc)
      );
      const documentsResponse = await Promise.all(documentsPromises);
      const contractDocumentId = await uploadDocument(
        data.contract_document_id
      );

      const body = {
        ...bodyData,
        auto_renewal: bodyData.auto_renewal === "yes" ? true : false,
        request_sign: bodyData.request_sign === "yes" ? 1 : 0,
        documents: documentsResponse.map((item) => ({ id: item.id })),
        contract_document_id: contractDocumentId.id,
        amount: parseInt(currencyUnmask(bodyData.amount)),
      };

      await api.post("/cowork/relationship/contracts", body);
      mutate("/cowork/relationship/contracts");
      toast.success("Contract attached");
      setIsLoading(false);
      onRequestClose();
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Yup.ValidationError) {
        if (currentStep === 2) {
          setCurrentStep(0);
        }
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
        if (!Array.isArray(err?.response?.data.error.message)) {
          toast.error(err?.response?.data.error.message);
        } else {
          err?.response?.data.error.message.forEach((message) => {
            toast.error(message.message);
          });
        }
      }
    }
  };

  const handleStepClick = (index: number) => () => {
    setCurrentStep(index);
  };

  const handleClientChange = (option: OptionType) => {
    if (option) {
      if (option.value === NEW_CLIENT_VALUE) {
        formRef.current.clearField("client.first_name");
        formRef.current.clearField("client.middle_name");
        formRef.current.clearField("client.last_name");
        formRef.current.clearField("client.email");
        //formRef.current.clearField("client.personal_phone");
        setPersonalPhone("");
        //formRef.current.clearField("client.phone");
        setPhone("");
        formRef.current.clearField("client.personal_address.fulltext");
        formRef.current.clearField("client.personal_address.fulltext2");
        formRef.current.clearField("client.personal_address.country");
        formRef.current.clearField("client.personal_address.state");
        formRef.current.clearField("client.personal_address.city");
        formRef.current.clearField("client.personal_address.zipcode");
        formRef.current.clearField("client.company_name");
        setIsNewClient(true);
        return;
      }
      const client = coworkClients.find(
        (client) => client.uuid === option.value
      );
      if (client) {
        setIsNewClient(false);
        formRef.current.setFieldValue("client.first_name", client.first_name);
        formRef.current.setFieldValue("client.middle_name", client.middle_name);
        formRef.current.setFieldValue("client.last_name", client.last_name);
        formRef.current.setFieldValue("client.email", client.email);
        // formRef.current.setFieldValue(
        //   "client.personal_phone",
        //   client.personal_phone ?? "Not informed"
        // );
        setPersonalPhone(client.personal_phone);
        // formRef.current.setFieldValue(
        //   "client.phone",
        //   client.phone ?? "Not informed"
        // );
        setPhone(client.phone);
        formRef.current.setFieldValue(
          "client.personal_address.fulltext",
          client.personalAddress?.fulltext
        );
        formRef.current.setFieldValue(
          "client.personal_address.fulltext2",
          client.personalAddress?.fulltext2
        );
        formRef.current.setFieldValue(
          "client.personal_address.country",
          client.personalAddress?.country
        );
        formRef.current.setFieldValue(
          "client.personal_address.state",
          client.personalAddress?.state
        );
        formRef.current.setFieldValue(
          "client.personal_address.city",
          client.personalAddress?.city
        );
        formRef.current.setFieldValue(
          "client.personal_address.zipcode",
          client.personalAddress?.zipcode
        );
        formRef.current.setFieldValue(
          "client.company_name",
          client.clientAccount.company_name
        );
        return;
      }
      setIsNewClient(false);
      formRef.current.clearField("client.first_name");
      formRef.current.clearField("client.last_name");
      formRef.current.clearField("client.email");
      formRef.current.clearField("client.personal_phone");
      formRef.current.clearField("client.phone");
      formRef.current.clearField("client.personal_address.fulltext");
      formRef.current.clearField("client.personal_address.fulltext2");
      formRef.current.clearField("client.personal_address.country");
      formRef.current.clearField("client.personal_address.state");
      formRef.current.clearField("client.personal_address.city");
      formRef.current.clearField("client.personal_address.zipcode");
      formRef.current.clearField("client.company_name");
    }
  };

  const handleSpaceChange = (option: OptionType) => {
    setAmount(0);
    setPaymentRecurringDisabled(false);
    if (option) {
      setLocationId(option.value as number);
    }
    formRef.current.clearField("resource_id");
    formRef.current.clearField("service_type");
    formRef.current.clearField("term_size");
  };

  const handleServiceTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPaymentRecurringDisabled(false);
    setServiceType(e.target.value as ServiceSlugType);
    setAmount(0);
    formRef.current.clearField("resource_id");
  };

  const handleTermSizeChange = (option: OptionType) => {
    const paymentRecurring = formRef.current?.getFieldValue(
      "payment_recurring_style"
    );
    if (option && selectedResource && paymentRecurring) {
      setPaymentRecurringDisabled(false);

      const price = selectedResource?.prices.find(
        (price) => price.duration === option.value
      );

      if (paymentRecurring === "TOTAL") {
        const total = parseInt(price.full_price);

        setAmount(total ?? 0);
      } else {
        const total = parseInt(price.monthly_price);

        setAmount(total ?? 0);
      }

      if (!price.monthly_price) {
        formRef.current.setFieldValue("payment_recurring_style", "TOTAL");
        setPaymentRecurringDisabled(true);
        return;
      }
      if (!price.full_price) {
        formRef.current.setFieldValue("payment_recurring_style", "MONTHLY");
        setPaymentRecurringDisabled(true);
        return;
      }
    }
  };

  const handlePaymentRecurringChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value as PaymentRecurringType;
    const termSize = formRef.current?.getFieldValue("term_size");
    if (termSize && selectedResource) {
      const price = selectedResource?.prices.find(
        (price) => price.duration === termSize
      );
      if (value == "TOTAL") {
        setAmount(parseInt(price.full_price) ?? 0);
        return;
      }
      setAmount(parseInt(price.monthly_price) ?? 0);
    }
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const number = value.replace(/\$|,|\.|%/g, "");
    if (!number) {
      setAmount(0);
      return;
    }

    setAmount(parseInt(number, 10));
  };

  const handleLocationSelectSrollsToBottom = (
    event: WheelEvent | TouchEvent
  ) => {
    if (event.target) {
      if (allLocations.pageCount < pagination.lastPage) {
        setAllLocations((state) => ({
          ...state,
          pageCount: state.pageCount + 1,
        }));
      }
    }
  };

  const setNewClientFun = (set: boolean) => {
    setIsNewClient(set);
    return true;
  };

  const clientUUIDConditional = useMemo(
    () =>
      initialClient && coworkClients
        ? coworkClients.some((client) => client.uuid === initialClient.uuid)
          ? setNewClientFun(false) && {
              value: initialClient.uuid,
              label: initialClient.first_name,
            }
          : setNewClientFun(true) && {
              value: NEW_CLIENT_VALUE,
              label: "Add New Client",
            }
        : null,
    [initialClient, coworkClients]
  );

  useEffect(() => {
    if (initialService && selectedResource) {
      const price = selectedResource.prices.find(
        (price) => price.duration === initialService.term_size
      );

      if (initialService.payment_recurring_style === "TOTAL") {
        const total = parseInt(price?.full_price);

        setAmount(total ?? 0);
      } else {
        const total = parseInt(price?.monthly_price);

        setAmount(total ?? 0);
      }
    }
  }, [initialService, selectedResource]);

  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
      style={{ content: { overflow: "hidden" } }}
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Attach Client to a Service {BoldsignIdentityAlert()}</h1>

          {bsIdentity && bsIdentity.status !== IdentityStatus.APPROVED && (
            <Alert
              message="You must authorize the external service BoldSign to be able to send a contract."
              type="warning"
              action={
                <AntdButton
                  type="ghost"
                  onClick={() =>
                    router.push(
                      "/settings/global-settings?tab=EXTERNAL_SERVICES"
                    )
                  }
                >
                  Settings
                </AntdButton>
              }
              showIcon={true}
            />
          )}
        </header>

        <StepsContainer>
          <Steps
            steps={[
              "Client, Service & Contract",
              "Initial Payment Invoice",
              "Final Review",
            ]}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </StepsContainer>
        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          $currentStep={currentStep}
          initialData={{
            auto_renewal: _.isUndefined(initialService?.auto_renewal)
              ? "yes"
              : !!initialService?.auto_renewal
              ? "yes"
              : "no",
            request_sign: "yes",
            payment_recurring_style:
              initialService?.payment_recurring_style || "MONTHLY",
            cowork_usage_per_month: 0,
            meeting_room_per_month: 0,
            client_uuid: clientUUIDConditional,
            client: {
              first_name: initialClient?.first_name ?? "",
              last_name: initialClient?.last_name ?? "",
              email: initialClient?.email ?? "",
              personal_phone: initialClient?.personal_phone ?? "",
              phone: initialClient?.phone ?? "",
              personal_address: {
                fulltext: initialClient?.personalAddress?.fulltext ?? "",
                fulltext2: initialClient?.personalAddress?.fulltext2 ?? "",
                country: initialClient?.personalAddress?.country ?? "",
                state: initialClient?.personalAddress?.state ?? "",
                city: initialClient?.personalAddress?.city ?? "",
                zipcode: initialClient?.personalAddress?.zipcode ?? "",
              },
              company_name: initialClient?.clientAccount?.company_name ?? "",
            },
            location_id: initialService
              ? {
                  value: initialService.location_id,
                  label: initialService.location,
                }
              : null,
            resource_id: initialService
              ? {
                  value: initialService.id,
                  label: initialService.name,
                }
              : null,
            service_type: initialService?.type ?? "",
            service_started_date: dayjs(),
            term_size: initialService?.term_size
              ? {
                  value: initialService.term_size,
                  label: FrindlyTermSizeEnum[initialService.term_size],
                }
              : null,
          }}
        >
          <FormContent currentStep={currentStep}>
            <ContractContainer isVisible={currentStep === 0}>
              <section>
                <Select
                  instanceId="client_uuid"
                  name="client_uuid"
                  placeholder="Client Information with the ID or Email"
                  onChange={handleClientChange}
                  isLoading={!coworkClients}
                  isDisabled={!!initialClient}
                  options={[
                    {
                      value: NEW_CLIENT_VALUE,
                      label: "Add New Client",
                    },
                    ...(coworkClients
                      ? coworkClients.map((client) => ({
                          value: client.uuid,
                          label: client.first_name,
                          photo: client.photo?.file,
                          first_name: client.first_name,
                          last_name: client.last_name,
                          company_name: client?.clientAccount?.company_name,
                          email: client.email,
                          personal_phone: client.personal_phone,
                          phone: client.phone,
                          personal_address: {
                            fulltext: client?.personalAddress?.fulltext,
                            fulltext2: client?.personalAddress?.fulltext2,
                            country: client?.personalAddress?.country,
                            state: client?.personalAddress?.state,
                            city: client?.personalAddress?.city,
                            zipcode: client?.personalAddress?.zipcode,
                          },
                        }))
                      : []),
                  ]}
                  formatType="user"
                />
                <div className={styles.row}>
                  <Input
                    name="client.first_name"
                    placeholder="First Name"
                    readOnly={!isNewClient}
                  />
                  <Input
                    name="client.middle_name"
                    placeholder="Middle Name"
                    readOnly={!isNewClient}
                  />
                </div>

                <Input
                  name="client.last_name"
                  placeholder="Last Name"
                  readOnly={!isNewClient}
                />

                <Input
                  name="client.email"
                  title={formRef.current?.getFieldValue("client.email") ?? ""}
                  placeholder="Email"
                  readOnly={!isNewClient}
                />

                {/* <div className={styles.row}>
                  <Input
                    name="client.personal_phone"
                    type="tel"
                    placeholder="Mobile Phone"
                    mask="phone"
                    readOnly={!isNewClient}
                  />
                  <Input
                    name="client.phone"
                    type="tel"
                    placeholder="Phone"
                    mask="phone"
                    readOnly={!isNewClient}
                  />
     
                </div> */}
                <PhoneInput
                  placeholder="Mobile phone"
                  value={personalPhone}
                  onChange={setPersonalPhone}
                />

                <PhoneInput
                  placeholder="phone"
                  value={phone}
                  onChange={setPhone}
                />

                <Input
                  name="client.personal_address.fulltext"
                  placeholder="Address"
                  readOnly={!isNewClient}
                />

                <Input
                  name="client.personal_address.fulltext2"
                  placeholder="Address 2"
                  readOnly={!isNewClient}
                />

                <div className={styles.row}>
                  <Input
                    name="client.personal_address.country"
                    placeholder="Country"
                  />
                  <Input
                    name="client.personal_address.state"
                    placeholder="State"
                  />
                </div>

                <div className={styles.row}>
                  <Input
                    name="client.personal_address.city"
                    placeholder="City"
                  />
                  <Input
                    name="client.personal_address.zipcode"
                    placeholder="Zipcode"
                  />
                </div>

                <Input
                  name="client.company_name"
                  placeholder="Company Name"
                  readOnly={!isNewClient}
                />

                <Dropzone
                  name="documents"
                  label="Drop the Client Documents"
                  acceptedTypes="application/pdf"
                />

                <div className={styles.row}>
                  <p>Request Signature?</p>

                  <Radio
                    name="request_sign"
                    options={[
                      { value: "yes", label: "Yes" },
                      {
                        value: "no",
                        label: "No",
                      },
                    ]}
                  />
                </div>

                <FileInput
                  name="contract_document_id"
                  label="Select Agreement Document"
                  accept=".pdf"
                />
                <FooterText>
                  * Please, upload a PDF document without cover and signature
                  page, we will take care of that, so you and your customer will
                  be able to sign it digitally.
                </FooterText>
              </section>

              <section>
                <Select
                  instanceId="location_id"
                  name="location_id"
                  placeholder="Units Selector:"
                  onChange={handleSpaceChange}
                  isDisabled={!!initialService}
                  formatType="locations"
                  options={allLocations?.data.map((location) => ({
                    value: location.id,
                    label: location.name,
                    name: location.name,
                    photo: location.photos[0],
                    address: location.address,
                  }))}
                  isLoading={locationsLoadiong}
                  onMenuScrollToBottom={handleLocationSelectSrollsToBottom}
                />
                <div className={styles.row}>
                  <p>Selecte the Service Type:</p>

                  <div className={styles.subRowContainer}>
                    <CustomRadio
                      name="service_type"
                      onChange={handleServiceTypeChange}
                      disabled={!!initialService}
                      options={SERVICE_TYPES?.map((service) => ({
                        value: service.slug,
                        label: service.abbr,
                        tooltip: service.name,
                      }))}
                    />
                  </div>
                </div>

                <Select
                  instanceId="resource_id"
                  name="resource_id"
                  placeholder="Services"
                  onChange={(option: OptionType) =>
                    setResourceId(option ? String(option.value) : null)
                  }
                  isDisabled={!offeredServices || !!initialService}
                  isSearchable
                  options={offeredServicesFiltered?.map((service) => ({
                    value: service.id,
                    label: service.name,
                    photo: service.photo ? service.photo[0] : service.photos[0],
                    name: service.name,
                    location: service.location,
                  }))}
                  formatType="services"
                />
                <div className={styles.row}>
                  <p>Contract term size:</p>
                  <Select
                    instanceId="term_size"
                    name="term_size"
                    placeholder="Years"
                    isClearable={false}
                    width={150}
                    isDisabled={!selectedResource}
                    onChange={handleTermSizeChange}
                    options={
                      selectedResource &&
                      selectedResource.prices.map((prices) => ({
                        value: prices.duration,
                        label: FrindlyTermSizeEnum[prices.duration],
                      }))
                    }
                  />
                </div>
                <div className={styles.row}>
                  <p>Service Start Date:</p>

                  <DatePickerAntd name="service_started_date" />
                </div>
                <div className={styles.row}>
                  <p>This contract will auto-renewal?</p>

                  <Radio
                    name="auto_renewal"
                    options={[
                      { value: "yes", label: "Yes" },
                      {
                        value: "no",
                        label: "No",
                      },
                    ]}
                  />
                </div>
                <div className={styles.row}>
                  <p>Payment recurring style:</p>

                  <Radio
                    name="payment_recurring_style"
                    onChange={handlePaymentRecurringChange}
                    disabled={paymentRecurringDisabled}
                    options={[
                      {
                        value: "MONTHLY",
                        label: "Monthly",
                      },
                      {
                        value: "TOTAL",
                        label: "Total",
                      },
                    ]}
                  />
                </div>
                <div className={styles.row}>
                  <p>Amount</p>
                  <Input
                    name="amount"
                    value={Money({ amount }).toFormat("$0,0.00")}
                    onChange={handleAmountChange}
                    width={150}
                    textAlign="center"
                  />
                </div>
                <div className={styles.row}>
                  <p>
                    How many Days of <strong>Coworking usage per Month?</strong>
                  </p>
                  <Input
                    name="cowork_usage_per_month"
                    type="number"
                    placeholder="00"
                    min="0"
                    extraClass={styles.numberInput}
                  />
                </div>
                <div className={styles.row}>
                  <p>
                    How many Hours of{" "}
                    <strong>Meeting Room usage per Month?</strong>
                  </p>
                  <Input
                    name="meeting_room_per_month"
                    type="number"
                    placeholder="00"
                    min="0"
                    extraClass={styles.numberInput}
                  />
                </div>
              </section>
            </ContractContainer>

            <InvoiceContainer isVisible={currentStep === 1}>
              <section>
                <Row>
                  <p>Due Date:</p>
                  <DatePickerAntd name="due_date" />
                </Row>

                <div className="table__container">
                  <ServiceTableFormBlock
                    hiddenColumns={["quantity"]}
                    initialData={initalTableData}
                    hideActionsButtons={true}
                  />
                </div>
              </section>
            </InvoiceContainer>

            {selectedResource?.taxes?.map((tax, index) =>
              Object.entries(tax).map(([key, value]) => (
                <HiddenInput
                  key={`${index}-${key}-${value}`}
                  name={`initial_payment[${index}].${key}`}
                  value={value}
                />
              ))
            )}

            {/* {selectedResource?.fees && (
              <HiddenInput
                name="first_invoice_amount"
                value={selectedResource.fees?.reduce(
                  (acc, value) => acc + parseInt(value.amount),
                  0
                )}
              />
            )} */}

            <ReviewContainer isVisible={currentStep === 2}>
              <section>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="First Name"
                    value={
                      formRef.current?.getFieldValue("client.first_name") ?? ""
                    }
                    readOnly
                  />
                  <InputComponent
                    placeholder="Middle Name"
                    value={
                      formRef.current?.getFieldValue("client.middle_name") ?? ""
                    }
                    readOnly
                  />
                </div>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="Last Name"
                    value={
                      formRef.current?.getFieldValue("client.last_name") ?? ""
                    }
                    readOnly
                  />
                </div>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="Email"
                    title={formRef.current?.getFieldValue("client.email") ?? ""}
                    value={formRef.current?.getFieldValue("client.email") ?? ""}
                    readOnly
                  />
                </div>
                <div className={styles.row}>
                  <InputComponent
                    type="tel"
                    placeholder="Personal Phone"
                    mask="phone"
                    value={
                      formRef.current?.getFieldValue("client.personal_phone") ??
                      ""
                    }
                    readOnly
                  />
                  <InputComponent
                    type="tel"
                    placeholder="Phone"
                    mask="phone"
                    value={formRef.current?.getFieldValue("client.phone") ?? ""}
                    readOnly
                  />
                </div>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="Address"
                    value={
                      formRef.current?.getFieldValue(
                        "client.personal_address.fulltext"
                      ) ?? ""
                    }
                    readOnly
                  />
                </div>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="Address 2"
                    value={
                      formRef.current?.getFieldValue(
                        "client.personal_address.fulltext2"
                      ) ?? ""
                    }
                    readOnly
                  />
                </div>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="Company Name"
                    value={
                      formRef.current?.getFieldValue("client.company_name") ??
                      ""
                    }
                    readOnly
                  />
                </div>

                <ImagesPreviewContainer>
                  <ul>
                    {formRef.current
                      ?.getFieldValue("documents")
                      .map((file: File & { pngData: string }) => (
                        <li key={`${file.name}-${file.size}`}>
                          <Image
                            width={80}
                            height={80}
                            objectFit="cover"
                            src={
                              file.pngData
                                ? file.pngData
                                : URL.createObjectURL(file)
                            }
                            alt=""
                          />
                        </li>
                      ))}
                  </ul>
                </ImagesPreviewContainer>
              </section>
              <section>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="Selected Service"
                    value={selectedResource?.name ?? ""}
                    readOnly
                  />
                </div>
                <div className={styles.row}>
                  <p>Contract term size</p>
                  <span>
                    <strong>
                      {FrindlyTermSizeEnum[
                        formRef.current?.getFieldValue("term_size")
                      ] ?? ""}
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>Service Start Date:</p>
                  <span>
                    <strong>
                      {formatDateNew(
                        formRef.current?.getFieldValue("service_started_date")
                      ) ?? ""}
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>Service End Date:</p>
                  <span>
                    <strong>
                      {calculateEndDate(
                        formRef.current?.getFieldValue("service_started_date"),
                        formRef.current?.getFieldValue("term_size")
                      )}
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>This contract requests signature?</p>
                  <span>
                    <strong>
                      {formRef.current?.getFieldValue("request_sign") ?? ""}
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>This contract will auto-renewal?</p>
                  <span>
                    <strong>
                      {formRef.current?.getFieldValue("auto_renewal") ?? ""}
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>Payment recurring style:</p>
                  <span>
                    <strong>
                      {PaymentRecurringEnum[
                        formRef.current?.getFieldValue(
                          "payment_recurring_style"
                        )
                      ] ?? ""}
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>Amount for every recurred invoice:</p>
                  <span>
                    <strong>{Money({ amount }).toFormat("$0,0.00")}</strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>How many Days of Coworking usage per Month?</p>
                  <span>
                    <strong>
                      {formRef.current?.getFieldValue(
                        "cowork_usage_per_month"
                      ) ?? ""}{" "}
                      Days
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <p>How many Hours of Meeting Room usage per Month?</p>
                  <span>
                    <strong>
                      {formRef.current?.getFieldValue(
                        "meeting_room_per_month"
                      ) ?? ""}{" "}
                      Hours
                    </strong>
                  </span>
                </div>
                <div className={styles.row}>
                  <InputComponent
                    placeholder="Selected Document"
                    value={
                      formRef.current?.getFieldValue("contract_document_id")
                        ?.name ?? ""
                    }
                    readOnly
                  />
                </div>
              </section>
              <section>
                <SectionDivider>Initial Payment</SectionDivider>
                <ul>
                  {formRef.current
                    ?.getData()
                    ?.items?.map((item: TableCellData, index: number) =>
                      item.name.length > 0 ? (
                        <li key={`${index}-${item.name}-${item.unit_price}`}>
                          <div>
                            <p>{item.name}</p>
                            <span>
                              <strong>{item.unit_price}</strong>
                            </span>
                          </div>

                          <ul>
                            {item.taxes?.map((tax, i) => (
                              <li key={`${i}-${tax.name}`}>
                                <p>{tax.name}</p>
                                <span>
                                  <strong>
                                    {formatTax(Number(tax.value), tax.method)}
                                  </strong>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ) : null
                    )}
                </ul>

                <div className={styles.row}>
                  <p>Final Price</p>
                  <span>
                    <strong>
                      {Money({ amount: finalAmount }).toFormat("$0,0.00")}
                    </strong>
                  </span>
                </div>
              </section>
            </ReviewContainer>
          </FormContent>

          <div className={styles.buttonContainer}>
            <Button
              text={
                currentStep !== 2 ? "PROCEED ATTACHMENT" : "START ATTACHMENT"
              }
              type="submit"
              loading={isLoading}
              className={isLoading ? styles.loading : ""}
            />
          </div>
        </Form>
      </>
    </Modal>
  );

  function BoldsignIdentityAlert() {
    return bsIdentity && bsIdentity.status === IdentityStatus.APPROVED ? (
      <Tooltip title="You are successfully integrated.">
        <CheckCircleTwoTone color="#52c41a" twoToneColor="#52c41a" />
      </Tooltip>
    ) : (
      <Tooltip title="You must complete the ingratation with BoldSign service to send contract.">
        <WarningTwoTone color="#faad14" twoToneColor="#faad14" />
      </Tooltip>
    );
  }
};

const filterTaxes = (taxes: Tax[]): Tax[] => {
  if (!taxes) return [];

  const taxesWithId = taxes.map((tax) => ({
    ...tax,
    id: Math.round(Math.random() * 1000),
  }));
  return taxesWithId.filter((tax) => tax.recurring_type === "CREATED");
};

const formatTax = (amount: number, method: string) => {
  if (method === "FIXED") return Money({ amount }).toFormat("$0,0.00");
  return `${Money({ amount }).toFormat("0.00")}%`;
};

const formatServiceValue = (
  resource: Resource,
  amount: number
): ServiceValue => {
  if (!resource) return { amount: "0", name: "", description: "", taxes: [] };
  return {
    amount: String(amount),
    name: resource.name,
    description: resource.description,
    taxes: filterTaxes(resource?.taxes),
    initialInvoiceAmount: true,
  };
};
const formatTableData = (resource: Resource, serviceValue: ServiceValue) => {
  if (!resource) return [];

  return [serviceValue, ...resource.fees];
};

const calculateTotalTaxesAmount = (data: TableCellData[]): number => {
  if (!data?.length) {
    return 0;
  }

  return data.reduce(
    (acc, item) =>
      item?.taxes
        ? acc +
          formatItemPrice(item) +
          item?.taxes?.reduce(
            (taxAcc, tax) =>
              tax.method === "FIXED"
                ? taxAcc + Number(tax.value)
                : taxAcc +
                  Money({
                    amount: formatItemPrice(item),
                  })
                    .percentage(tax.value / 100)
                    .getAmount(),
            0
          )
        : acc + formatItemPrice(item),
    0
  );
};

const formatItemPrice = (item: TableCellData) =>
  parseInt(currencyUnmask(item.unit_price));

const calculateFinalPrice = (
  basePrice: number,
  taxes: Tax[],
  additionalFees: TableCellData[]
) => {
  taxes = taxes.filter((tax) => tax.recurring_type === "CREATED");

  let total = taxes.reduce((total, tax) => {
    if (tax.method === "FIXED") {
      return total.add(Money({ amount: tax.value }));
    }
    return total.add(Money({ amount: basePrice }).percentage(tax.value / 100));
  }, Money({ amount: basePrice }));

  if (additionalFees) {
    total = additionalFees.reduce((total, fee) => {
      return total.add(Money({ amount: parseInt(currencyUnmask(fee.total)) }));
    }, total);
  }

  return total.getAmount();
};

const calculateEndDate = (startDate: Date, contractLength: TermSizeType) => {
  let result = new Date(startDate);
  if (!contractLength) return "";
  const addNum = Number(contractLength.at(-1));

  if (contractLength.includes("MONTH")) {
    return format(
      add(result, {
        months: addNum,
      }),
      "MM/dd/yyyy"
    );
  }
  return format(
    add(result, {
      years: addNum,
    }),
    "MM/dd/yyyy"
  );
};

const SERVICE_TYPES = [
  {
    name: "Private Room",
    slug: "PRIVATE_ROOM",
    abbr: "PR",
  },
  {
    name: "Open Desk",
    slug: "OPEN_DESK",
    abbr: "OD",
  },
  {
    name: "Virtual Office",
    slug: "VIRTUAL_OFFICE",
    abbr: "VO",
  },
];
