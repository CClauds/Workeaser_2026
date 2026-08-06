import React, { useEffect, useRef, useState } from "react";
import { Container } from "./styles";
import { useField } from "@unform/core";
import { TimePicker as TimePickerAntd } from "antd";
import { Dayjs } from "dayjs";

interface TimepickerProps {
  name: string;
  width?: string | number;
  onChange?: (vale: Date) => void;
}

export const TimePickerImpl: React.FC<TimepickerProps> = ({
  name,
  onChange,
  width,
  ...props
}) => {
  const timepickerRef = useRef(null);

  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

  const [time, setTime] = useState<Dayjs>(defaultValue || null);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: timepickerRef,
      getValue: (ref) => {
        return ref?.current.children[0].children[0].children[0].value;
      },
      clearValue: (ref: any) => {
        ref.clear();
      },
    });
  }, [fieldName, registerField]);

  const handleTimeChange = (value: Dayjs) => {
    setTime(value);
  };

  return (
    <Container
      ref={timepickerRef}
      className={error ? "error" : ""}
      style={{ width }}
    >
      <TimePickerAntd
        placeholder="00:00"
        use12Hours
        format="h:mm a"
        minuteStep={10}
        value={time}
        onChange={handleTimeChange}
        onFocus={clearError}
        {...props}
      />
    </Container>
  );
};

export default TimePickerImpl;
