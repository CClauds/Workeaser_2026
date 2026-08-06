import { useField } from "@unform/core";
import React, {
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { ApiItem } from "types";
import styles from "./styles.module.scss";

interface CustomCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  value?: number;
  width?: number;
  labelBgColor?: string;
  children?: ReactNode;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  name,
  value,
  label,
  width,
  labelBgColor,
  children,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, defaultValue, registerField } = useField(name);

  const defaultChecked = defaultValue === value;

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: (ref) => {
        return {
          id: ref.current.value,
          checked: ref.current.checked,
        };
      },
      clearValue: (ref) => {
        ref.current.checked = defaultChecked;
      },
      setValue: (ref, value: ApiItem) => {
        ref.current.checked = value.checked;
      },
    });
  }, [defaultValue, fieldName, registerField, defaultChecked]);

  return (
    <label
      className={styles.container}
      style={{ flexBasis: width ? `${width}px` : "" }}
    >
      <input
        ref={inputRef}
        defaultChecked={defaultChecked}
        type="checkbox"
        value={value}
      />
      {children ? (
        children
      ) : (
        <span style={{ backgroundColor: labelBgColor }}>{label}</span>
      )}
    </label>
  );
};
