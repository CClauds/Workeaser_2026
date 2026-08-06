import { LoginLayout } from "@components/Layouts/LoginLayout";
import { FormHandles, SubmitHandler } from "@unform/core";
import React, { useRef, useState } from "react";
import { ReactElement } from "react";
import * as Yup from "yup";
import Image from "next/legacy/image";
import { LoginInput } from "@components/Form/LoginInput";
import { Button } from "@components/Button";
import { ButtonContainer, Form } from "@styles/pages/lost-password/styles";
import { api } from "@services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

interface FormData {
  password: string;
  password_confirmation: string;
}

const RecoverPassword = () => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState<boolean>();

  const router = useRouter();
  const { token } = router.query;

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        password: Yup.string().min(8).required("Password is required"),
        password_confirmation: Yup.string()
          .min(8)
          .oneOf([Yup.ref("password"), null], "Passwords must match"),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      const body = {
        ...data,
        token,
      };

      await api.post("/auth/lost-password-confirmation", body);
      toast.success("Senha redefinida com sucesso");
      router.push("/login");
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
        console.log(err.response);
        if (
          err.response.data.error.message === "E_ROW_NOT_FOUND: Row not found"
        ) {
          toast.error("Token inválido ou expirado");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <figure>
        <Image
          src="/images/workeaser-logo.png"
          alt="workeaser logo"
          width={200}
          height={57}
          objectFit="contain"
        />
      </figure>

      <Form ref={formRef} onSubmit={handleSubmit}>
        <LoginInput
          name="password"
          type="password"
          label="Nova Senha"
          icon="lock"
          placeholder="Digite sua nova senha"
        />
        <LoginInput
          name="password_confirmation"
          type="password"
          label="Confirmar Senha"
          icon="lock"
          placeholder="Repita sua nova senha"
        />

        <ButtonContainer>
          <Button
            type="submit"
            text="Salvar Senha"
            loading={isLoading}
            extraClass={isLoading ? "loading" : ""}
          />
        </ButtonContainer>
      </Form>
    </>
  );
};

RecoverPassword.getLayout = (page: ReactElement) => (
  <LoginLayout>{page}</LoginLayout>
);
export default RecoverPassword;
