import { useField } from "@unform/core";
import { useOutsideClick } from "hooks/useOutsideClick";
import React, { useEffect, useRef, useState } from "react";
import { OptionType } from "types/form";
import { Button, Container, Content, OptionItem } from "./styles";

interface CustomSelectProps {
  name?: string;
  options: OptionType[];
  value?: string | number;
  label?: string;
  bgColor?: string;
  width?: number;
  className?: string;
  loading?: boolean;
  onChange?: (option: OptionType) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  options,
  value,
  label,
  width,
  bgColor,
  loading,
  className = "",
  onChange,
}) => {
  const selectRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState(
    label ? { value: null, label } : options[0]
  );
  const [optionsFiltered, setOptionsFiltered] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useOutsideClick({
    ref: selectRef,
    callback: () => setIsOpen(false),
  });

  // useEffect(() => {
  //   if (value) {
  //     setSelectedOption(options.find((option) => option.value === value));
  //   }
  // }, [value]);

  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef.current,
      getValue: (ref) => {
        return ref.value;
      },
      setValue: (_, value: string) => {
        if (value)
          setSelectedOption(options.find((option) => option.value === value));
      },
      clearValue: (_) => {
        setSelectedOption(label ? { value: null, label } : options[0]);
      },
    });
  }, [fieldName, registerField, options]);

  useEffect(() => {
    selectRef.current.value = selectedOption?.value;
    setOptionsFiltered(
      options.filter((option) => option.value !== selectedOption.value)
    );
  }, [options, selectedOption]);

  const toggleSelect = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: OptionType) => () => {
    setIsOpen(false);
    setSelectedOption(option);
    if (onChange) onChange(option);
  };

  return (
    <Container
      ref={selectRef}
      tabIndex={0}
      // onFocus={() => setIsOpen(true)}
      // onBlur={() => setIsOpen(false)}
      style={{ width, backgroundColor: bgColor }}
      className={className}
      isLoading={loading}
    >
      <Button open={isOpen} onClick={toggleSelect}>
        <p>{selectedOption?.label}</p>

        <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
          <path
            d="M3 5L6 8L9 5"
            stroke="#252728"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>
      </Button>

      <Content open={isOpen}>
        {optionsFiltered.map((option) => (
          <OptionItem key={option.value} onClick={handleOptionClick(option)}>
            <p>{option.label}</p>
          </OptionItem>
        ))}
      </Content>
    </Container>
  );
};
