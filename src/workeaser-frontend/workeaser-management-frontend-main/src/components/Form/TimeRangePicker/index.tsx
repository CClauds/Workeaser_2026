/**
 * Client-only wrapper para antd TimePicker.RangePicker. Vide
 * `Form/DatePickerAntd/index.tsx` para explicação da arquitetura ssr:false.
 */
import type { TimeRangePickerProps as TimePickerAntdProps } from "antd";
import dynamic from "next/dynamic";
import React from "react";

interface TimepickerProps extends TimePickerAntdProps {
  name: string;
  width?: number | string;
}

const Impl = dynamic(() => import("./_impl"), {
  ssr: false,
  loading: () => <div style={{ height: 32 }} aria-hidden="true" />,
});

export const TimeRangePicker: React.FC<TimepickerProps> = (props) => <Impl {...props} />;
