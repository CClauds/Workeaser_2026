import React, { useRef, useState, useEffect } from "react";
import DayPicker, { DayModifiers, DayPickerProps } from "react-day-picker";

import { useField } from "@unform/core";

import styles from "./styles.module.scss";
import "react-day-picker/lib/style.css";

interface CalendarProps extends DayPickerProps {
  name: string;
}

export const Calendar: React.FC<CalendarProps> = ({ name, ...rest }) => {
  const datepickerRef = useRef<DayPicker>(null);

  const { fieldName, registerField, defaultValue } = useField(name);

  const [date, setDate] = useState<Date>(defaultValue || new Date());

  const handleDayClick = (date: Date, { disabled }: DayModifiers) => {
    if (!disabled) setDate(date);
  };

  const renderDay = (day: Date) => {
    const currentDay = day.getDate();
    return (
      <div
        className={`
          ${styles.day}
          ${day.getDate() === date.getDate() ? styles.selected : undefined}
        `}
      >
        {currentDay}
      </div>
    );
  };

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: datepickerRef.current,
      path: "props.selectedDays",
      clearValue: (_: any) => {
        setDate(new Date());
      },
    });
  }, [fieldName, registerField]);

  return (
    <DayPicker
      ref={datepickerRef}
      selectedDays={date}
      onDayClick={handleDayClick}
      renderDay={renderDay}
      disabledDays={{
        before: new Date(),
      }}
      className={styles.calendar}
      {...rest}
    />
  );
};
