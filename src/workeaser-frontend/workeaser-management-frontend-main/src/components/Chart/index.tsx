import dynamic from "next/dynamic";
import type { ChartProps } from "./ChartImpl";

// echarts quebra em Node ("window is not defined") durante o build SSR.
// ssr:false mantém o Chart fora do server bundle — carrega só no browser.
export const Chart = dynamic<ChartProps>(
  () => import("./ChartImpl").then((m) => m.Chart),
  { ssr: false }
);

export { sunburstOptions } from "./options";
