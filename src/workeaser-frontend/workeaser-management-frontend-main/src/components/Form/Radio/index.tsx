import React, {
  useEffect,
  useRef,
  InputHTMLAttributes,
  RefObject,
} from "react";

import { useField } from "@unform/core";

import styles from "./styles.module.scss";

import { Option } from "types/form";
interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  options: Option[];
}

type RefInputEl = RefObject<HTMLInputElement[]>;

export const Radio: React.FC<RadioProps> = ({ name, options, ...props }) => {
  const inputRefs = useRef([]);

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
        refs.current.forEach((ref) => {
          if (ref.value === id) {
            ref.checked = true;
            return;
          }
          ref.checked = false;
        });
        // const inputRef = refs.current.find((ref) => ref.value === id);
        // if (inputRef) inputRef.checked = true;
      },
      clearValue: (refs: RefInputEl) => {
        const inputRef = refs.current.find((ref) => ref.checked === true);
        if (inputRef) inputRef.checked = false;
      },
    });
  }, [fieldName, registerField]);

  return (
    <div
      className={`
        ${styles.container} 
        ${props.disabled ? styles.disabled : ""}
        ${error ? styles.error : ""}
      `}
    >
      {options.map((option, index) => (
        <span
          key={option.value}
          className={`${styles.radioLabel} ${error ? styles.error : ""}`}
        >
          <input
            id={option.value}
            type="radio"
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            name={name}
            onFocus={clearError}
            defaultChecked={defaultValue.includes(option.value)}
            value={option.value}
            {...props}
          />

          <label htmlFor={option.value} key={option.value}>
            {option.label}
          </label>
        </span>
      ))}

      {/* {error && <span>{error}</span>} */}
    </div>
  );
};
