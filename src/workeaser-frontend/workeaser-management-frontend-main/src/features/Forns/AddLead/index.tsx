import { Button } from "@components/Button";
import { CustomRadio } from "@components/Form/CustomRadio";
import { Input } from "@components/Form/Input";
import { api } from "@services/api";
import { Row } from "@styles/reusable";
import { FormHandles, SubmitHandler } from "@unform/core";
import { errorHandler } from "@utils/errors";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import * as Yup from "yup";
import { ButtonsContainer, Container, Form } from "./styles";

interface FormData {
  client_account: {
    company_name?: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
      personal_phone: string;
    };
  };
  opportunities: {
    service: string;
  };
}

interface AddLeadProps {
  onClose?: () => void;
}
export const AddLead: React.FC<AddLeadProps> = ({ onClose }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        client_account: Yup.object().shape({
          user: Yup.object().shape({
            first_name: Yup.string().required(),
            last_name: Yup.string().required(),
            email: Yup.string().email().required(),
            personal_phone: Yup.string().min(14).required(),
          }),
        }),
        opportunities: Yup.array().of(
          Yup.object().shape({
            service: Yup.string().required(),
          })
        ),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      await api.post("/cowork/relationship/personasmanagement", data);

      mutate("/cowork/relationship/salespipeline");
      toast.success("Lead added.");
      if (onClose) onClose();
      router.push("/relationship/lead-management/pipeline");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <Row gap={15}>
          <Input
            name="client_account.user.first_name"
            placeholder="First Name"
          />
          <Input name="client_account.user.last_name" placeholder="Last Name" />
        </Row>

        <Row gap={15}>
          <Input name="client_account.user.email" placeholder="Email" />
          <Input
            name="client_account.user.personal_phone"
            type="tel"
            placeholder="Phone"
            mask="phone"
          />
        </Row>

        <Input name="client_account.company_name" placeholder="Company Name" />

        <Row gap={15}>
          <p>Selected the Service Type:</p>

          <Row gap={5}>
            <CustomRadio
              name="opportunities[0].service"
              options={SERVICE_TYPES?.map((service) => ({
                value: service.slug,
                label: service.abbr,
                tooltip: service.name,
              }))}
            />
          </Row>
        </Row>

        <ButtonsContainer>
          <Button text="ADD NEW LEAD" type="submit" loading={isLoading} />
        </ButtonsContainer>
      </Form>
    </Container>
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
  {
    name: "Meeting Room",
    slug: "MEETING_ROOM",
    abbr: "MR",
  },
];
