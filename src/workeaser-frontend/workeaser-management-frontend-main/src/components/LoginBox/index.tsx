import { api } from "@services/api";
import { signInRequest } from "@services/api/auth";
import { SignInData } from "@services/api/auth/types";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "../Button";
import { Checkbox } from "../Form/Checkbox";
import { LoginInput } from "../Form/LoginInput";
import { CloseButton, InputWrapper } from "./styles";
import styles from "./styles.module.scss";

interface FormData {
  email: string;
  password: string;
  remember_me: boolean;
}

interface LoginBoxProps {}

export const LoginBox: React.FC<LoginBoxProps> = ({}) => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState<boolean>();
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: isOpen ? Yup.string().min(6).required() : null,
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      if (isOpen) {
        await signIn(data);
      } else {
        const { email } = data;
        await api.post("/auth/lost-password", { email });
        toast.success("A recovery email was sent to you.");
        setIsOpen(true);
      }
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
        if (err?.response?.data) {
          toast.error("Email not found.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async ({ email, password, remember_me }: SignInData) => {
    try {
      const { data } = await signInRequest({ email, password, remember_me });
      const {
        result: { token, user, expires_at },
      } = data;

      // 1B.2-httpOnly: la cookie la setea el backend con httpOnly=true (Set-Cookie).
      // El navegador la almacena y la envía automáticamente en requests subsecuentes.
      // CookieAuth middleware en backend lee la cookie → Bearer header.
      // Aquí solo seteamos el header para la sesión en memoria (inmediata post-login).
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      // const { returnTo } = router.query;

      if (user.role === "COWORKING" || user.role === "ADMIN") {
        // B3: redirect to new operator panel
        router.push("/operator/dashboard");
      } else if (user.role === "CLIENT") {
        router.push("/spaces");
      }
    } catch (error) {
      const apiError = error?.response?.data?.error;

      if (!apiError) {
        toast.error("Network error. Please check your connection and try again.");
        return;
      }

      const message: string = apiError.message || apiError.code || "Login failed";
      const normalized = typeof message === "string" ? message.toLowerCase() : "";
      const needsEmailConfirmation =
        normalized.includes("email") &&
        (normalized.includes("not been confirmed") ||
          normalized.includes("not confirmed") ||
          normalized.includes("unverified"));

      toast.error(message);

      if (needsEmailConfirmation) {
        try {
          const { data: response } = await api.post(
            "/auth/resend-email-confirmation",
            { email }
          );
          if (response?.result?.message) {
            toast.success(response.result.message);
          } else {
            toast.success(
              "A new confirmation email has been sent. Please check your inbox."
            );
          }
        } catch (resendErr) {
          toast.warn(
            "We couldn't resend the confirmation email automatically. Please try again later."
          );
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <figure>
        <Image
          src="/images/workeaser-logo.png"
          alt="workeaser logo"
          width={200}
          height={57}
        />
      </figure>

      <Form ref={formRef} onSubmit={handleSubmit}>
        <LoginInput
          name="email"
          type="text"
          label={isOpen ? "Login" : "Email"}
          icon="user"
          placeholder="Enter your Email or User ID"
        />

        <InputWrapper isOpen={isOpen}>
          <LoginInput
            name="password"
            type="password"
            label="Password"
            icon="lock"
            placeholder="Enter your Password"
          />
        </InputWrapper>

        <div className={styles.doubleCol}>
          {isOpen ? (
            <Checkbox name="remember_me" value="remember_me">
              Remember Me
            </Checkbox>
          ) : (
            <CloseButton
              onClick={() => setIsOpen(true)}
              width="15.556"
              height="15.556"
              viewBox="0 0 15.556 15.556"
            >
              <rect
                width="20"
                height="2"
                rx="1"
                transform="translate(1.414) rotate(45)"
                fill="#2b3450"
              />
              <rect
                width="20"
                height="2"
                rx="1"
                transform="translate(15.556 1.414) rotate(135)"
                fill="#2b3450"
              />
            </CloseButton>
          )}

          <Button
            type="submit"
            text={isOpen ? "Log in" : "Send"}
            extraClass={
              isLoading === undefined
                ? ""
                : isLoading
                ? styles.shrink
                : styles.expand
            }
            loading={isLoading}
          />
        </div>
      </Form>

      <div className={styles.lostPassContainer}>
        <a onClick={() => setIsOpen(false)}>Lost Password?</a>
      </div>
    </div>
  );
};
