import { useDebounce } from "@hooks/useDebounce";
import { leadingZero } from "@utils/helpers";
import React, { ReactNode, useEffect, useState } from "react";
import { Container, ButtonsContainer } from "./styles";

interface NumberInputProps {
  initialValue?: number;
  onChange: (value: number) => void;
  icon?: ReactNode;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  initialValue = 0,
  onChange,
  icon,
}) => {
  const [count, setCount] = useState(initialValue);

  const debouncedValue = useDebounce(String(count), 300);

  useEffect(() => {
    if (debouncedValue && initialValue !== Number(debouncedValue)) {
      onChange(Number(debouncedValue));
    }
  }, [debouncedValue]);

  const handleIncrease = () => {
    setCount(count + 1);
  };
  const handleDecrease = () => {
    setCount(count - 1);
  };

  return (
    <Container>
      {icon && icon}

      <span>{leadingZero(count, 2)}</span>

      <ButtonsContainer>
        <button onClick={handleIncrease}>+</button>
        <button onClick={handleDecrease} disabled={count === 0}>
          -
        </button>
      </ButtonsContainer>
    </Container>
  );
};
