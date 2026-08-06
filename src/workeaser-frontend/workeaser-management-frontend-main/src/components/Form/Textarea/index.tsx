import { TextAreaComponent } from "@components/FormElements/Textarea";
import { useField } from "@unform/core";
import React, { TextareaHTMLAttributes, useEffect, useRef } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Icomoon } from "../../Icomoon";
import { ErrorTooltip } from "../ErrorTooltip";
import styles from "./styles.module.scss";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name?: string;
  icon?: string;
  width?: number;
  height?: number;
  extraClass?: string;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  name,
  icon,
  width,
  height,
  extraClass,
  className,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: textareaRef,
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
      <div
        className={`
          ${styles.container}
          ${extraClass ? extraClass : ""}
          ${className ? className : ""}
        `}
        style={{ height, width }}
      >
        {icon && <Icomoon iconName={icon} />}
        <TextAreaComponent
          ref={textareaRef}
          // defaultValue={defaultValue}
          onFocus={clearError}
          error={error ? true : false}
          {...props}
        />

        {error && (
          <span className={styles.errorContainer}>
            <ErrorTooltip message={error}>
              <FiAlertCircle />
            </ErrorTooltip>
          </span>
        )}
      </div>
    </>
  );
};
