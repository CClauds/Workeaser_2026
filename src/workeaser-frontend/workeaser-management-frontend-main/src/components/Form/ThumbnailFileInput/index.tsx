import { api } from "@services/api";
import { useField } from "@unform/core";
import Image from "next/legacy/image";
import React, {
  ChangeEvent,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AcceptedFiles } from "types";
import { Figure, Preview } from "./styles";
import styles from "./styles.module.scss";

interface ThumbnailFileInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export const ThumbnailFileInput: React.FC<ThumbnailFileInputProps> = ({
  name,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { fieldName, registerField, defaultValue, error } = useField(name);

  const [acceptedFile, setAcceptedFile] = useState<AcceptedFiles>(defaultValue);

  const handlePreview = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAcceptedFile(file);
  }, []);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: "files[0]",
      clearValue(ref: HTMLInputElement) {
        ref.value = "";
        setAcceptedFile(null);
      },
      setValue(_: HTMLInputElement, value: AcceptedFiles) {
        setAcceptedFile(value);
      },
    });
  }, [fieldName, registerField]);

  return (
    <div className={styles.container}>
      <input
        id={name}
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        multiple={false}
        onChange={handlePreview}
        {...rest}
      />
      <label htmlFor={name}>
        <Figure>
          {acceptedFile ? (
            <Image
              src={
                acceptedFile?.file
                  ? `${api.defaults.baseURL}/photos/${acceptedFile.file}`
                  : URL.createObjectURL(acceptedFile)
              }
              width={80}
              height={80}
              alt="Avatar"
            />
          ) : (
            <Preview size={80}>
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path
                  d="M15.379 10.1678C16.936 11.7248 16.936 14.2492 15.379 15.8063C13.822 17.3633 11.2975 17.3633 9.74052 15.8063C8.1835 14.2492 8.1835 11.7248 9.74052 10.1678C11.2975 8.61078 13.822 8.61078 15.379 10.1678"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M21.5 9V18C21.5 19.105 20.605 20 19.5 20H5.5C4.395 20 3.5 19.105 3.5 18V9C3.5 7.895 4.395 7 5.5 7H7.5L8.962 4.496C9.141 4.189 9.47 4 9.826 4H15.13C15.481 4 15.806 4.184 15.987 4.484L17.5 7H19.5C20.605 7 21.5 7.895 21.5 9Z"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Preview>
          )}
        </Figure>
      </label>
    </div>
  );
};
