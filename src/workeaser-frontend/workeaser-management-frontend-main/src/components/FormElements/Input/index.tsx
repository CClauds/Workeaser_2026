import { phoneMask, percentageMask } from "@utils/masks";
import Money from "dinero.js";
import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  KeyboardEvent,
  MutableRefObject,
} from "react";
import { Input } from "./styles";

export interface StyledInputProps {
  error?: boolean;
  hasPrefix?: boolean;
  hasSufix?: boolean;
}

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    StyledInputProps {
  className?: string;
  mask?: string;
}

const InputElement = (
  { className = "", mask, ...props },
  ref: MutableRefObject<HTMLInputElement>
) => {
  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (mask?.match(/phone/i) || props.type === "tel") {
      event.currentTarget.maxLength = 14;
      event.currentTarget.value = phoneMask(event.currentTarget.value);
    } else if (mask?.match(/percentage/i)) {
      const number = value.replace(/\D/g, "").replace(/\$|,|\.|%/g, "");
      if (!number) {
        percentageMask(String(0));
        return;
      }

      // if (parseInt(number) < 0 || parseInt(number) > 10000) {
      //   return;
      // }

      event.currentTarget.value = `${Money({
        amount: parseInt(number),
      }).toFormat("0.00")}%`;
    } else if (mask?.match(/currency/i)) {
      const value = event.currentTarget.value;
      const number = value.replace(/\D/g, "").replace(/\$|,|\./g, "");
      if (!number) {
        event.currentTarget.value = "0";
        return;
      }
      event.currentTarget.value = Money({
        amount: parseInt(number),
      }).toFormat("$0,0.00");
    } else if (mask?.match(/month/i) || mask?.match(/year/i)) {
      event.currentTarget.maxLength = mask?.match(/month/i) ? 2 : 4;
      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
    }
  };

  const handleAmountKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && mask?.match(/percentage/i)) {
      const value = ref.current.value;
      const number = value.replace(/\$|,|\.|%/g, "");
      const formatedValue = number.slice(0, -1);
      if (!formatedValue) {
        event.currentTarget.value = percentageMask(String(0));
        return;
      }
      event.currentTarget.value = `${Money({
        amount: parseInt(formatedValue),
      }).toFormat("0.00")}%`;
    }
  };

  return (
    <Input
      ref={ref}
      onChange={handleTextChange}
      onKeyDown={handleAmountKeyDown}
      className={className}
      style={{ width: props.width }}
      {...props}
    />
  );
};

export const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  InputElement
);
