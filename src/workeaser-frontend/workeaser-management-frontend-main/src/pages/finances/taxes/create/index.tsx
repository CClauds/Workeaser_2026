import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { ServiceCheckbox } from "@components/Form/ServiceCheckbox";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import Money from "dinero.js";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import {
  ChangeEvent,
  KeyboardEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { Fallback } from "types";
import { TaxData, TaxeResponse } from "types/cowork/financial/taxes";
import { Service } from "types/infos";
import * as Yup from "yup";
import styles from "./styles.module.scss";

interface FormData {
  name: string;
  method: string;
  type: string;
  value: string;
  recurring_type: string;
  services: { id: number | string }[];
}

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
  const apiClient = getAPIClient(context);

  const servicesPromise = apiClient.get("/infos/services");
  const taxTypesPromise = apiClient.get("/infos/taxtypes");
  const promises: Promise<any>[] = [servicesPromise, taxTypesPromise];

  if (id) {
    const taxesPromise = apiClient.get<TaxeResponse>(
      `/cowork/finance/taxes/${id}`
    );
    promises.push(taxesPromise);
  }

  const responseArray = await Promise.all(promises);
  const [{ data: services }, { data: taxTypes }, taxesResponse] = responseArray;
  const initialData = taxesResponse ? taxesResponse.data.result : null;

  return {
    props: {
      services: services.result,
      taxTypes: taxTypes.result,
      initialData,
    },
  };
};

interface CreateTaxOrFeeProps {
  services: Service[];
  taxTypes: { slug: string; name: string }[];
  initialData: TaxData;
}

const CreateTaxOrFee = ({
  services,
  taxTypes,
  initialData,
}: CreateTaxOrFeeProps) => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("PERCENTAGE");

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...initialData,
        services: services?.map((service) => ({
          id: initialData.services.some(
            (selectedService) => selectedService.id === service.id
          ),
        })),
      };
      setAmount(initialData.value);
      setMethod(initialData.method);
      formRef.current?.setData(formData);
    }
  }, [initialData]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string().min(2).required(),
        method: Yup.string().required("Method is required"),
        type: Yup.string().required("Type is required"),
        recurring_type: Yup.string().required("Recurring type is required"),
        value: Yup.string().required("Amount is required"),
        // services: Yup.array()
        //   .of(
        //     Yup.object().shape({
        //       id: Yup.string(),
        //       checked: Yup.boolean(),
        //     })
        //   )
        //   .test("is service true", "Nee", (answers) => {
        //     return answers.some((answer) => answer.checked);
        //   }),
        // .compact((v) => !v.checked)
        // .required("required-field"),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      const body = {
        ...data,
        value: parseInt(data.value.replace(/\$|,|\.|%/g, "")),
        services: data.services.filter((service) => service.id),
      };

      setIsLoading(true);

      if (id) {
        await api.put(`/cowork/finance/taxes/${id}`, body);
        mutate("/cowork/finance/taxes");
        toast.success("Tax updated");
      } else {
        await api.post("/cowork/finance/taxes", body);
        mutate("/cowork/finance/taxes");
        toast.success("Tax added");
      }
      router.push("/finances/taxes");
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        console.log(err);
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
          });
          console.log(validationErrors);
          formRef.current.setErrors(validationErrors);
        }
      } else {
        // HF-AUDIT-01: optional chaining incompleto causava "Cannot read properties of undefined (reading 'data')"
        // quando err.response não existia (timeout/rede) ou data.error.message não era array (formato novo do backend).
        const errorData = err?.response?.data?.error?.message;
        if (Array.isArray(errorData)) {
          errorData.forEach((message) => {
            toast.error(message?.message || String(message));
          });
        } else if (typeof errorData === "string") {
          toast.error(errorData);
        } else if (err?.message) {
          toast.error(err.message);
        } else {
          toast.error("Erro ao criar taxa. Tente novamente.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMethod(value);
    if (value === "PERCENTAGE") {
      if (amount > 10000) {
        setAmount(10000);
        return;
      }
    }
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const number = value.replace(/\$|,|\.|%/g, "");

    if (!number) {
      setAmount(0);
      return;
    }
    if (method === "PERCENTAGE") {
      if (parseInt(number) < 0 || parseInt(number) > 10000) {
        return;
      }
    }
    setAmount(parseInt(number, 10) ?? 0);
  };

  const handleAmountKeyup = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && method === "PERCENTAGE") {
      const amountString = Money({ amount: amount }).toFormat("0.00");
      const number = amountString.replace(/\$|,|\.|%/g, "");
      const value = number.slice(0, -1);
      setAmount(parseInt(value, 10) ?? 0);
    }
  };

  return (
    <>
      <Head>
        <title>{id ? "Update" : "Create"} Tax or Fee | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/finances/dashboard">Finances</Link>
          </h1>
          <h2>
            <Link href="/finances/taxes">Taxs &amp; Extra Fees</Link>
          </h2>
          <h2>{id ? "Update" : "Create"} Tax or Fee</h2>
        </div>
      </PageHeader>

      <section className={styles.sectionContainer}>
        <h1>{id ? "Update" : "Create"} a Tax or Fee</h1>
        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.formContainer}
          initialData={{ method: initialData?.method ?? "PERCENTAGE" }}
        >
          <Input name="name" placeholder="Tax or Fee Name" />

          <Select
            instanceId="type"
            name="type"
            placeholder="Tax &amp; Fee Type"
            isSearchable
            options={taxTypes?.map((type) => ({
              value: type.slug,
              label: type.name,
            }))}
          />

          <div className={styles.row}>
            <p>Automatically add to:</p>
            <div className={styles.servicesContainer}>
              {services?.map((service, index) => (
                <ServiceCheckbox
                  key={service.id}
                  name={`services[${index}].id`}
                  value={service.id}
                  label={service.abbr}
                  tooltip={service.name}
                />
              ))}
            </div>
          </div>

          <Select
            instanceId="recurringType"
            name="recurring_type"
            placeholder="Recurring Type"
            options={[
              { value: "CREATED", label: "Invoice Creation" },
              { value: "OVERDUE", label: "Overdue Invoice" },
            ]}
          />

          <div className={styles.row}>
            <p>Calculation method:</p>
            <Radio
              name="method"
              onChange={handleMethodChange}
              options={[
                {
                  value: "PERCENTAGE",
                  label: "Percentage",
                },
                { value: "FIXED", label: "Fixed Value" },
              ]}
            />
          </div>

          <div className={styles.row}>
            <p>Tax or Fee Amount</p>
            <Input
              name="value"
              value={
                method === "FIXED"
                  ? Money({ amount: amount }).toFormat("$0,0.00")
                  : `${Money({ amount: amount }).toFormat("0.00")}%`
              }
              onChange={handleAmountChange}
              onKeyUp={handleAmountKeyup}
              extraClass={styles.input}
            />
          </div>

          <Button
            text={id ? "UPDATE TAX OR FEE" : "ADD TAX OR FEE"}
            type="submit"
            loading={isLoading}
            extraClass={isLoading ? styles.loading : ""}
          />
        </Form>
      </section>
    </>
  );
};

export default CreateTaxOrFee;
CreateTaxOrFee.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
