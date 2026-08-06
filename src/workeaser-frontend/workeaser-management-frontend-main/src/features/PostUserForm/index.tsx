import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { Country, State, City } from "country-state-city";
import { ButtonsContainer, Container, Form } from "./styles";
import * as Yup from "yup";
import { mutate } from "swr";
import { toast } from "react-toastify";
import { Row } from "@styles/reusable";
import { Input } from "@components/Form/Input";
import { Button } from "@components/Button";
import { Address } from "@services/api/cowork/locations/types";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select from "react-select";

interface FormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  personal_phone: string;
  phone?: string;
  personal_address?: Address;
  client?: {
    company_name: string;
  };
}

interface PostUserFormProps {
  onSubmitAction?: () => void;
}

export const PostUserForm: React.FC<PostUserFormProps> = (props) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [personalPhone, setPersonalPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const formRef = useRef<FormHandles>(null);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      data.personal_phone = personalPhone;
      data.phone = phone;
      data.personal_address.country = selectedCountry?.name;
      data.personal_address.state = selectedState?.name;
      data.personal_address.city = selectedCity?.name;

      const schema = Yup.object().shape({
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
        client: Yup.object().shape({
          company_name: Yup.string().optional(),
        }),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      await api.post("/cowork/clients", data);
      mutate("/cowork/clients");
      toast.success("Client added.");
      router.push("/relationship/client-management");
      props?.onSubmitAction?.();
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
          <PhoneInput placeholder="Phone" value={phone} onChange={setPhone} />
        </Row>
        <Input name="personal_address.fulltext" placeholder="Address" />
        <Input name="personal_address.fulltext2" placeholder="Address 2" />
        <Row gap={15}>
          <Select
            options={Country.getAllCountries()}
            getOptionLabel={(options) => {
              return options["name"];
            }}
            getOptionValue={(options) => {
              return options["name"];
            }}
            value={selectedCountry}
            onChange={(item) => {
              setSelectedCountry(item);
            }}
          />
          <Select
            options={State?.getStatesOfCountry(selectedCountry?.isoCode)}
            getOptionLabel={(options) => {
              return options["name"];
            }}
            getOptionValue={(options) => {
              return options["name"];
            }}
            value={selectedState}
            onChange={(item) => {
              setSelectedState(item);
            }}
          />
          <Select
            options={City.getCitiesOfState(
              selectedState?.countryCode,
              selectedState?.isoCode
            )}
            getOptionLabel={(options) => {
              return options["name"];
            }}
            getOptionValue={(options) => {
              return options["name"];
            }}
            value={selectedCity}
            onChange={(item) => {
              setSelectedCity(item);
            }}
          />
        </Row>

        <Row gap={15}>
          <Input name="personal_address.zipcode" placeholder="Zipcode" />
        </Row>
        <Input name="client.company_name" placeholder="Company Name" />

        <ButtonsContainer>
          <Button
            text="ADD NEW CLIENT"
            type="submit"
            loading={isLoading}
            className={isLoading ? "loading" : ""}
          />
        </ButtonsContainer>
      </Form>
    </Container>
  );
};
