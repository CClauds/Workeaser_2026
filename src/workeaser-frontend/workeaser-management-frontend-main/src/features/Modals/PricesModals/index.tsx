import { CloseModalButton } from "@components/Button/CloseModalButton";
import { SugestionOption } from "@components/FormBlocks/ServiceTableFormBlock";
import Money from "dinero.js";
import React from "react";
import Modal from "react-modal";
import { TermSizeEnum } from "types/enums";
import { Content, PriceButton, PricingContent } from "./styles";

interface PricesModalsProps {
  isOpen: boolean;
  onRequestClose: () => void;
  option: SugestionOption;
  onPriceClick: (index: number, value: number) => void;
}

export const PricesModals: React.FC<PricesModalsProps> = ({
  isOpen,
  onRequestClose,
  option,
  onPriceClick,
}) => {
  const prices = option?.price as {
    monthly_price: number;
    full_price: number;
    duration: string;
  }[];

  const handlePriceClick = (index: number, value: number) => {
    onPriceClick(index, value);
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
        <h1>Select Service Price</h1>
      </header>

      <Content>
        <h3>
          Select a pre-configured price to the <strong>{option?.name}</strong>{" "}
          or just close this window to add a custom pricing for it.
        </h3>

        <PricingContent>
          <div>
            <p>Contract Term Sizes</p>
            <div>
              <p>Monthly Price</p>
              <p>Full Price</p>
            </div>
          </div>

          {prices?.map((pricing) => (
            <div key={pricing.duration} className="pricing__card">
              <p>{TermSizeEnum[pricing.duration]}</p>
              <div>
                <PriceButton
                  isActive={!!pricing.monthly_price}
                  onClick={() =>
                    handlePriceClick(option.index, pricing.monthly_price)
                  }
                >
                  {pricing.monthly_price === 0
                    ? "Not offered"
                    : Money({
                        amount: pricing.monthly_price,
                      }).toFormat("$0,0.00")}
                </PriceButton>
                <PriceButton
                  isActive={!!pricing.full_price}
                  onClick={() =>
                    handlePriceClick(option.index, pricing.full_price)
                  }
                >
                  {pricing.full_price === 0
                    ? "Not offered"
                    : Money({
                        amount: pricing.full_price,
                      }).toFormat("$0,0.00")}
                </PriceButton>
              </div>
            </div>
          ))}
        </PricingContent>
      </Content>
    </Modal>
  );
};
