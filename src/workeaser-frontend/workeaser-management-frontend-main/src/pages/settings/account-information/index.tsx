import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { ThumbnailFileInput } from "@components/Form/ThumbnailFileInput";
import { Icomoon } from "@components/Icomoon";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { AuthContext } from "@contexts/AuthContext";
import { api } from "@services/api";
import { uploadImage } from "@services/api/fileUpload";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import { mutate } from "swr";
import { Photo } from "types/cowork";
import { UserCoworkFormData } from "types/user";
import * as Yup from "yup";
import styles from "../styles.module.scss";

const AccountInformation = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

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
        cowork: {
          ...user.coworkUser,
          name: user.coworkUser.coworkAccount.name ?? "",
          email: user.coworkUser.coworkAccount.email ?? "",
          phone: user.coworkUser.coworkAccount.phone ?? "",
          photo_id: user.coworkUser.coworkAccount.photo ?? null,
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

  const handleSubmit: SubmitHandler<UserCoworkFormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      let schema = Yup.object();
      if (data.cowork.name.length === 0) {
        schema = schema.shape({
          first_name: Yup.string().min(2).required(),
          middle_name: Yup.string().min(1).required(),
          last_name: Yup.string().min(2).required(),
          email: Yup.string().min(2).required(),
          personal_phone: Yup.string().min(14).required(),
        });
      } else {
        schema = schema.shape({
          first_name: Yup.string().min(2).required(),
          middle_name: Yup.string().min(1).required(),
          last_name: Yup.string().min(2).required(),
          email: Yup.string().min(2).required(),
          personal_phone: Yup.string().min(14).required(),
          cowork: Yup.object().shape({
            name: Yup.string().min(3).required("Company name is required"),
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
      if (data.cowork.photo_id)
        companyPhoto = await uploadImage(data.cowork.photo_id);

      const body = {
        ...data,
        photo_id: personalPhoto ? personalPhoto.id : data.photo_id,
        cowork: {
          ...data.cowork,
          photo_id: companyPhoto ? companyPhoto.id : data.cowork.photo_id,
        },
      };

      await api.put("/me", body);
      mutate("/me");
      toast.success("Account Information Updated");
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
    toast.success("A recovery email was sent to you.");
  };

  return (
    <>
      <Head>
        <title>Account Information | Workeaser</title>
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
                  disabled={!isEditMode}
                />
              </div>

              <div className={styles.inputFieldsRow}>
                <Input
                  name="middle_name"
                  placeholder="* Middle Name"
                  disabled={!isEditMode}
                />
                <Input
                  name="last_name"
                  placeholder="* Last Name"
                  disabled={!isEditMode}
                />
              </div>

              <Input
                name="personal_address.fulltext"
                placeholder="* Personal Address"
                disabled={!isEditMode}
              />
              <div className={styles.inputFieldsRow}>
                <Input
                  name="personal_phone"
                  type="tel"
                  placeholder="* Phone"
                  disabled={!isEditMode}
                />
                <div className={styles.inputContainer}>
                  <Icomoon
                    iconName="lock"
                    fontSize={18}
                    color={theme.colors.blue800}
                  />
                  <Input name="email" placeholder="* Email" disabled />
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
              name="cowork.photo_id"
              disabled={!isEditMode || user.coworkUser.role !== "MANAGER"}
            />

            <div className={styles.inputFieldsContainer}>
              <Input
                name="cowork.name"
                placeholder="Company Name"
                disabled={!isEditMode || user.coworkUser.role !== "MANAGER"}
              />
              <div className={styles.inputFieldsRow}>
                <Input
                  name="cowork.phone"
                  placeholder="Phone"
                  type="tel"
                  disabled={!isEditMode || user.coworkUser.role !== "MANAGER"}
                />
                <Input
                  name="cowork.email"
                  placeholder="Email"
                  disabled={!isEditMode || user.coworkUser.role !== "MANAGER"}
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

AccountInformation.authRoles = ["COWORKING"];
AccountInformation.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout title="Account Settings">{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default AccountInformation;
