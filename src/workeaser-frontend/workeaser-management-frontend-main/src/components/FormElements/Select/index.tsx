import { useOutsideClick } from "hooks/useOutsideClick";
import React, {
  forwardRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { OptionType } from "types/form";
import { Button, Container, Content, OptionItem } from "./styles";

interface SelectElementProps {
  options: OptionType[];
  placeHolder?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  onChange?: (option: OptionType) => void;
}

interface SelectProps extends HTMLDivElement {
  value: string | number;
}

const SelectElement = (
  {
    options = [],
    placeHolder,
    width,
    height,
    backgroundColor,
    disabled,
    className = "",
    isLoading,
    onChange,
  }: SelectElementProps,
  ref: MutableRefObject<SelectProps>
) => {
  const setFirstOption = (): OptionType => {
    if (placeHolder) {
      return { value: null, label: placeHolder };
    }
    if (options.length) {
      return options[0];
    }
    return { value: null, label: "No options" };
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionType>(
    setFirstOption()
  );
  // const [optionsFiltered, setOptionsFiltered] = useState([]);

  const selectRef = useRef<SelectProps>(null);

  useOutsideClick({
    ref: ref ?? selectRef,
    callback: () => setIsOpen(false),
  });

  // useEffect(() => {
  //   // ref.current.value = selectedOption?.value;
  //   setOptionsFiltered(
  //     options.filter(
  //       (option: OptionType) => option.value !== selectedOption.value
  //     )
  //   );
  // }, [options, selectedOption]);

  const toggleSelect = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: OptionType) => () => {
    setIsOpen(false);
    setSelectedOption(option);
    if (onChange) onChange(option);
  };

  return (
    <Container
      ref={ref ?? selectRef}
      tabIndex={0}
      // onFocus={() => setIsOpen(true)}
      // onBlur={() => setIsOpen(false)}
      className={className}
      style={{ width, backgroundColor }}
      // disabled
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
        {options.map((option: OptionType) => (
          <OptionItem key={option.value} onClick={handleOptionClick(option)}>
            <p>{option.label}</p>
          </OptionItem>
        ))}
      </Content>
    </Container>
  );
};

export const SelectComponent = forwardRef<HTMLDivElement, SelectElementProps>(
  SelectElement
);
