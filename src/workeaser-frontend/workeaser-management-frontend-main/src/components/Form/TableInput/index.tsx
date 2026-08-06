import { TableInputComponent } from "@components/FormElements/TableInput";
import { InputSuggestions } from "@components/InputSuggestions";
import { useField } from "@unform/core";
import React, { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";

interface Suggestion {
  id: string;
  fulltext: string;
}

interface TableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  className?: string;
  width?: number;
  suggestions?: Suggestion[];
  onSuggestionClick?: (index: number) => void;
  isLoading?: boolean;
}

export const TableInput: React.FC<TableInputProps> = ({
  name,
  className,
  width,
  suggestions,
  onSuggestionClick,
  isLoading,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [focused, setFocused] = useState(false);

  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

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

  const handleSuggestionClick = (index: number) => {
    inputRef.current.value = suggestions[index].fulltext;
    if (onSuggestionClick) onSuggestionClick(index);
  };

  const onFocus = () => {
    clearError();
    setFocused(true);
  };

  return (
    <div
      className={`
        ${styles.container}
        ${className ? className : ""}
        ${error ? styles.error : ""}
      `}
      style={{ width }}
    >
      <TableInputComponent
        ref={inputRef}
        defaultValue={defaultValue}
        onFocus={onFocus}
        onBlur={() => setFocused(false)}
        {...props}
      />

      {suggestions && (
        <InputSuggestions
          isFocused={focused}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};
