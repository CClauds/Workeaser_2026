import { Button } from "@components/Button";
import { CustomSelect } from "@components/Form/CustomSelect";
import { Loader } from "@components/Loader";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import { ButtonContainer, Form, LoaderContainer, RuleCard } from "./styles";

interface GlobalSettingsData {
  result: {
    recurring_invoice_creation: number;
    recurring_invoice_due_date: number;
  };
}

export const Invoicing: React.FC = () => {
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);

  const { data: { result: invoicingData } = {} } = useFetch<GlobalSettingsData>(
    "/cowork/settings/global"
  );

  const formRef = useRef<FormHandles>(null);

  useEffect(() => {
    if (invoicingData) {
      formRef.current?.setData(invoicingData);
    }
  }, [invoicingData]);

  const handleSubmit: SubmitHandler = async (data) => {
    try {
      setIsLoading(true);
      await api.put("/cowork/settings/global", data);
      toast.success("Rules updated.");
    } catch (error) {
      console.log(error.response);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSelectChange = (select: string) => (e: OptionType) => {
  //   setSelectValues({ ...selectValues, [select]: e.value });
  // };

  return (
    <Form ref={formRef} onSubmit={handleSubmit}>
      <RuleCard>
        <section>
          <p>
            <strong>Recurring Invoice Creation:</strong>
          </p>
          <p>When your recurring invoices will be created?</p>
        </section>

        {invoicingData ? (
          <CustomSelect
            name="recurring_invoice_creation"
            width={200}
            bgColor="#ffffff"
            // value={selectValues.creation}
            // onChange={handleSelectChange("creation")}
            options={[...Array(30)].map((_, index) => ({
              value: index + 1,
              label: `${index + 1}° Day of the Month`,
            }))}
          />
        ) : (
          <LoaderContainer>
            <Loader color={theme.colors.blue200} />
          </LoaderContainer>
        )}
      </RuleCard>
      <RuleCard>
        <section>
          <p>
            <strong>Recurring Invoice Due Date:</strong>
          </p>
          <p>When your recurring invoices will be overdue?</p>
        </section>

        {invoicingData ? (
          <CustomSelect
            name="recurring_invoice_due_date"
            width={200}
            bgColor="#ffffff"
            // value={selectValues.duedate}
            // onChange={handleSelectChange("duedate")}
            options={[...Array(30)].map((_, index) => ({
              value: index + 1,
              label: `${index + 1}° Day of the Month`,
            }))}
          />
        ) : (
          <LoaderContainer>
            <Loader color={theme.colors.blue200} />
          </LoaderContainer>
        )}
      </RuleCard>

      <ButtonContainer>
        <Button type="submit" text="SAVE" loading={isLoading} />
      </ButtonContainer>
    </Form>
  );
};
