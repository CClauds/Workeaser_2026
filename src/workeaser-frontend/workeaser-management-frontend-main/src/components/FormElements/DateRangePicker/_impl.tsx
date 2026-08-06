import { DatePicker } from "antd";
import { Dayjs } from "dayjs";
import React, { useRef } from "react";
import { Container } from "./styles";

const { RangePicker } = DatePicker;
export type RangeValue = [Dayjs | null, Dayjs | null] | null;

interface DateRangePickerProps {
  onChange: (values: RangeValue) => void;
}

export const DateRangePickerImpl: React.FC<DateRangePickerProps> = ({ onChange }) => {
  const datepickerRef = useRef(null);

  return (
    <Container ref={datepickerRef}>
      <RangePicker format="MM/DD/YYYY" onChange={onChange} />
    </Container>
  );
};

export default DateRangePickerImpl;
