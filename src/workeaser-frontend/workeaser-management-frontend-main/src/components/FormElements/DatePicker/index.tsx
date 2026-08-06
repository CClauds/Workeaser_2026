/**
 * Client-only wrapper para antd DatePicker (variante FormElements). Vide
 * `Form/DatePickerAntd/index.tsx` para explicação da arquitetura ssr:false.
 */
import dynamic from "next/dynamic";
import React from "react";

interface DatePickerProps {
  id?: string;
  onDateChange?: (date: string) => void;
}

const Impl = dynamic(() => import("./_impl"), {
  ssr: false,
  loading: () => <div style={{ height: 32 }} aria-hidden="true" />,
});

export const DatePickerAntd: React.FC<DatePickerProps> = (props) => <Impl {...props} />;
