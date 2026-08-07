import { Button } from "@components/Button";
import { CustomSelect } from "@components/Form/CustomSelect";
import { DatePickerAntd } from "@components/Form/DatePickerAntd";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { ServiceTableFormBlock } from "@components/FormBlocks/ServiceTableFormBlock";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { errorHandler } from "@utils/errors";
import { formatSuggestion } from "@utils/helpers";
import { currencyUnmask } from "@utils/masks";
import dayjs from "dayjs";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import type { Fallback, OptionType } from "types";
import { Fee } from "types/cowork";
import { Client, ClientUpdated, ClientsResponse } from "types/cowork/clients";
import {
  Invoice,
  InvoiceData,
  InvoiceResponse,
} from "types/cowork/financial/invoices";
import { LocationData, LocationResponse } from "types/locations";
import * as Yup from "yup";
import styles from "./styles.module.scss";

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

  const { id } = context.query;
  const { dup } = context.query;
  const apiClient = getAPIClient(context);
  const clientsPromise = apiClient.get<ClientsResponse>("/cowork/clients");
  const locationsPromise = apiClient.get<LocationData>("/cowork/locations");
  const promises: Promise<any>[] = [clientsPromise, locationsPromise];

  if (id || dup) {
    const invoicePromise = apiClient.get<InvoiceResponse>(
      `/cowork/finance/invoices/${id || dup}`
    );
    promises.push(invoicePromise);
  }

  const responseArray = await Promise.all(promises);

  const [{ data: clients }, { data: locations }, invoiceResponse] =
    responseArray;

  const invoice = invoiceResponse ? invoiceResponse.data.result.invoice : null;

  return {
    props: {
      clients: clients.result,
      locationsFallback: {
        "/cowork/locations?page=1": locations,
      },
      invoice,
    },
  };
};

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
  additional_notes: string;
  invoice_action: string;
  date: string | Date;
  due_date: string | Date;
  items: TableCellData[];
}

interface CreateInvoiceProps {
  clients: Client[];
  locationsFallback: Fallback;
  invoice: InvoiceData;
}
const CreateInvoice = ({
  clients,
  locationsFallback,
  invoice,
}: CreateInvoiceProps) => {
  const router = useRouter();
  const { id } = router.query;
  const { dup } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number>();
  const [initalTableData, setInitalTableData] = useState<Fee[]>();
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl, { fallback: locationsFallback });

  useEffect(() => {
    if (locations) {
      const newLocations = [...allLocations.data, ...locations];
      setAllLocations((state) => ({ ...state, data: newLocations }));
    }
  }, [locations]);

  const { data: { result: currentLocation } = {} } = useFetch<LocationResponse>(
    selectedLocationId ? `/cowork/locations/${selectedLocationId}` : null
  );

  let suggestion = formatSuggestion(currentLocation);

  const formRef = useRef<FormHandles>(null);

  let action: string;

  useEffect(() => {
    if (invoice) {
      setInitalTableData(
        invoice.items?.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: String(item.quantity),
          unit_price: String(item.unit_price),
          amount: String(item.unit_price),
          date: item.date,
          taxes: item.fees,
          resource_id: item.resource_id,
          service_type: item.service_type,
        }))
      );

      const currentLocation = locations.find(
        (location) => location.id === invoice.location_id
      );
      const formData: Partial<FormData> = {
        client_uuid: invoice?.user?.uuid,
        customer_name: `${invoice.user.first_name} ${invoice.user.last_name}`,
        customer_phone: invoice.user.personal_phone,
        customer_email: invoice.user.email,
        company_name:
          invoice.user.clientAccount?.company_name ?? "Not informed.",
        location_id: invoice.location_id,
        location_email: invoice.location.email,
        location_name: invoice.location.name,
        location_phone: invoice.location.phone,
        location_address: currentLocation.address,
        date: new Date(invoice.date),
        due_date: new Date(invoice.due_date),
        additional_notes: invoice.additional_notes,
      };
      formRef.current.setData(formData);
    }
  }, [invoice]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        client_uuid: Yup.string().required(),
        location_id: Yup.string().required(),
        date: Yup.string().required(),
        due_date: Yup.string().required(),
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
        invoice_action,
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

      let invoiceResponse: Invoice;
      if (id && !dup) {
        const { data: response } = await api.put<{ result: Invoice }>(
          `/cowork/finance/invoices/${id}`,
          body
        );

        toast.success("Invoice updated.");
        invoiceResponse = response.result;
      } else {
        const { data: response } = await api.post<{ result: Invoice }>(
          "/cowork/finance/invoices",
          body
        );
        toast.success("Invoice created.");
        invoiceResponse = response.result;
      }

      if (action) {
        if (action === "LINK") {
          const hostName = window.location.hostname;
          navigator.clipboard.writeText("<empty clipboard>").then(
            () => {
              navigator.clipboard.writeText(
                `${hostName}/invoice-payment/${invoiceResponse.uuid}`
              );
              toast.success("Invoice link copied to Clipboard.");
            },
            (e) => {
              console.log(e);
            }
          );
        }
        // else if (action === "SEND") {
        // }
      }

      mutate("/cowork/finance/invoices");
      router.push("/finances/invoices");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      formRef.current.clearField("invoice_action");
      action = null;
      setIsLoading(false);
    }
  };

  const handleSelectSubmitChange = (option: OptionType) => {
    action = option.value as string;
    formRef.current?.submitForm();
  };

  const handleClientChange = (option: OptionType) => {
    if (option) {
      const client = clients.find((client) => client.uuid === option.value);
      formRef.current.setFieldValue(
        "customer_name",
        `${client.first_name} ${client.last_name}`
      );
      formRef.current.setFieldValue("customer_email", client.email);
      formRef.current.setFieldValue("customer_phone", client.personal_phone);
      formRef.current.setFieldValue(
        "company_name",
        client?.clientAccount?.company_name
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
          <h2>Create Invoice</h2>
        </div>
      </PageHeader>

      <div className={styles.contentContainer}>
        <h1>Create a New Invoice:</h1>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          initialData={{
            date: dayjs(),
            due_date: dayjs(),
          }}
        >
          <div className={styles.formContent}>
            <div className={styles.formElements}>
              <Select
                instanceId="client_uuid"
                name="client_uuid"
                placeholder="Client Information"
                onChange={handleClientChange}
                options={clients?.map((client) => ({
                  value: client.uuid,
                  label: client.first_name,
                  photo: client.photo?.file,
                  first_name: client.first_name,
                  last_name: client.last_name,
                  company_name: client?.clientAccount?.company_name ?? "",
                  email: client.email,
                  personal_phone: client.personal_phone,
                }))}
                formatType="user"
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
                options={locations?.map((location) => ({
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
            <ServiceTableFormBlock
              initialData={initalTableData}
              servicesOptions={suggestion}
            />
          </div>

          <div className={styles.submit_button}>
            <Button
              text="Save Invoice"
              type="submit"
              loading={isLoading}
              className={isLoading ? styles.loading : ""}
            />
            <CustomSelect
              name="invoice_action"
              width={200}
              label="Save Options"
              loading={isLoading}
              onChange={handleSelectSubmitChange}
              className={styles.selectSubmit}
              options={[
                { value: "LINK", label: "Save & Get Link" },
                { value: "SEND", label: "Save & Send" },
              ]}
            />
          </div>
        </Form>
      </div>
    </>
  );
};

CreateInvoice.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);
export default CreateInvoice;
