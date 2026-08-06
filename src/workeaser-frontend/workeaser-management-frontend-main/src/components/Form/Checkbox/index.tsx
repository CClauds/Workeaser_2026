import React, {
  useRef,
  useEffect,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { useField } from "@unform/core";

import styles from "./styles.module.scss";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  value?: string;
  children?: ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  name,
  children,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, defaultValue, registerField } = useField(name);

  const defaultChecked = defaultValue === value;

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: (ref) => {
        return ref.current.checked;
      },
      clearValue: (ref) => {
        ref.current.checked = defaultChecked;
      },
      setValue: (ref, value) => {
        ref.current.checked = value;
      },
    });
  }, [defaultValue, fieldName, registerField, defaultChecked]);

  return (
    <label className={styles.container}>
      <input
        defaultChecked={defaultChecked}
        ref={inputRef}
        type="checkbox"
        value={value}
        id={fieldName}
        {...rest}
      />
      {children}
    </label>
  );
};
