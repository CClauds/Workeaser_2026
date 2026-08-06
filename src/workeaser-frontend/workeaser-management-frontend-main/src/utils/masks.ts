import Money from "dinero.js";

export const currencyMask = (value: string | number): string => {
  value = String(value);
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{0})$/, "0.00")
    .replace(/^(\d{1})$/, "0.0$1")
    .replace(/^(\d{2})$/, "0.$1")
    .replace(/0?(\d+)(\d{2})$/, "$1.$2")
    .replace(/(?=(\d{3})+(\D))\B/g, ",");
};

export const currencyUnmask = (value: string): string =>
  value.replace(/\$|,|\.|%/g, "");

export const dateMask = (value: string, type: string = "us"): string => {
  if (!value) return "";
  if (type === "us") {
    return value.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2/$3/$1");
  }
  return value.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1");
};
export const dateToIsoMask = (value: string, type: string = "us"): string => {
  if (!value) return "";
  if (type === "us") {
    return value.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$1-$2");
  }
  return value.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1");
};

export const phoneMask = (value: string, type: string = "us"): string =>
  type === "us"
    ? value
        .replace(/\D/g, "")
        .replace(/^(\d{3})(\d)/, "($1) $2")
        .replace(/ (\d{3})(\d)/, " $1-$2")
    : value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "($1) $2")
        .replace(/ (\d{3})(\d)/, " $1-$2");

// export const percentageMask = (value: string): string =>
//   value
//     .replace(/\D/g, "")
//     .replace(/^0(\d+)/, "$1")
//     .replace(/(\d+)%?/, "$1%");
export const percentageMask = (value: string): string =>
  `${Money({
    amount: parseInt(value) ?? 0,
  }).toFormat("0.00")}%`;
