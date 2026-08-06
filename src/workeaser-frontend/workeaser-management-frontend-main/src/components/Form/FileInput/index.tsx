import React, {
  ChangeEvent,
  useRef,
  useEffect,
  useCallback,
  useState,
  InputHTMLAttributes,
} from "react";
import { useField } from "@unform/core";

import styles from "./styles.module.scss";

interface FileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  name,
  label,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    fieldName,
    registerField,
    defaultValue = label ?? "Select Document",
    error,
    clearError,
  } = useField(name);

  const [preview, setPreview] = useState(defaultValue);

  const handlePreview = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      clearError();
      const file = e.target.files?.[0];
      if (!file) {
        setPreview(null);
        return;
      }
      // const previewURL = URL.createObjectURL(file);
      setPreview(file.name);
    },
    [clearError]
  );

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: "files[0]",
      clearValue(ref: HTMLInputElement) {
        ref.value = "";
        setPreview(null);
      },
      setValue(_: HTMLInputElement, value: string) {
        setPreview(value);
      },
    });
  }, [fieldName, registerField]);

  return (
    <div className={`${styles.container} ${error ? styles.error : ""}`}>
      <span>{preview}</span>
      <label>
        <input
          ref={inputRef}
          type="file"
          onChange={handlePreview}
          onFocus={clearError}
          {...rest}
        />
        SELECT
      </label>
    </div>
  );
};
