import { NavigationButton } from "@components/Button/NavigationButton";
import { NavigationButtonContainer } from "@components/Headers/SpacesHeader/styles";
import { SpacesContext, VoFilterActionType } from "@contexts/SpacesContext";
import React, { useContext } from "react";
import { SectionContainer } from "./styles";

export const VirtualOfficeFilters: React.FC = () => {
  const { voFilterState, voFilterDispatch } = useContext(SpacesContext);

  const handleValueChange = (key: string, value: "yes" | "no") => {
    const valueFormatted = value.toLowerCase();
    const stateValue = valueFormatted === "yes" ? 1 : 0;

    if (stateValue === voFilterState[key]) {
      voFilterDispatch({
        type: VoFilterActionType.CHANGE_KEY_VALUE,
        payload: { key, value: null },
      });
      return;
    }

    voFilterDispatch({
      type: VoFilterActionType.CHANGE_KEY_VALUE,
      payload: { key, value: valueFormatted },
    });
  };

  return (
    <SectionContainer>
      <div>
        <p>
          Do you need to be listed on their <strong>Directory?</strong>
        </p>

        <NavigationButtonContainer>
          <NavigationButton
            buttonTexts={["Yes", "No"]}
            activeButton={formatTabValue(voFilterState.directory)}
            callback={(tab: "yes" | "no") => () =>
              handleValueChange("directory", tab)}
          />
        </NavigationButtonContainer>
      </div>
      <div>
        <p>
          Looking for <strong>Mailing Handling?</strong>
        </p>

        <NavigationButtonContainer>
          <NavigationButton
            buttonTexts={["Yes", "No"]}
            activeButton={formatTabValue(voFilterState.mailingHandling)}
            callback={(tab: "yes" | "no") => () =>
              handleValueChange("mailingHandling", tab)}
          />
        </NavigationButtonContainer>
      </div>
      <div>
        <p>
          Looking for a <strong>Phone Answering?</strong>
        </p>

        <NavigationButtonContainer>
          <NavigationButton
            buttonTexts={["Yes", "No"]}
            activeButton={formatTabValue(voFilterState.phoneAnswering)}
            callback={(tab: "yes" | "no") => () =>
              handleValueChange("phoneAnswering", tab)}
          />
        </NavigationButtonContainer>
      </div>
      <div>
        <p>
          Do you need <strong>VoIP Service?</strong>
        </p>

        <NavigationButtonContainer>
          <NavigationButton
            buttonTexts={["Yes", "No"]}
            activeButton={formatTabValue(voFilterState.voipService)}
            callback={(tab: "yes" | "no") => () =>
              handleValueChange("voipService", tab)}
          />
        </NavigationButtonContainer>
      </div>
    </SectionContainer>
  );
};

const formatTabValue = (value: number) =>
  value === null ? null : value === 1 ? "Yes" : "No";
