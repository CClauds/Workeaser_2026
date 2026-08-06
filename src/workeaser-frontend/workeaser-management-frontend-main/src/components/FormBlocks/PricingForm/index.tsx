import { HiddenInput } from "@components/Form/HiddenInput";
import { Input } from "@components/Form/Input";
import { Help } from "@components/Icons";
import { CustomTooltip } from "@components/Tooltip/Custom";
import Money from "dinero.js";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTheme } from "styled-components";
import { Price } from "types/cowork";
import { TermSize } from "types/infos";
import { Container, Header, HelpIconContainer, TermItem } from "./styles";

interface PricingFormProps {
  terms: TermSize[];
  initialData?: Price[];
  error?: boolean;
  clearError?: () => void;
}

export const PricingForm: React.FC<PricingFormProps> = ({
  terms,
  initialData,
  error,
  clearError,
}) => {
  const theme = useTheme();

  const [termsValues, setTermsValues] = useState(
    terms.map((item, index) => ({
      visited: index === 0,
      duration: item.slug,
      monthly_price: "0",
      full_price: "0",
    }))
  );
  const [activeTooltip, setActiveTooltip] = useState<string>();

  useEffect(() => {
    if (initialData?.length > 0) {
      const newTermsValue = [...termsValues];
      initialData.forEach((data) => {
        const priceIndex = newTermsValue.findIndex(
          (tab) => tab.duration === data.duration
        );
        if (priceIndex >= 0) {
          newTermsValue[priceIndex].visited = true;
          newTermsValue[priceIndex].monthly_price = data.monthly_price ?? "0";
          newTermsValue[priceIndex].full_price = data.full_price ?? "0";
        }
      });
      setTermsValues(newTermsValue);
    }
  }, [initialData]);

  const handlePriceChange =
    (field: string, currentIndex: number) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const number = value.replace(/\$|,|\./g, "");

      if (!number) {
        setTermsValues(
          termsValues.map((tab, index) =>
            index === currentIndex
              ? {
                  ...tab,
                  [field]: "0",
                }
              : tab
          )
        );
        return;
      }

      setTermsValues(
        termsValues.map((tab, index) =>
          index === currentIndex
            ? {
                ...tab,
                [field]: number,
              }
            : tab
        )
      );
    };

  const toggleTooltip = (value: string) => () => setActiveTooltip(value);

  return (
    <Container error={error}>
      <Header>
        <div>
          <HelpIconContainer
            onMouseEnter={toggleTooltip("TERM_SIZE")}
            onMouseLeave={toggleTooltip(null)}
          >
            <Help size={18} color={theme.colors.blue200} />
            <CustomTooltip
              isActive={activeTooltip === "TERM_SIZE"}
              message={
                "The contract length that the client will be able to hire this service."
              }
            />
          </HelpIconContainer>
          <p>Contract Term Size</p>
        </div>

        <div>
          <div className="row__container">
            <HelpIconContainer
              onMouseEnter={toggleTooltip("MONTHLY")}
              onMouseLeave={toggleTooltip(null)}
            >
              <Help size={18} color={theme.colors.blue200} />
              <CustomTooltip
                isActive={activeTooltip === "MONTHLY"}
                message={
                  "The amount that the client will be paying if chooses to pay it in monthly."
                }
              />
            </HelpIconContainer>
            <p>Monthly</p>
          </div>
          <div className="row__container">
            <HelpIconContainer
              onMouseEnter={toggleTooltip("FULL")}
              onMouseLeave={toggleTooltip(null)}
            >
              <Help size={18} color={theme.colors.blue200} />
              <CustomTooltip
                isActive={activeTooltip === "FULL"}
                message={
                  "The amount that the client will be paying if chooses to pay it in full."
                }
              />
            </HelpIconContainer>
            <p>in Full</p>
          </div>
        </div>
      </Header>
      {terms.map((term, index) => (
        <TermItem key={term.slug}>
          <HiddenInput name={`prices[${index}].duration`} value={term.slug} />

          <span>{term.name}</span>

          <div>
            <Input
              name={`prices[${index}].monthly_price`}
              placeholder="$0,000.00"
              value={
                parseInt(termsValues[index]?.monthly_price)
                  ? Money({
                      amount: parseInt(termsValues[index]?.monthly_price),
                    }).toFormat("$0,0.00")
                  : ""
              }
              width={90}
              backgroundColor="#ffffff"
              onFocus={clearError}
              onChange={handlePriceChange("monthly_price", index)}
            />
            <Input
              name={`prices[${index}].full_price`}
              placeholder="$0,000.00"
              value={
                parseInt(termsValues[index]?.full_price)
                  ? Money({
                      amount: parseInt(termsValues[index]?.full_price),
                    }).toFormat("$0,0.00")
                  : ""
              }
              width={90}
              backgroundColor="#ffffff"
              onFocus={clearError}
              onChange={handlePriceChange("full_price", index)}
            />
          </div>
        </TermItem>
      ))}
      {/* <Navigation>
        {navigation?.map((item, index) => (
          <NavigationButton
            type="button"
            key={`${item.value}-${index}`}
            isActive={index === activeTab}
            notVisited={!visitatedTabs[index].visited}
            disabled={item.value < miniumValue}
            onClick={() => setActiveTab(index)}
          >
            <HiddenInput
              name={`prices[${index}].duration`}
              value={item.value}
            />

            <Circle
              isActive={index === activeTab}
              notVisited={!visitatedTabs[index].visited}
              hasValue={parseInt(visitatedTabs[index]?.monthly_price) > 0}
            >
              {!visitatedTabs[index].visited ? null : parseInt(
                  visitatedTabs[index]?.monthly_price
                ) > 0 ? (
                <span>
                  <svg width="5.714" height="4.359" viewBox="0 0 5.714 4.359">
                    <path
                      d="M12.455,6.964a.381.381,0,0,1,.01.539L8.89,11.217,6.963,9.207a.381.381,0,1,1,.55-.527l1.378,1.437,3.025-3.143A.381.381,0,0,1,12.455,6.964Z"
                      transform="translate(-6.857 -6.857)"
                      fill="#2dc9a5"
                      fillRule="evenodd"
                    />
                  </svg>
                </span>
              ) : index !== activeTab ? (
                <span>x</span>
              ) : null}
            </Circle>
            {item.label}
          </NavigationButton>
        ))}
      </Navigation>

      <ContentWrapper>
        {navigation?.map((item, index) => (
          <Content key={item.value} index={activeTab}>
            <h3>{capitalizeFirstLetter(item.label)} Contract Pricing</h3>

            <div>
              <h4>
                When the customer chooses to pay{" "}
                <strong>Month by Month:</strong>
              </h4>

              <InputContainer>
                <p>Month by Month Pricing:</p>
                <Input
                  name={`prices[${index}].monthly_price`}
                  value={Money({
                    amount: parseInt(visitatedTabs[index]?.monthly_price) ?? 0,
                  }).toFormat("$0,0.00")}
                  width={90}
                  placeholder="0,000.00"
                  backgroundColor="#ffffff"
                  onFocus={clearError}
                  onChange={handlePriceChange("monthly_price")}
                />
              </InputContainer>
            </div>

            <div>
              <h4>
                When the customer chooses to pay <strong>in Full:</strong>
              </h4>

              <InputContainer>
                <p>In Full Pricing:</p>
                <Input
                  name={`prices[${index}].full_price`}
                  value={Money({
                    amount: parseInt(visitatedTabs[index]?.full_price) ?? 0,
                  }).toFormat("$0,0.00")}
                  width={90}
                  placeholder="0,000.00"
                  backgroundColor="#ffffff"
                  onFocus={clearError}
                  onChange={handlePriceChange("full_price")}
                />
              </InputContainer>
            </div>
          </Content>
        ))}
      </ContentWrapper> */}
    </Container>
  );
};
