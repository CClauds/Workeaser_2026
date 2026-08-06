import { FilterIcon } from "@components/Icons";
import { useOutsideClick } from "hooks/useOutsideClick";
import React, { ReactNode, useRef, useState } from "react";
import { Button, FilterPopUp } from "./styles";

interface FilterButtonProps {
  buttonText?: string;
  children: ReactNode;
  topOffset?: number;
  theme?: "primary" | "secondary";
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  buttonText = "Filters",
  children,
  topOffset,
  theme = "primary",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // useOutsideClick({ ref, callback: () => setIsOpen(false) });

  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <div ref={ref}>
      <Button isOpen={isOpen} onClick={toggleIsOpen} buttonTheme={theme}>
        {buttonText} <FilterIcon color={isOpen ? "#fff" : "#00a2dd"} />
      </Button>

      <FilterPopUp isOpen={isOpen} topOffset={topOffset}>
        {children}
      </FilterPopUp>
    </div>
  );
};
