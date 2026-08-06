import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Calendar } from "@components/Form/Calendar";
import { ServiceCheckbox } from "@components/Form/ServiceCheckbox";
import { TimeRangePicker } from "@components/Form/TimeRangePicker";
import { InputComponent } from "@components/FormElements/Input";
import { AuthContext } from "@contexts/AuthContext";
import { api } from "@services/api";
import { Row } from "@styles/reusable";
import { FormHandles, SubmitHandler } from "@unform/core";
import { toLocalIsoDate, toLocalIsotime } from "@utils/helpers";
import React, { useContext, useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { Service } from "types/infos";
import * as Yup from "yup";
import { Form } from "./styles";

interface FormData {
  hourRange: string[];
  dayPicker: Date;
  services: { id: number }[];
}
interface BookTourModalProps {
  resource: {
    locationId: number;
    name: string;
  };
  services: Service[];
  isOpen: boolean;
  onRequestClose: () => void;
}
export const BookTourModal: React.FC<BookTourModalProps> = ({
  resource,
  services,
  isOpen,
  onRequestClose,
}) => {
  const { user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        hourRange: Yup.array().min(2).required(),
        services: Yup.array()
          .of(
            Yup.object().shape({
              id: Yup.number().nullable(),
            })
          )
          .test("services-test", "Select at least one service.", (answers) => {
            if (!answers.some((answer) => answer.id)) {
              toast.error("Select at least one service.");
            }
            return answers.some((answer) => answer.id);
          }),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const day = data.dayPicker.toDateString();

      const { locationId } = resource;

      const body = {
        location_id: locationId,
        services: data.services.filter((service) => service.id),
        date_start: `${toLocalIsoDate(
          new Date(`${day} ${data.hourRange[0]}`)
        )} ${toLocalIsotime(new Date(`${day} ${data.hourRange[0]}`))}`,
        date_end: `${toLocalIsoDate(
          new Date(`${day} ${data.hourRange[1]}`)
        )} ${toLocalIsotime(new Date(`${day} ${data.hourRange[1]}`))}`,
      };

      await api.post("/client/spaces/tours", body);
      toast.success("Request sent.");
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

  const userName = user ? `${user.first_name} ${user.last_name}` : "";

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

        <Form ref={formRef} onSubmit={handleSubmit}>
          <Row gap={15} align="start">
            <section>
              <InputComponent value={userName} readOnly />
              <InputComponent value={user?.email ?? ""} readOnly />
              <InputComponent value={user?.personal_phone ?? ""} readOnly />
              <InputComponent value={resource.name} readOnly />

              <Row justify="space-between">
                <p>Services of Interest:</p>

                <Row gap={6}>
                  {services?.map((service, index) => (
                    <ServiceCheckbox
                      key={service.id}
                      name={`services[${index}].id`}
                      value={service.id}
                      label={service.abbr}
                      tooltip={service.name}
                    />
                  ))}
                </Row>
              </Row>
            </section>

            <section>
              <Calendar name="dayPicker" />

              <Row justify="space-between">
                <p>Hour Range:</p>
                <TimeRangePicker name="hourRange" />
              </Row>
            </section>
          </Row>

          <footer>
            <Button
              type="submit"
              text="REQUEST TOUR"
              loading={isLoading}
              className={isLoading ? "loading" : ""}
            />
          </footer>
        </Form>
      </div>
    </Modal>
  );
};
