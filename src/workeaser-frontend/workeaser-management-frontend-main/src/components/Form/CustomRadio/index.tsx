import { Tooltip } from "@components/Tooltip";
import { useField } from "@unform/core";
import React, {
  InputHTMLAttributes,
  MouseEvent,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Option } from "types/form";
import styles from "./styles.module.scss";

interface CustomOption extends Option {
  labelBgColor?: string;
  tooltip?: string;
}

interface CustomRadioProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  backgroundColor?: string;
  options: CustomOption[];
}

type RefInputEl = RefObject<HTMLInputElement[]>;

export const CustomRadio: React.FC<CustomRadioProps> = ({
  name,
  options,
  backgroundColor,
  ...props
}) => {
  const inputRefs = useRef([]);
  const [tooltipOpen, setTooltipOpen] = useState<number>(-1);

  const toggleTooltip = (value: number) => (event: MouseEvent) => {
    if (event.type === "mouseenter") {
      setTooltipOpen(value);
    } else {
      setTooltipOpen(-1);
    }
  };

  const {
    fieldName,
    registerField,
    defaultValue = "",
    error,
    clearError,
  } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRefs,
      getValue: (refs: RefInputEl) => {
        return refs.current.find((input) => input?.checked)?.value;
      },
      setValue: (refs: RefInputEl, id: string) => {
        const inputRef = refs.current.find((ref) => ref.value === id);
        if (inputRef) inputRef.checked = true;
      },
      clearValue: (refs: RefInputEl) => {
        const inputRef = refs.current.find((ref) => ref.checked === true);
        if (inputRef) inputRef.checked = false;
      },
    });
  }, [fieldName, registerField]);

  return (
    <>
      {options?.map((option, index) => (
        <div key={option.value} className={styles.wrapper}>
          <label
            htmlFor={option.value}
            onMouseEnter={toggleTooltip(index)}
            onMouseLeave={toggleTooltip(index)}
            className={`${styles.container} ${error ? styles.error : ""}`}
            style={{ backgroundColor }}
          >
            <input
              type="radio"
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              id={option.value}
              name={name}
              onFocus={clearError}
              defaultChecked={defaultValue.includes(option.value)}
              value={option.value}
              {...props}
            />

            {option.icon && <span>{option.icon}</span>}
            <span style={{ backgroundColor: option.labelBgColor }}>
              {option.label}
            </span>
          </label>
          <Tooltip
            isActive={index === tooltipOpen}
            message={option.tooltip ?? ""}
          />
        </div>
      ))}
    </>
  );
};
