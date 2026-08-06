import { Button } from "@components/Button";
import { CustomLink } from "@components/CustomLink";
import { Checkbox } from "@components/Form/Checkbox";
import { CustomRadio } from "@components/Form/CustomRadio";
import { Input } from "@components/Form/Input";
import { Icomoon } from "@components/Icomoon";
import { api } from "@services/api";
import {
  CheckboxLabel,
  Container,
  Footer,
  Form,
  Row,
  Subtitle,
} from "@styles/pages/create-account/styles";
import { FormHandles, SubmitHandler } from "@unform/core";
import { errorHandler } from "@utils/errors";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type FormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  personal_phone: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "COWORKING" | "CLIENT";
  cowork: {
    name: string;
  };
};

const CreateAccount = () => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("COWORKING");
  const [personalPhone, setPersonalPhone] = useState("");

  const router = useRouter();

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      data.personal_phone = personalPhone;

      // HF-SPRINT-O: mensagens de validação em PT-BR
      const schema = Yup.object().shape({
        first_name: Yup.string().min(3, "Mínimo 3 caracteres").required("Nome obrigatório"),
        middle_name: Yup.string().min(1, "Mínimo 1 caractere").required("Nome do meio obrigatório"),
        last_name: Yup.string().min(3, "Mínimo 3 caracteres").required("Sobrenome obrigatório"),
        email: Yup.string().email("Email inválido").required("Email obrigatório"),
        personal_phone: Yup.string().optional(),
        cowork:
          role === "COWORKING"
            ? Yup.object().shape({
                name: Yup.string()
                  .min(3, "Mínimo 3 caracteres")
                  .required("Nome do coworking obrigatório"),
              })
            : null,
        password: Yup.string()
          .min(8, "Mínimo 8 caracteres")
          .required("Senha obrigatória"),
        password_confirmation: Yup.string()
          .min(8, "Mínimo 8 caracteres")
          .oneOf([Yup.ref("password"), null], "As senhas não conferem"),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      const { data: response } = await api.post("/auth/signup", data);
      const message =
        response?.result?.message ??
        "Account created. Please check your email to confirm your account before logging in.";
      toast.success(message);
      router.push("/login");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRole(event.target.value);
  };

  return (
    <Container>
      <figure>
        <Image
          src="/images/workeaser-logo.png"
          alt="workeaser logo"
          width={200}
          height={57}
        />
      </figure>
      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        initialData={{ email: "", password: "", role: "COWORKING" }}
      >
        <Row>
          <Input
            name="first_name"
            placeholder="* First Name"
            icon="user"
            extraClass="input"
          />
        </Row>
        <Row>
          <Input
            name="middle_name"
            placeholder="* Middle Name"
            icon="user"
            extraClass="input"
          />
          <Input
            name="last_name"
            placeholder="* Last Name"
            icon="user"
            extraClass="input"
          />
        </Row>

        <Input
          name={role === "COWORKING" ? "cowork.name" : "client.company_name"}
          placeholder={role === "COWORKING" ? "* Company Name" : "Company Name"}
          extraClass="input"
        />
        <Row>
          <Input
            name="email"
            placeholder="* Email"
            // icon="email"
            extraClass="input"
          />
          <PhoneInput
            placeholder="Mobile phone"
            value={personalPhone}
            onChange={setPersonalPhone}
          />
        </Row>
        <Row>
          <Input
            name="password"
            type="password"
            placeholder="* Password"
            icon="lock"
            extraClass="input"
          />
          <Input
            name="password_confirmation"
            type="password"
            placeholder="* Confirm Password"
            icon="lock"
            extraClass="input"
          />
        </Row>

        <Row>
          <p>Select your account type:</p>

          <CustomRadio
            name="role"
            backgroundColor="#ffffff"
            onChange={handleRadioChange}
            options={[
              {
                label: "I need to Rent Space",
                value: "CLIENT",
                icon: <Icomoon iconName="membership" />,
              },
              {
                label: "I'm a Space Manager",
                value: "COWORKING",
                icon: <Icomoon iconName="map" />,
              },
            ]}
          />
        </Row>

        <Subtitle>
          You have selected{" "}
          <strong>
            {role === "CLIENT"
              ? "Coworker & Company Account"
              : "Coworking & Space Management Account"}
          </strong>{" "}
          {role === "CLIENT"
            ? "with this account you will be able to search and rent virtual office plans, meeting room, open desk and private offices. If you have a membership with a coworking that uses our system, you will be able to manage it throught us as well."
            : "With this account you will be able to manage your locations, services, agenda, leads, clients, mailboxes, contracts, invoices and much more. If you are willing to let us sell your services you will be receiving deals and opportunities to grow faster"}
        </Subtitle>

        <Row>
          <Checkbox name="accepted" value="remember">
            <CheckboxLabel>
              I accept the Workeaser <a>Terms and Conditions</a>
            </CheckboxLabel>
          </Checkbox>
          <Button
            text="Criar Conta"
            type="submit"
            loading={isLoading}
            extraClass={isLoading ? "loading" : ""}
          />
        </Row>
      </Form>

      <div className="customLink__container">
        <CustomLink>
          <Icomoon iconName="star" />
          <p>
            Already a customer?{" "}
            <a onClick={() => router.push("/login")}>Login here</a>
          </p>
        </CustomLink>
      </div>

      <Footer>
        <p>© 2021 Workweaser. All Rights Reserved.</p>
      </Footer>
    </Container>
  );
};

CreateAccount.authRoles = ["UNAUTH"];
export default CreateAccount;
