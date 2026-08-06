/**
 * Client-only wrapper para antd TimePicker. Vide `Form/DatePickerAntd/index.tsx`
 * para explicação da arquitetura ssr:false.
 */
import dynamic from "next/dynamic";
import React from "react";

interface TimepickerProps {
  name: string;
  width?: string | number;
  onChange?: (vale: Date) => void;
}

const Impl = dynamic(() => import("./_impl"), {
  ssr: false,
  loading: () => <div style={{ height: 32 }} aria-hidden="true" />,
});

export const TimePicker: React.FC<TimepickerProps> = (props) => <Impl {...props} />;
