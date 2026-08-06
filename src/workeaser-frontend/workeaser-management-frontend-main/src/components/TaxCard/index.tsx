import React from "react";
import { TaxData } from "types/cowork/financial/taxes";
import { TaxTypeEnum } from "types/cowork/financial/taxes/enum";
import { CloseButton, Container, TaxValue } from "./styles";
import Money from "dinero.js";

interface TaxCardProps {
  tax: TaxData;
  onDelete: (id: number) => void;
}

export const TaxCard: React.FC<TaxCardProps> = ({ tax, onDelete }) => {
  return (
    <Container>
      <div>
        <h4>{tax.name}</h4>
        <p>{TaxTypeEnum[tax.type]}</p>
      </div>
      <TaxValue data-testid="tax-value">
        {tax.method === "FIXED"
          ? Money({ amount: tax.value }).toFormat("$0,0.00")
          : `${Money({ amount: tax.value }).toFormat("0.00")}%`}
      </TaxValue>
      <div>
        <CloseButton onClick={() => onDelete(tax.id)}>x</CloseButton>
      </div>
    </Container>
  );
};
