import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import styles from "./styles.module.scss";

interface DatePickerProps {
  id?: string;
  onDateChange?: (date: string) => void;
}

export const DatePickerAntdImpl: React.FC<DatePickerProps> = ({
  id,
  onDateChange,
}) => {
  const [date, setDate] = useState<Dayjs>(null);

  const handleDateChange = (date: Dayjs) => {
    setDate(date);
    onDateChange?.(date?.format("YYYY-MM-DD") ?? null);
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
    <div className={styles.container}>
      <DatePicker
        id={id}
        placeholder="00/00/0000"
        format="MM/DD/YYYY"
        value={date}
        onChange={handleDateChange}
        presets={presets}
      />
    </div>
  );
};

export default DatePickerAntdImpl;
