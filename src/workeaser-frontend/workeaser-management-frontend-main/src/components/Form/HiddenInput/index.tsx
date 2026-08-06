import React, { useRef, useEffect, InputHTMLAttributes } from "react";

import { useField } from "@unform/core";

interface HiddenInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export const HiddenInput: React.FC<HiddenInputProps> = ({ name, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, registerField, defaultValue, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      getValue: (ref) => {
        return ref.value;
      },
      setValue: (ref, value) => {
        ref.value = value;
      },
      clearValue: (ref) => {
        ref.value = "";
      },
    });
  }, [fieldName, registerField]);

  return (
    <input
      ref={inputRef}
      defaultValue={defaultValue}
      type="hidden"
      {...props}
    />
  );
};
