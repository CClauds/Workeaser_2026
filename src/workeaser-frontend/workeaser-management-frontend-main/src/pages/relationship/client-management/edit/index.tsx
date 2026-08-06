import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState, ReactElement } from "react";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { useTheme } from "styled-components";
import Head from "next/head";
import Link from "next/link";
import { PageHeader } from "@components/Headers/PageHeader";
import {
  ButtonsContainer,
  Container,
  Form,
} from "features/PostUserForm/styles";
import { PagesProps } from "pages/_app";
import * as Yup from "yup";
import { mutate } from "swr";
import { toast } from "react-toastify";
import { Row } from "@styles/reusable";
import { Input } from "@components/Form/Input";
import { Button } from "@components/Button";
import { Address } from "@services/api/cowork/locations/types";
import { Content } from "@components/ActivityElement/styles";
import { useFetch } from "@hooks/useFetch";
import { Fallback } from "types";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { getAPIClient } from "@services/apiClient";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
interface FormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  personal_phone?: string;
  phone?: string;
  personal_address?: Address;
  client?: {
    company_name: string;
  };
}

interface UpdateUserFormProps {
  clientFallback: Fallback;
}

interface ClientResponse {
  result: ClientData;
}

interface ClientData {
  zipcode: string;
  city: string;
  state: string;
  country: string;
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  personal_phone: string;
  phone: string;
  location: string;
  location2: string;
  company_name: string;
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

  const clientPromise = apiClient.get<ClientResponse>(`/cowork/clients/${id}`);

  const [{ data: client }] = await Promise.all([clientPromise]);

  return {
    props: {
      clientFallback: {
        [`/cowork/clients/${id}`]: client,
      },
    },
  };
};

const EditUserForm = ({ clientFallback }: UpdateUserFormProps) => {
  const router = useRouter();
  const { id } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [personalPhone, setPersonalPhone] = useState("");
  const [phone, setPhone] = useState("");

  const formRef = useRef<FormHandles>(null);
  //const [initialData, setInitialData] = useState<FormData>();
  const { data: { result: clientData } = {} } = useFetch<ClientResponse>(
    `/cowork/clients/${id}`,
    {
      fallback: clientFallback,
    }
  );

  useEffect(() => {
    if (clientData) {
      const formData: Partial<FormData> = {
        first_name: clientData?.first_name,
        middle_name: clientData?.middle_name,
        last_name: clientData?.last_name,
        email: clientData?.email,
        personal_address: {
          fulltext: clientData?.location,
          fulltext2: clientData?.location2,
          country: clientData?.country,
          state: clientData?.state,
          city: clientData?.city,
          zipcode: clientData?.zipcode,
        },
        client: {
          company_name: clientData?.company_name,
        },
      };

      setPersonalPhone(clientData?.personal_phone);
      setPhone(clientData?.phone);
      formRef.current.setData(formData);
    }
  }, [clientData]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      data.personal_phone = personalPhone;
      data.phone = phone;

      const schema = Yup.object().shape({
        first_name: Yup.string().required(),
        middle_name: Yup.string().optional(),
        last_name: Yup.string().required(),
        email: Yup.string().email().required(),
        personal_phone: Yup.string().optional(),
        phone: Yup.string().optional(),
        personal_address: Yup.object().shape({
          fulltext: Yup.string().optional(),
          fulltext2: Yup.string().optional(),
          country: Yup.string().optional(),
          state: Yup.string().optional(),
          city: Yup.string().optional(),
          zipcode: Yup.string().optional(),
        }),
        client: Yup.object().shape({
          company_name: Yup.string().optional(),
        }),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      await api.put(`/cowork/clients/${id}`, data);
      mutate("/cowork/clients");
      toast.success("Client updated.");
      router.push("/relationship/client-management");
      //props?.onSubmitAction?.();
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
        console.log(err, "<- error");
        if (err.response) {
          toast.error(
            err?.response?.data?.error?.message ||
              "Sorry, occurred an unexpected error."
          );
        } else {
          toast.error("Sorry, occurred an unexpected error.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Client Management | Workeaser</title>
      </Head>
      <PageHeader>
        <div>
          <h1>
            <Link href="/relationship/client-management">Relationship</Link>
          </h1>
          <h2>Client Management</h2>
        </div>
      </PageHeader>
      <Content>
        <Container>
          <Form ref={formRef} onSubmit={handleSubmit}>
            <Input name="first_name" placeholder="First Name" />
            <Row gap={15}>
              <Input name="middle_name" placeholder="Middle Name" />
              <Input name="last_name" placeholder="Last Name" />
            </Row>

            <Input name="email" placeholder="Email" />
            <Row gap={15}>
              <PhoneInput
                placeholder="Mobile phone"
                value={personalPhone}
                onChange={setPersonalPhone}
              />
              <PhoneInput
                placeholder="Phone"
                value={phone}
                onChange={setPhone}
              />
            </Row>
            <Input name="personal_address.fulltext" placeholder="Address" />
            <Input name="personal_address.fulltext2" placeholder="Address 2" />
            <Input name="personal_address.country" placeholder="Country" />
            <Input name="personal_address.state" placeholder="State" />
            <Input name="personal_address.city" placeholder="City" />
            <Input name="personal_address.zipcode" placeholder="Zipcode" />
            <Input name="client.company_name" placeholder="Company Name" />

            <ButtonsContainer>
              <Button
                text="Save CLIENT"
                type="submit"
                loading={isLoading}
                className={isLoading ? "loading" : ""}
              />
            </ButtonsContainer>
          </Form>
        </Container>
      </Content>
    </>
  );
};

EditUserForm.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);

export default EditUserForm;
