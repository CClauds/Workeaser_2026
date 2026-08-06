import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Calendar } from "@components/Form/Calendar";
import { Select } from "@components/Form/Select";
import { InputComponent } from "@components/FormElements/Input";
import { AuthContext } from "@contexts/AuthContext";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { toLocalIsoDate } from "@utils/helpers";
import React, { useContext, useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Form, Grid } from "./styles";

interface FormData {
  date: Date;
  payment_method: string;
}

interface BookDaypassModalProps {
  resource: {
    locationId: number;
    id: number;
    name: string;
    type: string;
  };
  isOpen: boolean;
  onRequestClose: () => void;
}
export const BookDaypassModal: React.FC<BookDaypassModalProps> = ({
  resource,
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
        payment_method: Yup.string().required("Payment Method is required."),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const day = data.date.toDateString();

      const { locationId, id, type } = resource;

      const body = {
        location_id: locationId,
        date: toLocalIsoDate(new Date(day)),
        resource_id: id,
        space: type,
        payment_method: data.payment_method,
      };

      const response = await api.post("/client/daypass/request", body);

      toast.success("Request sent.");
      setIsLoading(false);
      onRequestClose();
      // if (data.payment_method === "CAPTURE") {
      //   router.push(`/finances/invoices/${response.data.result.invoice_id}`);
      // }
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
          <h1>Schedule a Day Pass:</h1>
        </header>

        <Form ref={formRef} onSubmit={handleSubmit}>
          <Grid>
            <section>
              <InputComponent value={userName} readOnly />
              <InputComponent value={user?.email ?? ""} readOnly />
              <InputComponent value={user?.personal_phone ?? ""} readOnly />
              <InputComponent value={resource.name} readOnly />
            </section>

            <section>
              <Calendar name="date" />
              <Select
                instanceId="payment_method"
                name="payment_method"
                placeholder="Select the Payment Method"
                isClearable={false}
                options={[
                  { value: "BENEFIT", label: "User Membership Benefit" },
                  { value: "CAPTURE", label: "Capture Payment" },
                  { value: "PAY_SPACE", label: "Pay at the Space" },
                ]}
              />
            </section>
          </Grid>

          <footer>
            <Button
              type="submit"
              text="REQUEST DAYPASS"
              loading={isLoading}
              extraClass={isLoading ? "loading" : ""}
            />
          </footer>
        </Form>
      </div>
    </Modal>
  );
};
