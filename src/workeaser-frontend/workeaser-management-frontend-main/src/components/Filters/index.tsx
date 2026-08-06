import { InputComponent } from "@components/FormElements/Input";
import { useOutsideClick } from "hooks/useOutsideClick";
import React, { useRef, useState } from "react";
import { Button, Container, FilterPopUp } from "./styles";

interface FiltersProps {}

export const Filters: React.FC<FiltersProps> = ({}) => {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({ ref, callback: () => setIsOpen(false) });

  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <Container ref={ref}>
      <Button onClick={toggleIsOpen}>Search &amp; Filters</Button>

      <FilterPopUp isOpen={isOpen}>
        <div>
          <InputComponent placeholder="Search" />
        </div>
      </FilterPopUp>
    </Container>
  );
};
