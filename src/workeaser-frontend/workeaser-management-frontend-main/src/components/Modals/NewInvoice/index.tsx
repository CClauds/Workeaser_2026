import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { DatePickerAntd } from "@components/Form/DatePickerAntd";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { ServiceTableFormBlock } from "@components/FormBlocks/ServiceTableFormBlock";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { formatSuggestion } from "@utils/helpers";
import { currencyUnmask } from "@utils/masks";
import dayjs, { Dayjs } from "dayjs";
import { useFetch } from "hooks/useFetch";
import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { mutate } from "swr";
import type { OptionType } from "types";
import { ClientsResponse } from "types/cowork/clients";
import { LocationData, LocationResponse } from "types/locations";
import * as Yup from "yup";
import styles from "./styles.module.scss";

interface TableCellData {
  id: string;
  date: string;
  name: string;
  description: string;
  quantity: string;
  unit_price: string;
  total: number;
  taxable: boolean;
  deleteId: string;
  taxes: {
    name: string;
    value: string;
    type: string;
    method: string;
    recurring_type: string;
  }[];
  resource_id: number;
  service_type: string;
}

interface FormData {
  client_uuid: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  company_name: string;
  location_id: number;
  location_email: string;
  location_name: string;
  location_phone: string;
  location_address: string;
  taxes: number;
  date: Dayjs;
  due_date: Dayjs;
  items: TableCellData[];
}

interface NewInvoiceProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export const NewInvoice: React.FC<NewInvoiceProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number>();
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  const { data: { result: clients } = {} } =
    useFetch<ClientsResponse>("/cowork/clients");

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl);

  const { data: { result: currentLocation } = {} } = useFetch<LocationResponse>(
    selectedLocationId ? `/cowork/locations/${selectedLocationId}` : null
  );

  let suggestion = formatSuggestion(currentLocation);

  useEffect(() => {
    if (locations) {
      const newLocations = [...allLocations.data, ...locations];
      setAllLocations((state) => ({ ...state, data: newLocations }));
    }
  }, [locations]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        client_uuid: Yup.string().required(),
        location_id: Yup.string().required(),
        items: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required(),
            service_type: Yup.string().required(),
            date: Yup.string().required(),
            unit_price: Yup.string().notOneOf(["$0.00"]).required(),
            resource_id: Yup.number().required(),
          })
        ),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const {
        customer_name,
        customer_phone,
        customer_email,
        company_name,
        location_email,
        location_name,
        location_phone,
        location_address,
        taxes,
        ...bodyData
      } = data;

      const body = {
        ...bodyData,
        items: data.items?.map((item) => ({
          name: item.name,
          service_type: item.service_type,
          date: item.date,
          description: item.description,
          quantity: parseInt(item.quantity),
          unit_price: parseInt(currencyUnmask(item.unit_price)),
          fees:
            item.taxes?.map((tax) => ({
              name: tax.name,
              method: tax.method,
              type: tax.type,
              recurring_type: tax.recurring_type,
              value: parseInt(tax.value),
              taxes: [],
            })) ?? [],
          resource_id: item.resource_id,
        })),
      };

      await api.post("/cowork/finance/invoices", body);
      mutate("/cowork/finance/invoices");
      toast.success("Invoice Created");
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
      const client = clients.find((client) => client.uuid === option.value);
      formRef.current.setFieldValue(
        "customer_name",
        `${client.first_name} ${client.last_name}`
      );
      formRef.current.setFieldValue("customer_email", client.email);
      formRef.current.setFieldValue(
        "customer_phone",
        client.personal_phone ?? "Not informed"
      );
      formRef.current.setFieldValue(
        "company_name",
        client.clientAccount.company_name
      );
    } else {
      formRef.current.clearField("customer_name");
      formRef.current.clearField("customer_email");
      formRef.current.clearField("customer_phone");
      formRef.current.clearField("company_name");
    }
  };

  const handleLocationChange = (option: OptionType) => {
    if (option) {
      const location = locations.find(
        (location) => location.id === option.value
      );
      setSelectedLocationId(location.id);
      formRef.current.setFieldValue("location_name", location.name);
      formRef.current.setFieldValue(
        "location_email",
        location.email ?? "Not informed"
      );
      formRef.current.setFieldValue(
        "location_phone",
        location.phone ?? "Not informed"
      );
      formRef.current.setFieldValue("location_address", location.address);
    } else {
      setSelectedLocationId(null);
      formRef.current.clearField("location_name");
      formRef.current.clearField("location_email");
      formRef.current.clearField("location_phone");
      formRef.current.clearField("location_address");
    }
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

  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Create a New Invoice</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          initialData={{ date: dayjs(), due_date: dayjs() }}
        >
          <div className={styles.formContent}>
            <div className={styles.formElements}>
              <Select
                instanceId="client_uuid"
                name="client_uuid"
                placeholder="Pull Client Information with the UUID or Email"
                onChange={handleClientChange}
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
                isLoading={!clients}
              />
              <Input
                name="customer_name"
                type="text"
                placeholder="Customer Name"
                readOnly
              />
              <div className={styles.row}>
                <Input
                  name="customer_email"
                  type="text"
                  placeholder="Email"
                  readOnly
                />
                <Input
                  name="customer_phone"
                  type="text"
                  placeholder="Phone"
                  readOnly
                />
              </div>
              <Input
                name="company_name"
                type="text"
                placeholder="Company Name"
                readOnly
              />
            </div>
            <div className={styles.formElements}>
              <Select
                instanceId="location_id"
                name="location_id"
                placeholder="Location of the Sale"
                onChange={handleLocationChange}
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
              <Input
                name="location_name"
                type="text"
                placeholder="Location Name"
                readOnly
              />
              <div className={styles.row}>
                <Input
                  name="location_email"
                  type="text"
                  placeholder="Email"
                  readOnly
                />
                <Input
                  name="location_phone"
                  type="text"
                  placeholder="Phone"
                  readOnly
                />
              </div>
              <Input
                name="location_address"
                type="text"
                placeholder="Location Address"
                readOnly
              />
            </div>
            <div className={styles.formElements}>
              <div className={styles.row}>
                <p>Invoice Date:</p>
                <DatePickerAntd name="date" />
              </div>
              <div className={styles.row}>
                <p>Due Date:</p>
                <DatePickerAntd name="due_date" />
              </div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <ServiceTableFormBlock servicesOptions={suggestion} />
          </div>

          <div className={styles.submit_button}>
            <Button
              type="submit"
              text="Save Invoice"
              loading={isLoading}
              className={isLoading ? styles.loading : ""}
            />
          </div>
        </Form>
      </>
    </Modal>
  );
};
