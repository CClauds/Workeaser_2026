import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { CustomCheckbox } from "@components/Form/CustomCheckbox";
import { CustomRadio } from "@components/Form/CustomRadio";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { Textarea } from "@components/Form/Textarea";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import React, { useContext, useRef } from "react";
import { ThemeContext } from "styled-components";
import styles from "./styles.module.scss";
import Modal from "react-modal";

interface FormData {
  location: string;
  tutle: string;
  priotity: "low" | "normal" | "high" | "critical";
  description: string;
}

interface SupportTicketProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export const SupportTicket: React.FC<SupportTicketProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const themeContext = useContext(ThemeContext);

  const formRef = useRef<FormHandles>(null);

  const handleSubmit: SubmitHandler<FormData> = (data) => {
    console.log("data", data);
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
          <h1>Create a New Support Ticket</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.formContainer}
        >
          <div className={styles.formContent}>
            <section>
              <Select
                name="client"
                placeholder="Pull Client Information with the ID or Email"
              />
              <Select name="location" placeholder="Select the Location" />
              <Input name="title" placeholder="Ticket Title" />

              <div className={styles.sectionRow}>
                <p>Support Priority:</p>

                <div className={styles.row__checkbox}>
                  <CustomRadio
                    name="priority"
                    options={[
                      {
                        label: "Low",
                        value: "low",
                        labelBgColor: themeContext.colors.tableBackgroundGray,
                      },
                      {
                        label: "Normal",
                        value: "normal",
                        labelBgColor: themeContext.colors.tableBackgroundGreen,
                      },
                      {
                        label: "High",
                        value: "high",
                        labelBgColor: themeContext.colors.tableBackgroundYellow,
                      },
                      {
                        label: "Critical",
                        value: "critical",
                        labelBgColor: themeContext.colors.tableBackgroundRed,
                      },
                    ]}
                  />
                </div>
              </div>
            </section>

            <section>
              <Textarea
                name="description"
                placeholder="Ticket Description"
                extraClass={styles.textarea}
              />
            </section>
          </div>

          <div className={styles.buttonContainer}>
            <Button text="CREATE TICKET" type="submit" />
          </div>
        </Form>
      </>
    </Modal>
  );
};
