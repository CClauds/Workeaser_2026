import { Button } from "@components/Button";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Select } from "@components/Form/Select";
import { ItemTax } from "@components/FormBlocks/ServiceTableFormBlock";
import { TaxCard } from "@components/TaxCard";
import { useFetch } from "@hooks/useFetch";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { DefaultService } from "types/cowork";
import { TaxData, TaxesResponse } from "types/cowork/financial/taxes";
import { OptionType } from "types/form";
import { ButtonsContainer, CardContainer, Content } from "./styles";

interface SelectedTaxes extends TaxData {
  delete?: boolean;
}

interface TaxModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddTaxes: (taxes: ItemTax[]) => void;
  service?: DefaultService;
}

export const TaxModal: React.FC<TaxModalProps> = ({
  isOpen,
  onRequestClose,
  onAddTaxes,
  service,
}) => {
  const [selectedTaxes, setSelectedTaxes] = useState<SelectedTaxes[]>([]);

  const { data: { result: taxes } = {} } = useFetch<TaxesResponse>(
    "/cowork/finance/taxes"
  );

  useEffect(() => {
    if (service?.taxes) setSelectedTaxes(service.taxes);
  }, [service]);

  const onDeleteTax = (id: number) => {
    setSelectedTaxes(
      selectedTaxes.map((tax) =>
        tax.id === id ? { ...tax, delete: true } : tax
      )
    );
  };

  const handleTaxChange = (option: OptionType) => {
    if (option) {
      const taxExists = selectedTaxes.find((tax) => tax.name === option.label);
      // const taxExists = selectedTaxes.find((tax) => tax.id === option.value);
      if (taxExists) {
        setSelectedTaxes(
          selectedTaxes.map((tax) =>
            tax.id === taxExists.id ? { ...tax, delete: false } : tax
          )
        );
        return;
      }
      const tax = taxes.find((tax) => tax.id === option.value);
      setSelectedTaxes([...selectedTaxes, { ...tax, delete: false }]);
    }
  };

  const handleAddTaxes = () => {
    onAddTaxes(
      selectedTaxes.reduce(
        (acc, tax) =>
          !tax.delete
            ? [
                ...acc,
                {
                  id: tax.id,
                  name: tax.name,
                  value: tax.value,
                  type: tax.type,
                  method: tax.method,
                  recurring_type: tax.recurring_type,
                },
              ]
            : acc,
        []
      )
    );
    setSelectedTaxes([]);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />

      <header>
        <h1>Add Tax &amp; Fee</h1>
      </header>

      <Content>
        <h3>You are adding a Tax or Fee to {service?.name ?? ""}</h3>

        <Select
          instanceId="service_taxes"
          name="taxes"
          onChange={handleTaxChange}
          extraClass="select"
          isLoading={!taxes}
          options={taxes?.map((tax) => ({
            value: tax.id,
            label: tax.name,
            taxName: tax.name,
            taxMethod: tax.method,
          }))}
          formatType="taxes"
        />

        {selectedTaxes.map((tax) => (
          <CardContainer key={tax.id} isDeleted={tax.delete}>
            <TaxCard tax={tax} onDelete={onDeleteTax} />
          </CardContainer>
        ))}

        <ButtonsContainer>
          <Button text="ADD TO SERVICE" onClick={handleAddTaxes} />
        </ButtonsContainer>
      </Content>
    </Modal>
  );
};
