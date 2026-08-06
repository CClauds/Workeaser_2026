import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { ThumbnailFileInput } from "@components/Form/ThumbnailFileInput";
import { Icomoon } from "@components/Icomoon";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { AuthContext } from "@contexts/AuthContext";
import { api } from "@services/api";
import { uploadImage } from "@services/api/fileUpload";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import { mutate } from "swr";
import { Photo } from "types/cowork";
import { UserClient } from "types/user";
import * as Yup from "yup";
import styles from "../styles.module.scss";

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  photo_id: File;
  personal_phone: string;

  personal_address: {
    fulltext: string;
  };
  client: {
    company_name: string;
    company_email: string;
    company_phone: string;
    company_photo_id: File;
  };
}

const AccountInformation = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext) as { user: UserClient };

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  useEffect(() => {
    if (user) {
      formRef.current?.setData({
        ...user,
        personal_address: { fulltext: user.personalAddress?.fulltext ?? "" },
        personal_phone: user.personal_phone ?? "",
        photo_id: user.photo ?? null,
        client: {
          ...user.clientAccount,
          name: user.clientAccount.company_name ?? "",
          email: user.clientAccount.company_email ?? "",
          phone: user.clientAccount.company_phone ?? "",
          company_photo_id: user.clientAccount.companyPhoto ?? null,
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (isEditMode) {
      const nameInput = formRef.current?.getFieldRef("first_name");
      nameInput.current?.focus();
    }
  }, [isEditMode]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      let schema = Yup.object();
      if (data.client.company_name.length === 0) {
        schema = schema.shape({
          first_name: Yup.string().min(2).required(),
          middle_name: Yup.string().min(1).required(),
          last_name: Yup.string().min(2).required(),
          email: Yup.string().email().required(),
          personal_phone: Yup.string().min(14).required(),
        });
      } else {
        schema = schema.shape({
          first_name: Yup.string().min(2).required(),
          middle_name: Yup.string().min(1).required(),
          last_name: Yup.string().min(2).required(),
          email: Yup.string().email().required(),
          personal_phone: Yup.string().min(14).required(),
          client: Yup.object().shape({
            company_name: Yup.string()
              .min(3)
              .required("Company name is required"),
            company_email: Yup.string().email().required(),
            company_phone: Yup.string().min(14).required(),
          }),
        });
      }

      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      setIsEditMode(false);

      let personalPhoto: Photo;
      let companyPhoto: Photo;
      if (data.photo_id) personalPhoto = await uploadImage(data.photo_id);
      if (data.client.company_photo_id) {
        companyPhoto = await uploadImage(data.client.company_photo_id);
      }

      const body = {
        ...data,
        photo_id: personalPhoto ? personalPhoto.id : data.photo_id,
        client: {
          ...data.client,
          company_photo_id: companyPhoto
            ? companyPhoto.id
            : data.client.company_photo_id,
        },
      };

      await api.put("/me", body);
      mutate("/me");
      toast.success("Informações da conta atualizadas");
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
      } else {
        console.log("ERR0R", err.response.data);
        err?.response?.data.error.message?.forEach((message) => {
          console.log("message", message.message);
          toast.error(message.message);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    if (isEditMode) {
      formRef.current.submitForm();
    } else {
      setIsEditMode(true);
    }
  };

  const handleResetPassword = async () => {
    await api.post("/auth/lost-password", { email: user.email });
    toast.success("Email de recuperação enviado");
  };

  return (
    <>
      <Head>
        <title>Informações da Conta | Workeaser</title>
      </Head>

      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.informationContainer}
      >
        <section>
          <header>
            <h2>Personal Information:</h2>
            <span className={styles.line}></span>
          </header>

          <div className={styles.content}>
            <ThumbnailFileInput name="photo_id" disabled={!isEditMode} />

            <div className={styles.inputFieldsContainer}>
              <div className={styles.inputFieldsRow}>
                <Input
                  name="first_name"
                  placeholder="* First Name"
                  readOnly={!isEditMode}
                />
              </div>
              <div className={styles.inputFieldsRow}>
                <Input
                  name="middle_name"
                  placeholder="* Middle Name"
                  readOnly={!isEditMode}
                />
                <Input
                  name="last_name"
                  placeholder="* Last Name"
                  readOnly={!isEditMode}
                />
              </div>
              <Input
                name="personal_address.fulltext"
                placeholder="* Personal Address"
                readOnly={!isEditMode}
              />
              <div className={styles.inputFieldsRow}>
                <Input
                  name="personal_phone"
                  type="tel"
                  placeholder="* Phone"
                  readOnly={!isEditMode}
                />
                <div className={styles.inputContainer}>
                  <Icomoon
                    iconName="lock"
                    fontSize={18}
                    color={theme.colors.blue800}
                  />
                  <Input name="email" placeholder="* Email" readOnly />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <header>
            <h2>Company Information:</h2>
            <span className={styles.line}></span>
          </header>

          <div className={styles.content}>
            <ThumbnailFileInput
              name="client.company_photo_id"
              disabled={!isEditMode}
            />

            <div className={styles.inputFieldsContainer}>
              <Input
                name="client.company_name"
                placeholder="Company Name"
                readOnly={!isEditMode}
              />
              <div className={styles.inputFieldsRow}>
                <Input
                  name="client.company_phone"
                  placeholder="Phone"
                  type="tel"
                  readOnly={!isEditMode}
                />
                <Input
                  name="client.company_email"
                  placeholder="Email"
                  readOnly={!isEditMode}
                />
              </div>
            </div>
          </div>
        </section>

        <div className={styles.buttonsContainer}>
          <Button
            type="button"
            color="secondary"
            text="RESET PASSWORD"
            onClick={handleResetPassword}
          />

          <Button
            type="button"
            text={isEditMode ? "SAVE INFORMATION" : "EDIT ACCOUNT"}
            onClick={handleEditClick}
            loading={isLoading}
            extraClass={isLoading ? styles.loading : ""}
          />
        </div>
      </Form>
    </>
  );
};

AccountInformation.authRoles = ["CLIENT"];
AccountInformation.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <ClientLayout componentProps={componentProps}>
      <SettingsLayout title="Account Settings" role="CLIENT">
        {page}
      </SettingsLayout>
    </ClientLayout>
  );
};
export default AccountInformation;
