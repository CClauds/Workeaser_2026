import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Calendar } from "@components/Form/Calendar";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { toLocalIsoDate } from "@utils/helpers";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { AddDaypassResponse } from "types";
import { ClientsResponse } from "types/cowork/clients";
import { DesksResponse } from "types/cowork/locations/desks";
import { RoomsResponse } from "types/cowork/locations/rooms";
import { PersonasResponse } from "types/cowork/relationship";
import { OptionType } from "types/form";
import { LocationData } from "types/locations";
import * as Yup from "yup";
import { Collapse } from "./styles";
import styles from "./styles.module.scss";

interface FormData {
  visitors_id: string;
  visitorsName: string;
  email: string;
  phone: string;
  space: string;
  location_id: number;
  date: Date;
  payment_method: string;
  user_type: string;
  resource_id: string;
}

interface DayPassProps {
  isOpen: boolean;
  onRequestClose: () => void;
}
export const DayPass: React.FC<DayPassProps> = ({ isOpen, onRequestClose }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [locationId, setLocationId] = useState<number>();
  const [userType, setUserType] = useState("CLIENT");
  const [spaceSelected, setSpaceSelected] = useState("OPEN_DESK");
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  const formRef = useRef<FormHandles>(null);

  const { data: { result: clients } = {} } =
    useFetch<ClientsResponse>("/cowork/clients");
  const { data: { result: leads } = {} } = useFetch<PersonasResponse>(
    userType === "LEAD" ? "/cowork/relationship/personasmanagement" : null
  );

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl);

  const { data: { result: desks } = {} } = useFetch<DesksResponse>(
    locationId && spaceSelected === "OPEN_DESK"
      ? `/cowork/desks?location=${locationId}`
      : null
  );
  const { data: { result: rooms } = {} } = useFetch<RoomsResponse>(
    locationId && spaceSelected === "PRIVATE_ROOM"
      ? `/cowork/rooms?location=${locationId}`
      : null
  );

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
        visitors_id: Yup.string().required(),
        location_id: Yup.string().required(),
        resource_id: Yup.string().required(),
        payment_method: userType === "CLIENT" ? Yup.string().required() : null,
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const day = data.date.toDateString();

      const body = {
        user_type: data.user_type,
        [data.user_type === "CLIENT" ? "client_uuid" : "lead_id"]:
          data.visitors_id,
        location_id: data.location_id,
        date: toLocalIsoDate(new Date(day)),
        space: data.space,
        resource_id: data.resource_id,
        payment_method: data.payment_method,
      };

      // console.log({ body });

      const response = await api.post<AddDaypassResponse>(
        "/cowork/relationship/daypass",
        body
      );
      mutate("/cowork/relationship/bookings/unapproved");
      mutate("/cowork/relationship/bookings/scheduled");
      toast.success("Event added");
      setIsLoading(false);
      onRequestClose();
      if (data.payment_method === "CAPTURE") {
        router.push(`/finances/invoices/${response.data.result.invoice_id}`);
      }
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
          });
          formRef.current.setErrors(validationErrors);
        }
      } else {
        console.log("ERR0R", err.response.data);
        if (!Array.isArray(err?.response?.data.error.message)) {
          toast.error(err?.response?.data.error.message);
        } else {
          err?.response?.data.error.message.forEach((message) => {
            toast.error(message.message);
          });
        }
      }
    }
  };

  const handleClientChange = (option: OptionType) => {
    if (option) {
      if (userType === "CLIENT") {
        const client = clients.find((client) => client.uuid === option.value);
        formRef.current.setFieldValue(
          "visitorsName",
          `${client.first_name} ${client.last_name}`
        );
        formRef.current.setFieldValue("email", client.email);
        formRef.current.setFieldValue(
          "phone",
          client.personal_phone ?? "Not informed"
        );
        // formRef.current.setFieldValue(
        //   "companyName",
        //   client?.clientAccount?.company_name
        // );
      } else {
        const lead = leads.find((lead) => lead.id === option.value);
        formRef.current.setFieldValue(
          "visitorsName",
          `${lead.clientAccount.user.first_name} ${lead.clientAccount.user.last_name}`
        );
        formRef.current.setFieldValue("email", lead.clientAccount.user.email);
        formRef.current.setFieldValue(
          "phone",
          lead.clientAccount.user.personal_phone
        );
      }
    } else {
      formRef.current.clearField("visitorsName");
      formRef.current.clearField("email");
      formRef.current.clearField("phone");
      // formRef.current.clearField("companyName");
    }
  };

  const handleUserTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value);
    formRef.current.clearField("visitors_id");
    formRef.current.clearField("visitorsName");
    formRef.current.clearField("email");
    formRef.current.clearField("phone");
  };

  const handleSpaceChange = (option: OptionType) => {
    if (option) setLocationId(option.value as number);
  };

  const handleSpaceTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSpaceSelected(e.target.value);
    formRef.current.clearField("resource_id");
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
      <div>
        <header>
          <h1>Schedule a Day Pass:</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          initialData={{ space: "OPEN_DESK", user_type: "CLIENT" }}
        >
          <div className={styles.formContent}>
            <section>
              <div className={styles.row}>
                <p>User Selector:</p>
                <Radio
                  name="user_type"
                  onChange={handleUserTypeChange}
                  options={[
                    {
                      value: "CLIENT",
                      label: "Client",
                    },
                    { value: "LEAD", label: "Lead" },
                  ]}
                />
              </div>
              <Select
                instanceId="visitors_id"
                name="visitors_id"
                placeholder={`Pull ${
                  userType === "CLIENT" ? "Client" : "Lead"
                } Information`}
                onChange={handleClientChange}
                isLoading={userType === "CLIENT" ? !clients : !leads}
                options={
                  userType === "CLIENT"
                    ? clients?.map((client) => ({
                        value: client.uuid,
                        label: client.first_name,
                        photo: client.photo?.file,
                        first_name: client.first_name,
                        last_name: client.last_name,
                        company_name: client?.clientAccount?.company_name,
                        email: client.email,
                        personal_phone: client.personal_phone,
                      }))
                    : leads?.map((lead) => ({
                        value: lead.id,
                        label: lead.clientAccount.user.first_name,
                        photo: null,
                        first_name: lead.clientAccount.user.first_name,
                        last_name: lead.clientAccount.user.last_name,
                        company_name: lead?.clientAccount?.company_name,
                        email: lead.clientAccount.user.email,
                        personal_phone: lead.clientAccount.user.personal_phone,
                      }))
                }
                formatType="user"
              />

              <Input
                name="visitorsName"
                type="text"
                placeholder="Visitor's Name"
                readOnly
              />

              <Input name="email" type="email" placeholder="Email" readOnly />
              <Input
                name="phone"
                type="tel"
                placeholder="Phone"
                mask="phone"
                readOnly
              />

              <Select
                instanceId="location_id"
                name="location_id"
                placeholder="Units Selector:"
                onChange={handleSpaceChange}
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

              <div className={styles.row}>
                <p>Space Selector:</p>

                <Radio
                  name="space"
                  onChange={handleSpaceTypeChange}
                  options={[
                    { value: "OPEN_DESK", label: "Desk" },
                    {
                      value: "PRIVATE_ROOM",
                      label: "Private Office",
                    },
                  ]}
                />
              </div>
              <Select
                instanceId="resource_id"
                name="resource_id"
                placeholder={`Select the ${
                  spaceSelected === "OPEN_DESK" ? "Desk" : "Room"
                }`}
                isClearable={false}
                isDisabled={spaceSelected === "OPEN_DESK" ? !desks : !rooms}
                options={
                  spaceSelected === "OPEN_DESK"
                    ? desks?.map((desk) => ({
                        value: desk.id,
                        label: desk.name,
                        photo: desk.photos[0],
                        name: desk.name,
                        location: desk.location,
                      }))
                    : rooms?.map((room) => ({
                        value: room.id,
                        label: room.name,
                        photo: room.photo[0],
                        name: room.name,
                        location: room.location,
                      }))
                }
                formatType="services"
              />
            </section>

            <section>
              <Calendar name="date" />
              <Collapse collapse={userType === "LEAD"}>
                <Select
                  instanceId="payment_method"
                  name="payment_method"
                  placeholder="Select the Payment Method"
                  isClearable={false}
                  options={[
                    { value: "CAPTURE", label: "Capture Payment" },
                    { value: "BENEFIT", label: "User Membership Benefit" },
                    { value: "COURTESY", label: "Courtesy" },
                  ]}
                />
              </Collapse>
            </section>
          </div>

          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              text="ADD TO THE CALENDAR"
              loading={isLoading}
              extraClass={isLoading ? styles.loading : ""}
            />
          </div>
        </Form>
      </div>
    </Modal>
  );
};
