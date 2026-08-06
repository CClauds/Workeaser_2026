/**
 * Client-only wrapper para antd DatePicker.
 *
 * Por que: `antd` 5 + `rc-picker` + `dayjs` 1.x fazem imports ESM sem extensão
 * `.js`. Node 20+ ESM strict resolution recusa esses imports durante "Collecting
 * page data" no `next build`. Carregando o componente real via `next/dynamic`
 * com `ssr: false`, o módulo só é avaliado no browser — onde o webpack
 * resolve normalmente — e a build passa.
 *
 * Trade-off: o componente não é renderizado no SSR; aparece após hydrate.
 * Impacto aceitável aqui porque é input de formulário interno.
 */
import type { DatePickerProps as DatePickerAntdProps } from "antd";
import dynamic from "next/dynamic";
import React from "react";

const Impl = dynamic(
  () => import("./_impl").then((m) => m.DatePickerAntdImpl),
  {
    ssr: false,
    loading: () => <div style={{ height: 32 }} aria-hidden="true" />,
  }
);

export const DatePickerAntd: React.FC<DatePickerAntdProps & { name: string }> = (props) => (
  <Impl {...props} />
);
