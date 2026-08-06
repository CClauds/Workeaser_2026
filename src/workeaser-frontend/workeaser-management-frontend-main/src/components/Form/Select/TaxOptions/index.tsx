import React from "react";
import { TaxMethodEnum } from "types/cowork/financial/taxes/enum";
import { Container } from "./styles";

interface TaxOptionsProps {
  taxName: string;
  taxMethod: string;
}

export const TaxOptions: React.FC<TaxOptionsProps> = ({
  taxName,
  taxMethod,
}) => {
  return (
    <Container>
      <h3>{taxName}</h3> - <h4>{TaxMethodEnum[taxMethod]}</h4>
    </Container>
  );
};
