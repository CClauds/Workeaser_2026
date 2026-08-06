import { theme } from "@styles/themes";
import type { EChartsOption } from "echarts";

const CURRENT_THEME = "Blue";
const colors = Array.from({ length: 8 }).map(
  (_, index) => theme.colors[`theme${CURRENT_THEME}${index + 1}00`]
);

export const sunburstOptions: EChartsOption = {
  tooltip: {
    trigger: "item",
  },
  legend: {
    show: false,
    textStyle: { fontSize: 10 },
    bottom: "-12",
    left: "center",
    icon: "rect",
    itemGap: 1,
    itemStyle: {
      borderWidth: 0,
    },
  },
  series: {
    type: "sunburst",
    radius: [45, 90],
    itemStyle: {
      borderWidth: 0,
      borderColor: "white",
    },
    label: {
      show: false,
      color: "#2b3450",
    },
    emphasis: {
      label: {
        show: false,
        fontSize: "25",
        fontWeight: "bold",
      },
    },
    color: colors,
  },
};
