import { InputComponent } from "@components/FormElements/Input";
import { InputSuggestions } from "@components/InputSuggestions";
import { Loader } from "@components/Loader";
import { useField } from "@unform/core";
import React, {
  InputHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiAlertCircle } from "react-icons/fi";
import { ThemeContext } from "styled-components";
import { Suggestion } from "types";
import { Icomoon } from "../../Icomoon";
import { ErrorTooltip } from "../ErrorTooltip";
import styles from "./styles.module.scss";

type TextAlign =
  | "start"
  | "end"
  | "left"
  | "right"
  | "center"
  | "justify"
  | "match-parent";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  icon?: string;
  prefix?: string;
  sufix?: string;
  extraClass?: string;
  width?: number;
  textAlign?: TextAlign;
  backgroundColor?: string;
  suggestions?: Suggestion[];
  onSuggestionClick?: (index: number) => void;
  isLoading?: boolean;
  mask?: string;
}

export const Input: React.FC<InputProps> = ({
  name,
  icon,
  prefix,
  sufix,
  extraClass,
  width,
  textAlign,
  backgroundColor,
  suggestions,
  onSuggestionClick,
  isLoading,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState<boolean>();

  const themeContext = useContext(ThemeContext);

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

  const onFocus = () => {
    clearError();
    setFocused(true);
  };
  const onBlur = () => setFocused(false);

  const handleSuggestionClick = (index: number) => {
    inputRef.current.value = suggestions[index].fulltext;
    if (onSuggestionClick) onSuggestionClick(index);
  };

  return (
    <div
      className={`
        ${styles.container}
        ${extraClass}
      `}
      style={{ width, backgroundColor }}
    >
      {icon && <Icomoon iconName={icon} className={styles.icon} />}
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <InputComponent
        ref={inputRef}
        defaultValue={defaultValue}
        onFocus={onFocus}
        onBlur={onBlur}
        error={error ? true : false}
        hasPrefix={icon || prefix ? true : false}
        hasSufix={sufix ? true : false}
        style={{ textAlign }}
        {...props}
      />
      {sufix && <span className={styles.sufix}>{sufix}</span>}

      {isLoading && (
        <div className={styles.loader}>
          <Loader color={themeContext.colors.blue200} />
        </div>
      )}

      {suggestions && (
        <InputSuggestions
          isFocused={focused}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {error && (
        <span className={styles.errorContainer}>
          <ErrorTooltip message={error}>
            <FiAlertCircle />
          </ErrorTooltip>
        </span>
      )}
    </div>
  );
};
