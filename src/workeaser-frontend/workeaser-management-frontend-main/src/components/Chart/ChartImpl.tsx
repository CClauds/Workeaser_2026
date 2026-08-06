import { MenuContext } from "@contexts/MenuContext";
import { theme } from "@styles/themes";
import type {
  ECharts,
  EChartsOption,
  SeriesOption,
  SetOptionOpts,
} from "echarts";
import * as echarts from "echarts";
import * as ecStat from "echarts-stat";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChartContainer } from "./styles";
import { sunburstOptions } from "./options";
import Money from "dinero.js";

type ChartTypes =
  | "pie"
  | "pieBig"
  | "sunburst"
  | "funnel"
  | "gauge"
  | "singleBar"
  | "multBar"
  | "cluster"
  | "map"
  | "cashFlowChart"
  | "heatmap";

export interface ChartProps {
  option?: EChartsOption;
  settings?: SetOptionOpts;
  type?: ChartTypes;
  width?: number | string;
  height?: number | string;
  loading?: boolean;
  onChart?: (chart: ECharts) => void;
}
export const Chart: React.FC<ChartProps> = ({
  option,
  settings,
  type,
  loading,
  height,
  onChart,
}) => {
  const { isOpen } = useContext(MenuContext);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<ECharts | undefined>();

  let chartClass = "";
  switch (type) {
    case "multBar":
    case "cashFlowChart":
      chartClass += "big";
      break;
    case "pieBig":
      chartClass += "full";
      break;
    case "heatmap":
      chartClass += "heatmap";
      break;
    default:
      chartClass += "default";
      break;
  }

  useEffect(() => {
    // Initialize chart
    let newChart: ECharts | undefined;
    if (chartRef.current !== null) {
      newChart = echarts.init(chartRef.current);
      setChart(newChart);
      if (onChart) onChart(newChart);
    }

    const resizeChart = () => {
      newChart?.resize();
    };
    window.addEventListener("resize", resizeChart);

    return () => {
      newChart?.dispose();
      window.removeEventListener("resize", resizeChart);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      resizeChart(chart);
    }, 50);
    setTimeout(() => {
      clearInterval(interval);
    }, 450);
  }, [isOpen, chart]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = echarts.getInstanceByDom(chartRef.current);

      if (type === "cluster") {
        // @ts-ignore
        echarts.registerTransform(ecStat.transform.clustering);
      }

      let chartOptions: EChartsOption;
      switch (type) {
        case "map":
          // @ts-ignore
          echarts.registerMap("WORLD", mapJson);
          chartOptions = { ...option };
          break;
        case "pie":
          chartOptions = {
            ...doughnutOptions,
            ...option,
            series: [
              {
                ...doughnutOptions.series[0],
                ...(option?.series ? option?.series[0] : {}),
              },
            ],
          };
          break;
        case "sunburst":
          chartOptions = {
            ...sunburstOptions,
            ...option,
            series: [
              {
                ...sunburstOptions.series[0],
                ...(option?.series ? option?.series[0] : {}),
              },
            ],
          };
          break;
        case "funnel":
          chartOptions = {
            ...funnelOptions,
            ...option,
            series: [
              {
                ...funnelOptions.series[0],
                ...(option?.series ? option?.series[0] : {}),
              },
              // {
              //   ...funnelOptionsOld.series[1],
              //   ...(option?.series ? option?.series[1] : {}),
              // },
            ],
          };
          break;
        case "gauge":
          chartOptions = {
            ...gaugeOptions,
            ...option,
            series: [
              {
                ...gaugeOptions.series[0],
                ...(option?.series ? option?.series[0] : {}),
              },
              {
                ...gaugeOptions.series[1],
                ...(option?.series ? option?.series[1] : {}),
              },
            ],
          };
          break;
        case "singleBar":
          chartOptions = {
            ...singleBarOptions,
            ...option,
            // @ts-ignore
            series: singleBarOptions.series.map(
              (serie: SeriesOption, index: number) => ({
                ...serie,
                ...option?.series[index],
              })
            ),
          };
          break;
        case "multBar":
          chartOptions = {
            ...multBarOptiosn,
            ...option,
          };
          break;
        case "heatmap":
          chartOptions = {
            ...heatmapOptions,
            ...option,
          };
          break;
        case "cashFlowChart":
          chartOptions = {
            ...cashFlowOptions,
            ...option,
            // @ts-ignore
            series: cashFlowOptions.series.map(
              (serie: SeriesOption, index: number) => ({
                ...serie,
                ...option?.series[index],
              })
            ),
          };
          break;
        case "cluster":
          chartOptions = {
            ...Clusteroption,
          };
          break;
        default:
          chartOptions = { ...option };
          break;
      }
      chart.setOption(chartOptions, settings);
    }
  }, [option, settings]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = echarts.getInstanceByDom(chartRef.current);
      loading === true ? chart.showLoading() : chart.hideLoading();
    }
  }, [loading]);

  const resizeChart = (chart: ECharts) => {
    if (chart) chart.resize();
  };
  return (
    <ChartContainer ref={chartRef} className={chartClass} style={{ height }} />
  );
};

const CURRENT_THEME = "Blue";
const colors = Array.from({ length: 8 }).map(
  (_, index) => theme.colors[`theme${CURRENT_THEME}${index + 1}00`]
);

const doughnutOptions: EChartsOption = {
  tooltip: {
    trigger: "item",
  },
  legend: {
    show: false,
    textStyle: { fontSize: 0 },
    top: "bottom",
    left: "center",
    icon: "square",
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 8,
    itemStyle: {
      borderWidth: 0,
    },
  },
  series: [
    {
      type: "pie",
      left: "center",
      top: "0",
      radius: [60, 90],
      label: {
        show: false,
        color: "#2b3450",
        position: "center",
      },
      labelLine: {
        lineStyle: {
          color: "#2b3450",
        },
        smooth: 0.2,
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "white",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "14",
          fontWeight: "bold",
        },
      },
      color: colors.slice(2),
    },
  ],
};
const funnelOptions: EChartsOption = {
  tooltip: {
    trigger: "item",
  },
  legend: { show: false },
  series: [
    {
      type: "funnel",
      left: "center",
      top: "center",
      width: "90%",
      height: "90%",
      minSize: "15%",
      // maxSize: "100%",
      sort: "none",
      label: {
        show: false,
        color: "#ffffff",
        position: "center",
      },
      itemStyle: {
        borderWidth: 0,
      },
      emphasis: {
        label: {
          position: "inside",
          formatter: "{b}: {c}",
          fontSize: "15",
          fontWeight: "bold",
        },
      },
      color: colors.slice(3),
    },
  ],
};
const gaugeOptions: EChartsOption = {
  series: [
    // Data Gauge
    {
      type: "gauge",
      min: 0,
      max: 1,
      center: ["50%", "55%"],
      splitNumber: 10,
      axisLine: {
        show: false,
        roundCap: false,
        lineStyle: {
          width: 3,
          color: [
            [0.125, colors[0]],
            [0.25, colors[1]],

            [0.3125, colors[2]],
            [0.4375, colors[3]],

            [0.5625, colors[4]],
            [0.6875, colors[5]],

            [0.8125, colors[6]],
            [1.0, colors[7]],
          ],
        },
      },
      pointer: {
        length: 18,
        width: 8,
        offsetCenter: [0, "-65%"],
        itemStyle: {
          color: "#2b3450",
        },
      },
      progress: {
        show: false,
        overlap: false,
        roundCap: true,
        itemStyle: {
          color: "auto",
        },
      },
      axisTick: {
        show: true,
        length: 10,
        distance: -28,
        lineStyle: {
          color: "auto",
          width: 2,
          cap: "square",
        },
      },
      splitLine: {
        show: true,
        length: 12,
        distance: -30,
        lineStyle: {
          color: "auto",
          width: 4,
          cap: "square",
        },
      },
      axisLabel: {
        show: false,
      },
      detail: {
        fontSize: 18,
        offsetCenter: [0, 0],
        valueAnimation: true,
        formatter: function (value) {
          return Math.round(value * 100) + "%";
        },
        color: "#2b3450",
      },
      data: [
        {
          value: 0.72,
        },
      ],
    },
    // Progress Gauge
    {
      type: "gauge",
      min: 0,
      max: 1,
      radius: "84%",
      center: ["50%", "55%"],
      splitNumber: 0,
      itemStyle: {
        color: "#2b3450",
      },
      axisLine: {
        show: true,
        roundCap: false,
        lineStyle: {
          width: 12,
        },
      },
      progress: {
        show: true,
        overlap: false,
        roundCap: false,
      },
      pointer: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      detail: {
        show: false,
      },
      data: [
        {
          value: 0.72,
        },
      ],
    },
  ],
};
const singleBarOptions: EChartsOption = {
  tooltip: {
    trigger: "item",
    axisPointer: {
      type: "line",
    },
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
  grid: {
    show: false,
    height: "185",
    left: "center",
    top: "5",
  },
  yAxis: {
    show: false,
    type: "value",
  },
  xAxis: {
    show: false,
    type: "category",
  },
  series: [
    {
      type: "bar",
      barMaxWidth: 40,
      stack: "total",
      color: colors[5],
      label: {
        show: false,
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "white",
      },
      emphasis: {
        focus: "series",
      },
    },
    {
      type: "bar",
      barMaxWidth: 70,
      stack: "total",
      color: colors[2],
      label: {
        show: false,
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "white",
      },
      emphasis: {
        focus: "series",
      },
    },
    {
      type: "bar",
      barMaxWidth: 70,
      stack: "total",
      color: colors[6],
      label: {
        show: false,
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "white",
      },
      emphasis: {
        focus: "series",
      },
    },
  ],
};
const multBarOptiosn: EChartsOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  legend: {
    textStyle: {
      fontSize: 13,
      color: "#2f3853",
      fontFamily: "Roboto",
    },
    top: "top",
    left: "center",
    padding: 0,
    icon: "square",
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
    itemStyle: { borderWidth: 0 },
  },
  grid: {
    left: "0",
    right: "0",
    bottom: "0",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    axisTick: {
      show: false,
    },
    data: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    axisLine: {
      show: false,
      lineStyle: {
        color: "#2f3853",
      },
    },
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 100,
    axisLabel: {
      formatter: "{value} %",
    },
    axisLine: {
      show: false,
      lineStyle: {
        color: "#2f3853",
      },
    },
  },
  color: [colors[4], colors[2], colors[6]],
  dataset: {
    dimensions: [
      "Service Ocuppancy",
      "Metting Room",
      "Open Desk",
      "Private Room",
    ],
  },
  series: [
    {
      type: "bar",
      barMaxWidth: 22,
      label: { show: false },
      itemStyle: { borderWidth: 0 },
      emphasis: { focus: "none" },
      // markLine: {
      //   symbol: "none",
      //   silent: true,
      //   data: [
      //     {
      //       yAxis: 0,
      //       label: { show: false },
      //       lineStyle: {
      //         type: "solid",
      //         color: "#2b3450",
      //       },
      //     },
      //   ],
      // },
      tooltip: {
        valueFormatter: function (value) {
          return `${value} %`;
        },
      },
    },
    {
      type: "bar",
      barGap: 0,
      barCategoryGap: "20%",
      barMaxWidth: 22,
      color: "#82D3F5",
      label: { show: false },
      itemStyle: { borderWidth: 0 },
      emphasis: { focus: "none" },
      // markLine: {
      //   symbol: "none",
      //   silent: true,
      //   data: [
      //     {
      //       yAxis: 0,
      //       label: { show: false },
      //       lineStyle: {
      //         type: "solid",
      //         color: "#2b3450",
      //       },
      //     },
      //   ],
      // },
      tooltip: {
        valueFormatter: function (value) {
          return `${value} %`;
        },
      },
    },
    {
      type: "bar",
      barMaxWidth: 22,
      color: "#275B94",
      label: { show: false },
      itemStyle: { borderWidth: 0 },
      emphasis: { focus: "none" },
      tooltip: {
        valueFormatter: function (value) {
          return `${value} %`;
        },
      },
    },
  ],
};
const cashFlowOptions: EChartsOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  legend: {
    data: [
      {
        name: "Income",
        icon: "squart",
      },
      {
        name: "Expenses",
        icon: "square",
      },
      {
        name: "Balance",
      },
    ],
    textStyle: {
      fontSize: 13,
      color: "#2f3853",
      fontFamily: "Roboto",
    },
    top: "top",
    left: "center",
    padding: 0,
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
    itemStyle: {
      borderWidth: 0,
    },
  },
  grid: {
    left: "0",
    right: "0",
    bottom: "0",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      axisTick: {
        show: false,
      },
      data: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisLine: {
        show: false,
        lineStyle: {
          color: "#2f3853",
        },
      },
    },
  ],
  yAxis: [
    {
      type: "value",
      axisLabel: {
        color: "#2b3450",
        formatter: (value: number) => {
          return Money({ amount: Math.round(value) }).toFormat("$0,0.00");
        },
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: "#2f3853",
        },
      },
    },
  ],
  color: [colors[5], colors[7], colors[3]],
  series: [
    {
      name: "Income",
      type: "bar",
      barMaxWidth: 32,
      stack: "Total",
      label: {
        show: false,
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "white",
      },
      emphasis: {
        focus: "none",
      },
    },
    {
      name: "Expenses",
      type: "bar",
      barMaxWidth: 32,
      stack: "Total",
      label: {
        show: false,
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "white",
      },
      emphasis: {
        focus: "none",
      },
    },
    {
      name: "Balance",
      zlevel: 1,
      type: "line",
      lineStyle: {
        width: 1,
      },
      markLine: {
        symbol: "none",
        silent: true,
        data: [
          {
            yAxis: 0,
            label: {
              show: false,
            },
            lineStyle: {
              type: "solid",
            },
          },
        ],
      },
      areaStyle: {
        opacity: 0.35,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(97, 177, 227,1)",
          },
          {
            offset: 1,
            color: "rgba(97, 177, 227,0.3)",
          },
        ]),
      },
      smooth: false,
      symbolSize: 10,
      label: {
        show: false,
        position: "inside",
        formatter: "$ {c}",
      },
      emphasis: {
        focus: "none",
      },
    },
  ],
};
const heatmapOptions: EChartsOption = {
  tooltip: {
    formatter: function (p) {
      const format = echarts.time.format(p.data[0], "{MM}-{dd}-{yyyy}", false);
      return (
        "Space Usage:" + "<br/>" + format + ": " + "<b>" + p.data[1] + "</b>"
      );
    },
  },
  visualMap: {
    min: 1,
    max: 25,
    type: "piecewise",
    orient: "horizontal",
    left: "center",
    top: "top",
    text: ["Highest", "Lowest"],
    textStyle: {
      fontSize: 13,
      color: "#2f3853",
      fontFamily: "Roboto",
    },
    itemSymbol: "square",
    inRange: {
      color: ["#61B1E3", "#4E97CE", "#3A7AB2", "#275B94"],
    },
    outOfRange: {
      color: "#dbe3ea",
    },
  },
  calendar: [
    {
      cellSize: [16, 16],
      left: "center",
      bottom: "0",
      range: new Date().getFullYear(),
      splitLine: { show: false },
      itemStyle: { borderWidth: 0 },
      yearLabel: { show: false },
      monthLabel: {
        show: true,
        fontSize: 11,
        fontWeight: 600,
        align: "center",
        color: "#2b3450",
      },
      dayLabel: { show: false },
    },
  ],
  series: [
    {
      name: "Space Usage",
      type: "heatmap",
      coordinateSystem: "calendar",
      calendarIndex: 0,
      label: { show: false },
      itemStyle: {
        borderWidth: 4,
        borderColor: "white",
        borderRadius: 0,
      },
    },
  ],
};

// const funnelOptions: EChartsOption = {
//   tooltip: {
//     trigger: "axis",
//     axisPointer: {
//       type: "shadow",
//     },
//     formatter: function (params) {
//       var tar = params[1];
//       return `${tar.name}: ${tar.value}`;
//     },
//   },
//   grid: {
//     top: "7%",
//     bottom: "7%",
//     left: "5%",
//     right: "5%",
//   },
//   xAxis: {
//     show: false,
//     type: "value",
//   },
//   yAxis: {
//     show: false,
//     type: "category",
//     inverse: true,
//     data: ["Opportunity", "Contacted", "Requested", "Quoted", "Converted"],
//   },
//   series: [
//     {
//       name: "Placeholder",
//       type: "bar",
//       seriesLayoutBy: "column",
//       stack: "Total",
//       itemStyle: {
//         borderColor: "transparent",
//         color: "transparent",
//       },
//       emphasis: {
//         itemStyle: {
//           borderColor: "transparent",
//           color: "transparent",
//         },
//       },
//     },
//     {
//       type: "bar",
//       stack: "Total",
//       barCategoryGap: "3",
//       itemStyle: {
//         borderRadius: 50,
//         borderWidth: 3,
//         borderColor: "white",
//       },
//     },
//   ],
// };

const CLUSTER_COUNT = 6;
const DIENSIION_CLUSTER_INDEX = 2;
const COLOR_ALL = [
  "#37A2DA",
  "#e06343",
  "#37a354",
  "#b55dba",
  "#b5bd48",
  "#8378EA",
  "#96BFFF",
];
const data = [
  [3.275154, 2.957587],
  [-3.344465, 2.603513],
  [0.355083, -3.376585],
  [1.852435, 3.547351],
  [-2.078973, 2.552013],
  [-0.993756, -0.884433],
  [2.682252, 4.007573],
  [-3.087776, 2.878713],
  [-1.565978, -1.256985],
  [2.441611, 0.444826],
  [-0.659487, 3.111284],
  [-0.459601, -2.618005],
  [2.17768, 2.387793],
  [-2.920969, 2.917485],
  [-0.028814, -4.168078],
  [3.625746, 2.119041],
  [-3.912363, 1.325108],
  [-0.551694, -2.814223],
  [2.855808, 3.483301],
  [-3.594448, 2.856651],
  [0.421993, -2.372646],
  [1.650821, 3.407572],
  [-2.082902, 3.384412],
  [-0.718809, -2.492514],
  [4.513623, 3.841029],
  [-4.822011, 4.607049],
  [-0.656297, -1.449872],
  [1.919901, 4.439368],
  [-3.287749, 3.918836],
  [-1.576936, -2.977622],
  [3.598143, 1.97597],
  [-3.977329, 4.900932],
  [-1.79108, -2.184517],
  [3.914654, 3.559303],
  [-1.910108, 4.166946],
  [-1.226597, -3.317889],
  [1.148946, 3.345138],
  [-2.113864, 3.548172],
  [0.845762, -3.589788],
  [2.629062, 3.535831],
  [-1.640717, 2.990517],
  [-1.881012, -2.485405],
  [4.606999, 3.510312],
  [-4.366462, 4.023316],
  [0.765015, -3.00127],
  [3.121904, 2.173988],
  [-4.025139, 4.65231],
  [-0.559558, -3.840539],
  [4.376754, 4.863579],
  [-1.874308, 4.032237],
  [-0.089337, -3.026809],
  [3.997787, 2.518662],
  [-3.082978, 2.884822],
  [0.845235, -3.454465],
  [1.327224, 3.358778],
  [-2.889949, 3.596178],
  [-0.966018, -2.839827],
  [2.960769, 3.079555],
  [-3.275518, 1.577068],
  [0.639276, -3.41284],
];
const pieces = [];
for (let i = 0; i < CLUSTER_COUNT; i++) {
  pieces.push({
    value: i,
    label: "cluster " + i,
    color: COLOR_ALL[i],
  });
}

const Clusteroption: EChartsOption = {
  dataset: [
    {
      source: data,
    },
    {
      transform: {
        type: "ecStat:clustering",
        // print: true,
        config: {
          clusterCount: CLUSTER_COUNT,
          outputType: "single",
          outputClusterIndexDimension: DIENSIION_CLUSTER_INDEX,
        },
      },
    },
  ],
  tooltip: {
    position: "top",
  },
  visualMap: {
    type: "piecewise",
    top: "middle",
    min: 0,
    max: CLUSTER_COUNT,
    left: 10,
    splitNumber: CLUSTER_COUNT,
    dimension: DIENSIION_CLUSTER_INDEX,
    pieces: pieces,
  },
  grid: {
    left: 120,
  },
  xAxis: {},
  yAxis: {},
  series: {
    type: "scatter",
    encode: { tooltip: [0, 1] },
    symbolSize: 15,
    itemStyle: {
      borderColor: "#555",
    },
    datasetIndex: 1,
  },
};
