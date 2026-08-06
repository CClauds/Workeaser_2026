import { useField } from "@unform/core";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useRef } from "react";
import { Container } from "./styles";

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  name: string;
}

export const DateRangePickerImpl: React.FC<DateRangePickerProps> = ({ name }) => {
  const datepickerRef = useRef(null);

  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: datepickerRef,
      getValue: (ref) => {
        const dateFrom = ref?.current.children[0].children[0].children[0].value;
        if (!dateFrom) {
          return null;
        }
        const resdateFrom = dayjs(dateFrom).format("YYYY-MM-DD");
        return [resdateFrom];
      },
      clearValue: () => {
        // no-op
      },
      setValue: () => {
        // no-op
      },
    });
  }, [fieldName, registerField]);

  return (
    <Container ref={datepickerRef} className={error ? "error" : ""}>
      <RangePicker format="MM/DD/YYYY" onFocus={clearError} />
    </Container>
  );
};

export default DateRangePickerImpl;
