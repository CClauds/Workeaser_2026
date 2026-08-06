import React, { useRef, useEffect, useContext, useState } from "react";
import { init, getInstanceByDom } from "echarts";
import type { EChartsOption, ECharts, SetOptionOpts } from "echarts";

import { MenuContext } from "../../contexts/MenuContext";

interface CalendarChartProps {
  name: string;
  option: EChartsOption;
  settings?: SetOptionOpts;
  className?: string;
  loading?: boolean;
  onChart?: (chart: ECharts, name: string) => void;
}

export const CalendarChart: React.FC<CalendarChartProps> = ({
  name,
  option,
  settings,
  loading,
  className,
  onChart,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<ECharts | undefined>();

  const { isOpen } = useContext(MenuContext);

  useEffect(() => {
    // Initialize chart
    let newChart: ECharts | undefined;
    if (chartRef.current !== null) {
      newChart = init(chartRef.current);
      setChart(newChart);
      // onChart(newChart, name);
    }
    // Add chart resize listener
    // ResizeObserver is leading to a bit janky UX
    const resizeChart = () => {
      newChart?.resize();
    };
    window.addEventListener("resize", resizeChart);

    // Return cleanup function
    return () => {
      newChart?.dispose();
      window.removeEventListener("resize", resizeChart);
    };
  }, []);

  useEffect(() => {
    if (chart) {
      const interval = setInterval(() => {
        resizeChart(chart);
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
      }, 350);
    }
  }, [isOpen]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart.setOption(option, settings);
    }
  }, [option, settings]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      loading === true ? chart.showLoading() : chart.hideLoading();
    }
  }, [loading]);

  const resizeChart = (chart: ECharts) => {
    chart.resize();
  };

  return <div ref={chartRef} className={className} />;
};
