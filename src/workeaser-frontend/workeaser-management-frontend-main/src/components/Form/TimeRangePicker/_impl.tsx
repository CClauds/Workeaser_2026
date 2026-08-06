import { useField } from "@unform/core";
import { TimePicker as TimePickerAntd, TimeRangePickerProps as TimePickerAntdProps } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useRef } from "react";
import { Container } from "./styles";

interface TimepickerProps extends TimePickerAntdProps {
  name: string;
  width?: number | string;
}

export const TimeRangePickerImpl: React.FC<TimepickerProps> = ({
  name,
  width,
  ...props
}) => {
  const timepickerRef = useRef(null);

  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: timepickerRef,
      getValue: (ref) => {
        const timeFrom = ref?.current.children[0].children[0].children[0].value;
        const timeTo = ref?.current.children[0].children[2].children[0].value;
        if (!timeFrom || !timeTo) {
          return null;
        }
        const resTimeFrom = dayjs(timeFrom, "h:mm a").format("HH:mm:ss");
        const resTimeTo = dayjs(timeTo, "h:mm a").format("HH:mm:ss");
        return [resTimeFrom, resTimeTo];
      },
      clearValue: () => {
        // no-op
      },
    });
  }, [fieldName, registerField]);

  return (
    <Container
      ref={timepickerRef}
      className={error ? "error" : ""}
      style={{ width }}
    >
      <TimePickerAntd.RangePicker
        use12Hours
        format="h:mm a"
        onFocus={clearError}
        {...props}
      />
    </Container>
  );
};

export default TimeRangePickerImpl;
