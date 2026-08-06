import React, { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { useField } from "@unform/core";

import { Icomoon } from "../../Icomoon";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiAlertCircle } from "react-icons/fi";

import { ErrorTooltip } from "../ErrorTooltip";

import styles from "./styles.module.scss";

interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  icon: string;
  type: string;
  label: string;
}

export const LoginInput: React.FC<LoginInputProps> = ({
  name,
  icon,
  type,
  label,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputType, setInputType] = useState(() =>
    type === "password" ? "password" : type
  );
  const { fieldName, defaultValue, registerField, error, clearError } =
    useField(name);

  const togglePassVisibility = () => {
    if (inputType === "password") setInputType("text");
    else setInputType("password");
  };

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: (ref) => {
        return ref.current.value;
      },
      setValue: (ref, value) => {
        ref.current.value = value;
      },
      clearValue: (ref) => {
        ref.current.value = "";
      },
    });
  }, [fieldName, registerField]);

  return (
    <>
      <label htmlFor={label}>{label}</label>
      <div className={styles.container}>
        <Icomoon iconName={icon} />
        <input
          id={label}
          ref={inputRef}
          type={type === "password" ? inputType : type}
          defaultValue={defaultValue}
          onFocus={clearError}
          className={`
            ${icon && styles.inputIcon}
            ${error && styles.error}
          `}
          {...rest}
        />
        {type !== "password" ? null : inputType === "password" ? (
          <AiOutlineEye
            className={styles.showPass}
            onClick={togglePassVisibility}
          />
        ) : (
          <AiOutlineEyeInvisible
            className={styles.showPass}
            onClick={togglePassVisibility}
          />
        )}
        {error && (
          <span
            className={styles.errorContainer}
            style={{ marginRight: type === "password" ? "25px" : "" }}
          >
            <ErrorTooltip message={error}>
              <FiAlertCircle />
            </ErrorTooltip>
          </span>
        )}
      </div>
    </>
  );
};
