import { forwardRef, InputHTMLAttributes, MutableRefObject } from "react";
import { Input } from "./styles";

interface TableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const TableInputElement = (
  { className, ...props },
  ref: MutableRefObject<HTMLInputElement>
) => <Input ref={ref} className={`${className ? className : ""}`} {...props} />;

export const TableInputComponent = forwardRef<
  HTMLInputElement,
  TableInputProps
>(TableInputElement);
