import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { DatePickerAntd } from "@components/Form/DatePickerAntd";
import { Dropzone } from "@components/Form/Dropzone";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { Textarea } from "@components/Form/Textarea";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { uploadImage } from "@services/api/fileUpload";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { ClientsResponse } from "types/cowork/clients";
import { OptionType } from "types/form";
import { LocationData } from "types/locations";
import * as Yup from "yup";
import styles from "./styles.module.scss";

interface FormData {
  delivery_date: string;
  client_account_id: number;
  companyName: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  location_id: number;
  additional_information: string;
  photos: File[];
}

interface MailboxReceiptProps {
  isOpen: boolean;
  onRequestClose: () => void;
}
export const MailboxReceipt: React.FC<MailboxReceiptProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  const { data: { result: clients } = {} } =
    useFetch<ClientsResponse>("/cowork/clients");

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl);

  useEffect(() => {
    if (locations) {
      const newLocations = [...allLocations.data, ...locations];
      setAllLocations((state) => ({ ...state, data: newLocations }));
    }
  }, [locations]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        delivery_date: Yup.string().required(),
        client_uuid: Yup.string().required(),
        location_id: Yup.string().required(),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const imagesPromises = data.photos.map((image) => uploadImage(image));
      const imagesResponse = await Promise.all(imagesPromises);

      const { companyName, phone, email, firstName, lastName, ...bodyData } =
        data;

      const body = {
        ...bodyData,
        photos: imagesResponse.map((item) => ({ id: item.id })),
      };

      await api.post("/cowork/relationship/mailbox", body);
      mutate("/cowork/relationship/mailbox");
      toast.success("Mailbox receit added.");
      setIsLoading(false);
      onRequestClose();
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            console.log(error.message);
            validationErrors[error.path] = error.message;
          });
          formRef.current.setErrors(validationErrors);
        }
      } else {
        console.log("ERR0R", err?.response?.data);
        if (
          err?.response?.data?.error?.message &&
          !Array.isArray(err?.response?.data?.error?.message)
        ) {
          toast.error(err?.response?.data?.error?.message);
        } else {
          err?.response?.data.error.message.forEach((message) => {
            console.log("message", message.message);
            toast.error(message.message);
          });
        }
      }
    }
  };

  const handleClientChange = (option: OptionType) => {
    if (option) {
      const client = clients.find((client) => client.uuid === option.value);
      formRef.current.setFieldValue("firstName", client.first_name);
      formRef.current.setFieldValue("lastName", client.last_name);
      formRef.current.setFieldValue("email", client.email);
      formRef.current.setFieldValue(
        "phone",
        client.personal_phone ?? "Not informed"
      );
      formRef.current.setFieldValue(
        "companyName",
        client.clientAccount?.company_name ?? ""
      );
    } else {
      formRef.current.clearField("firstName");
      formRef.current.clearField("lastName");
      formRef.current.clearField("email");
      formRef.current.clearField("phone");
      formRef.current.clearField("companyName");
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
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Mailbox Receipt</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          initialData={{ delivery_date: dayjs() }}
          className={styles.formContainer}
        >
          <div className={styles.formContent}>
            <section>
              <div className={styles.row}>
                <p>Delivery Date:</p>

                <DatePickerAntd name="delivery_date" />
              </div>
              <Select
                instanceId="client_uuid"
                name="client_uuid"
                placeholder="Pull Client Information with the ID or Email"
                onChange={handleClientChange}
                isLoading={!clients}
                options={clients?.map((client) => ({
                  value: client.uuid,
                  label: client.first_name,
                  photo: client.photo?.file,
                  first_name: client.first_name,
                  last_name: client.last_name,
                  company_name: client?.clientAccount?.company_name,
                  email: client.email,
                  personal_phone: client.personal_phone,
                }))}
                formatType="user"
              />
              <div className={styles.row}>
                <Input name="firstName" placeholder="First Name" readOnly />
                <Input name="lastName" placeholder="Last Name" readOnly />
              </div>
              <div className={styles.row}>
                <Input name="email" placeholder="Email" readOnly />
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  mask="phone"
                  readOnly
                />
              </div>

              <Input name="companyName" placeholder="Company Name" readOnly />
              <Select
                instanceId="location_id"
                name="location_id"
                placeholder="Select the Location"
                isClearable={false}
                formatType="locations"
                options={allLocations?.data.map((location) => ({
                  value: location.id,
                  label: location.name,
                  name: location.name,
                  photo: location.photos[0],
                  address: location.address,
                }))}
                isLoading={locationsLoadiong}
                onMenuScrollToBottom={handleLocationSelectSrollsToBottom}
              />
            </section>

            <section>
              <Dropzone name="photos" label="Drop the Delivery Photos" />

              <Textarea
                name="additional_information"
                placeholder="Addtional Information"
                extraClass={styles.textarea}
              />
            </section>
          </div>

          <div className={styles.buttonContainer}>
            <Button
              text="RECEIVE MAIL"
              type="submit"
              loading={isLoading}
              extraClass={isLoading ? styles.loading : ""}
            />
          </div>
        </Form>
      </>
    </Modal>
  );
};
