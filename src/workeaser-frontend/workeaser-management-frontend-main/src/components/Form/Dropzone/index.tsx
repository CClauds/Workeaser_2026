import { api } from "@services/api";
import { useField } from "@unform/core";
import Image from "next/legacy/image";
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";

import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type AcceptedFiles = File & {
  id?: number;
  file?: string;
};

interface InputRefProps extends HTMLInputElement {
  acceptedFiles: AcceptedFiles[];
}

interface DropzoneProps {
  name: string;
  label: string;
  disclaimer?: string;
  acceptedTypes?: string;
  isDisabled?: boolean;
}
export const Dropzone: React.FC<DropzoneProps> = ({
  label,
  name,
  disclaimer,
  acceptedTypes,
  isDisabled,
}) => {
  const inputRef = useRef<InputRefProps>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const {
    fieldName,
    registerField,
    defaultValue = [],
    error,
    clearError,
  } = useField(name);

  const [acceptedFiles, setAcceptedFiles] =
    useState<AcceptedFiles[]>(defaultValue);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      getValue: (ref: InputRefProps) => {
        return ref.acceptedFiles || [];
      },
      clearValue: (ref: InputRefProps) => {
        ref.acceptedFiles = [];
        setAcceptedFiles([]);
      },
      setValue: (ref: InputRefProps, value) => {
        ref.acceptedFiles = value;
        setAcceptedFiles(value);
      },
    });
  }, [fieldName, registerField]);

  const nameLengthValidator = (file: AcceptedFiles) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Files must be smaller than 4mb");
      return {
        code: "name-too-large",
        message: `File is larger than 4mb`,
      };
    }

    return null;
  };

  const accept = {
    "image/*": [".png", ".jpeg", ".jpg"],
    ...(acceptedTypes
      ? {
          [acceptedTypes]: [],
        }
      : {}),
  };

  const { getRootProps, fileRejections, getInputProps, isDragActive } =
    useDropzone({
      validator: nameLengthValidator,
      accept,
      onDrop: useCallback(
        async (
          onDropAcceptedFiles: AcceptedFiles[],
          onDropRejectedFiles: FileRejection[]
        ) => {
          if (inputRef.current) {
            onDropAcceptedFiles.forEach((file) => {
              const [_, type] = file.type.split("/");
              if (type === "pdf") {
                pdfPreview(file);
              }
            });
            const newFiles = [...acceptedFiles, ...onDropAcceptedFiles].filter(
              (value, index, self) =>
                value.id
                  ? value
                  : index === self.findIndex((t) => t.name === value.name)
            );
            inputRef.current.acceptedFiles = newFiles;
            setAcceptedFiles(newFiles);
          }
        },
        [acceptedFiles]
      ),
    });

  const handleDeleteFie =
    (index: number) => (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      const newFiles = acceptedFiles.filter((_, i) => i !== index);
      inputRef.current.acceptedFiles = newFiles;
      setAcceptedFiles(newFiles);
    };

  const handleClick = () => {
    clearError();
    inputRef.current?.click();
  };

  const pdfPreview = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = (ev) => {
      pdfjs.getDocument({ data: fileReader.result }).promise.then((pdf) => {
        pdf.getPage(1).then((page) => {
          const desiredWidth = 80;
          const viewport = page.getViewport({ scale: 1 });
          const scale = desiredWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale: scale });

          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");

          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
          };
          const renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            const png_data = canvas.toDataURL("image/png");
            // const newFilesArray = inputRef.current.acceptedFiles.map(
            //   (acceptedFile) => {
            //     if (acceptedFile.name === file.name) {
            //       return { ...acceptedFile, pngData: png_data };
            //     }
            //     return acceptedFile;
            //   }
            // );
            // inputRef.current.acceptedFiles = newFilesArray;
            imgRef.current.src = png_data;
          });
        });
      });
    };
    fileReader.readAsArrayBuffer(file);
  };

  const RenderFooter = () => {
    if (error) {
      return <span className={styles.error}>{error}</span>;
    }
    if (disclaimer) return <span>{disclaimer}</span>;
    return null;
  };

  return (
    <div className={styles.wrapper}>
      <div
        {...getRootProps()}
        onClick={handleClick}
        className={`${styles.container} ${error ? styles.error : ""}`}
      >
        <input
          {...getInputProps()}
          ref={inputRef}
          accept={`image/png,image/jpeg,image/gif,image/jpg,${acceptedTypes}`}
          onFocus={clearError}
        />

        {acceptedFiles.length !== 0 && (
          <ul>
            {acceptedFiles.map((file, index) => (
              <li key={`${index}-${file?.file ? file.file : file.name}`}>
                {file.type?.endsWith("pdf") ? (
                  <>
                    <button onClick={handleDeleteFie(index)}>x</button>
                    <img ref={imgRef} alt="accepted files" />
                  </>
                ) : (
                  <>
                    <button onClick={handleDeleteFie(index)}>x</button>
                    <Image
                      width={80}
                      height={80}
                      src={
                        file?.file
                          ? `${api.defaults.baseURL}/photos/${file.file}`
                          : URL.createObjectURL(file)
                      }
                      alt=""
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {isDragActive ? (
          <label>Drop the files here ...</label>
        ) : (
          acceptedFiles.length === 0 && <label>{label}</label>
        )}
      </div>
      <RenderFooter />

      <canvas ref={canvasRef} />
    </div>
  );
};

const MAX_FILE_SIZE = 4000000;
