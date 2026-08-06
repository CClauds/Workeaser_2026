import { ErrorTooltip } from "@components/Form/ErrorTooltip";
import { Tooltip } from "@components/Tooltip";
import { useField } from "@unform/core";
import React, { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import styles from "./styles.module.scss";

interface ServiceCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  value?: string | number;
  tooltip?: string;
}

export const ServiceCheckbox: React.FC<ServiceCheckboxProps> = ({
  name,
  value,
  label,
  tooltip,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>();

  const toggleTooltip = (value: boolean) => () => setTooltipOpen(value);

  const { fieldName, defaultValue, registerField, error, clearError } =
    useField(name);
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
    <div className={`${styles.wrapper} ${error ? styles.error : ""}`}>
      <label
        className={`${styles.container} ${error ? styles.error : ""}`}
        onMouseEnter={toggleTooltip(true)}
        onMouseLeave={toggleTooltip(false)}
      >
        <input
          ref={inputRef}
          defaultChecked={defaultChecked}
          type="checkbox"
          value={value}
          onFocus={clearError}
        />
        <span>{label}</span>
      </label>
      <Tooltip isActive={tooltipOpen} message={tooltip ?? ""} />
    </div>
  );
};
