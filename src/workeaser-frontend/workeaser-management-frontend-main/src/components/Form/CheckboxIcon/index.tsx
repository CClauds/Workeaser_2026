import { useField } from "@unform/core";
import React, { InputHTMLAttributes, useEffect, useRef } from "react";
import { ApiItem } from "types";
import { Icomoon } from "../../Icomoon";
import styles from "./styles.module.scss";

interface CheckboxIconProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  value: number;
  label: string;
  icon: string;
}

export const CheckboxIcon: React.FC<CheckboxIconProps> = ({
  value,
  label,
  icon,
  name,
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
        return ref.current.checked ? ref.current.value : null;
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
      <Icomoon iconName={icon} />
      <span className={styles.label}>{label}</span>
      <input
        ref={inputRef}
        defaultChecked={defaultChecked}
        type="checkbox"
        value={value}
        {...rest}
      />
    </label>
  );
};
