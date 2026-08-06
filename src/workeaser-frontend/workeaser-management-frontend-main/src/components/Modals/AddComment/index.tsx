import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Textarea } from "@components/Form/Textarea";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import React, { useRef, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { KeyedMutator } from "swr";
import { TransactionResponse } from "types/cowork/financial";
import * as Yup from "yup";
import styles from "./styles.module.scss";

interface FormData {
  comment: string;
}

interface AddCommentModalProps {
  currnetBank: number;
  currentTransaction: number;
  currrentFilter: string;
  isOpen: boolean;
  mutate: KeyedMutator<TransactionResponse>;
  onRequestClose: () => void;
}

export const AddCommentModal: React.FC<AddCommentModalProps> = ({
  currnetBank,
  currentTransaction,
  currrentFilter,
  mutate,
  isOpen,
  onRequestClose,
}) => {
  const formRef = useRef<FormHandles>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        comment: Yup.string().required(),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      await api.put(
        `/cowork/finance/banking/${currnetBank}/${currentTransaction}/note`,
        { note: data.comment }
      );
      mutate();
      toast.success("Note added.");
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
        console.log("ERR0R", err);
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

  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Add Note</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.formContainer}
        >
          <Textarea name="comment" />

          <div className={styles.buttonContainer}>
            <Button
              text="ADD NOTE"
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
