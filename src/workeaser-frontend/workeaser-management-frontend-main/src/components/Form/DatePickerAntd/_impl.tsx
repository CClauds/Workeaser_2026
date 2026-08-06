import { useField } from "@unform/core";
import { DatePicker, DatePickerProps as DatePickerAntdProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";

export const DatePickerAntdImpl: React.FC<DatePickerAntdProps & { name: string }> = ({
  name,
  ...props
}) => {
  const datepickerRef = useRef(null);

  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

  const [date, setDate] = useState<Dayjs>(defaultValue || dayjs());

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: datepickerRef,
      getValue: (ref) => {
        const date = ref?.current.children[0].children[0].children[0].value;
        if (!date) {
          return null;
        }
        const resDate = dayjs(date).format("YYYY-MM-DD");
        return resDate;
      },
      clearValue: (ref: any) => {
        ref.clear();
      },
      setValue: () => {
        // intentionally no-op; antd DatePicker is controlled internally above
      },
    });
  }, [fieldName, registerField]);

  const handleDateChange = (date: Dayjs) => {
    setDate(date);
  };

  const presets: {
    label: string;
    value: Dayjs;
  }[] = [
    { label: "Yesterday", value: dayjs().add(-1, "d") },
    { label: "Last Week", value: dayjs().add(-7, "d") },
    { label: "Last Month", value: dayjs().add(-1, "month") },
    { label: "Last Year", value: dayjs().add(-1, "year") },
  ];

  return (
    <div
      ref={datepickerRef}
      className={`${styles.container} ${error ? styles.error : ""} ${
        props.open ? styles.open : ""
      }`}
    >
      <DatePicker
        placeholder="00/00/0000"
        format="MM/DD/YYYY"
        value={date}
        onChange={handleDateChange}
        presets={presets}
        onFocus={clearError}
        {...props}
      />
    </div>
  );
};

export default DatePickerAntdImpl;
