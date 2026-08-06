import { Price } from "types/cowork";
import { currencyUnmask } from "./masks";
import { ValidationError } from "yup";

export const formatPricing = (value: Price[]) =>
  value.reduce((acc, currentPrice) => {
    const { monthly_price, full_price } = currentPrice;
    const monthlyPrice = parseInt(currencyUnmask(monthly_price));
    const fullPrice = parseInt(currencyUnmask(full_price));
    return monthlyPrice > 0 || fullPrice
      ? [
          ...acc,
          {
            ...currentPrice,
            monthly_price: monthlyPrice,
            full_price: fullPrice,
          },
        ]
      : acc;
  }, []);

export const formatErrors = (errors: any) => {
  console.log({ errors });
  if (errors instanceof ValidationError) {
    const validationErrors = {};
    errors.inner.forEach((error) => {
      console.log(error.message);
      validationErrors[error.path] = error.message;
    });
    return;
  }
  if (errors.message) {
    return;
  }
  if (!Array.isArray(errors?.response?.data.error.message)) {
    console.log(errors.message);
    return;
  }
  errors?.response?.data.error.message.forEach((message) => {});
};
