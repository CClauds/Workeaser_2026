import moment from "moment";

export const DATE_MASK = "MM/dd/yyyy";

export const formatMoney = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value ?? 0);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
};

export const formatDate = (value: Date) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
};
export const formatDateNew = (value: string): string => {
  if (!value) return "";
  const date = new Date(`${value}T00:00`);
  if (!(date instanceof Date && !isNaN(date.valueOf()))) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const formatIsoDate = (value: string) => {
  if (!value) return "";
  value = value.replace(/\+00:00$/, "");
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const formatDateExtendMonth = (value: string) => {
  if (!value || value === "undefined") {
    return "";
  }
  value = value.replace(/\+00:00$/, "");
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};
export const formatTime = (value: string): string => {
  if (!value || value === "undefined") return "";
  value = value.replace(/\+00:00$/, "");
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatCalendarDate = (value: number) => {
  if (!value) return "";
  return moment(value).format("YYYY-MM-DD");
};

export const nFormatter = (num: number, digits: number = 1) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
};
