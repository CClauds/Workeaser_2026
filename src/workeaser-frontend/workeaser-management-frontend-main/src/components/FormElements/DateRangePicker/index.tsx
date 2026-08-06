/**
 * Client-only wrapper para antd DatePicker.RangePicker (variante FormElements).
 * Vide `Form/DatePickerAntd/index.tsx` para explicação da arquitetura ssr:false.
 */
import { Dayjs } from "dayjs";
import dynamic from "next/dynamic";
import React from "react";

export type RangeValue = [Dayjs | null, Dayjs | null] | null;

interface DateRangePickerProps {
  onChange: (values: RangeValue) => void;
}

const Impl = dynamic(() => import("./_impl"), {
  ssr: false,
  loading: () => <div style={{ height: 32 }} aria-hidden="true" />,
});

export const DateRangePicker: React.FC<DateRangePickerProps> = (props) => (
  <Impl {...props} />
);
