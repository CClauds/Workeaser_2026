import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Calendar } from "@components/Form/Calendar";
import { DatePickerAntd } from "@components/Form/DatePickerAntd";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { ServiceCheckbox } from "@components/Form/ServiceCheckbox";
import { TimePicker } from "@components/Form/TimePicker";
import { TimeRangePicker } from "@components/Form/TimeRangePicker";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { toLocalIsoDate, toLocalIsotime } from "@utils/helpers";
import { useFetch } from "hooks/useFetch";
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { PersonasResponse } from "types/cowork/relationship";
import { OptionType } from "types/form";
import { ServiceResponse } from "types/infos";
import { ApiItem, LocationData } from "types/locations";
import * as Yup from "yup";
import styles from "./styles.module.scss";

interface FormData {
  lead_id: string;
  visitorsName: string;
  email: string;
  phone: string;
  units: string;
  services: ApiItem[];
  location_id: number;
  dayPicker: Date;
  hourRange: string[];
  // hourRange: {
  //   from: Date;
  //   to: Date;
  // };
}

interface NewTourProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export const NewTour: React.FC<NewTourProps> = ({ isOpen, onRequestClose }) => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  const { data: { result: leads } = {} } = useFetch<PersonasResponse>(
    "/cowork/relationship/personasmanagement"
  );
  const { data: { result: services } = {} } =
    useFetch<ServiceResponse>("/infos/services");

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
        lead_id: Yup.string().required(),
        location_id: Yup.string().required(),
        hourRange: Yup.array().min(2).required(),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const year = data.dayPicker.getFullYear();
      const month = data.dayPicker.getMonth() + 1;
      const day = data.dayPicker.toDateString();

      const body = {
        lead_id: data.lead_id,
        location_id: data.location_id,
        services: data.services.filter((service) => service.id),
        date_start: `${toLocalIsoDate(
          new Date(`${day} ${data.hourRange[0]}`)
        )} ${toLocalIsotime(new Date(`${day} ${data.hourRange[0]}`))}`,
        date_end: `${toLocalIsoDate(
          new Date(`${day} ${data.hourRange[1]}`)
        )} ${toLocalIsotime(new Date(`${day} ${data.hourRange[1]}`))}`,
      };

      await api.post("/cowork/relationship/tours", body);
      // mutate("/cowork/relationship/tours");
      mutate("/cowork/relationship/bookings/unapproved");
      mutate(
        `/cowork/relationship/bookings/scheduled?month=${month}&year=${year}`
      );
      toast.success("Event added");
      setIsLoading(false);
      onRequestClose();
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
        if (!Array.isArray(err?.response?.data.error.message)) {
          toast.error(err?.response?.data.error.message);
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
    } else {
      formRef.current.clearField("visitorsName");
      formRef.current.clearField("email");
      formRef.current.clearField("phone");
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
      <div>
        <header>
          <h1>Schedule a New Tour:</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.formContainer}
        >
          <div className={styles.formContent}>
            <section>
              <Select
                instanceId="lead_id"
                name="lead_id"
                placeholder="Pull Lead Information"
                onChange={handleClientChange}
                isLoading={!leads}
                options={leads?.map((lead) => ({
                  value: lead.id,
                  label: lead.clientAccount.user.first_name,
                }))}
              />

              <Input
                name="visitorsName"
                type="text"
                placeholder="Visitor's Name"
              />

              <Input name="email" type="email" placeholder="Email" />
              <Input name="phone" type="tel" placeholder="Phone" mask="phone" />

              <Select
                instanceId="location_id"
                name="location_id"
                placeholder="Units Selector:"
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
                <p>Services of Interest:</p>

                <div className={styles.subRowContainer}>
                  {services?.map((service, index) => (
                    <ServiceCheckbox
                      key={service.id}
                      name={`services[${index}].id`}
                      value={service.id}
                      label={service.abbr}
                      tooltip={service.name}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section>
              {/* <section className={styles.section__calendar}> */}
              <Calendar name="dayPicker" />
              {/* <DatePickerAntd
                name="day"
                open
                // placement="bottomLeft"
                presets={[]}
                showToday={false}
              /> */}

              <div className={styles.row}>
                <p>Hour Range:</p>
                <div className={styles.subRowContainer}>
                  <TimeRangePicker name="hourRange" minuteStep={10} />
                </div>
              </div>
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
