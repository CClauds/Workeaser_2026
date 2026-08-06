import { NavigationButton } from "@components/Button/NavigationButton";
import { NavigationButtonContainer } from "@components/Headers/SpacesHeader/styles";
import { OdFilterActionType, SpacesContext } from "@contexts/SpacesContext";
import { capitalizeFirstLetter } from "@utils/helpers";
import React, { useContext } from "react";
import { SectionContainer } from "./styles";

enum DeskType {
  EXCLUSIVE = "Exclusive",
  SHAREABLE = "Shareable",
}

export const OpenDeskFilters: React.FC = () => {
  const { odFilterState, odFilterDispatch } = useContext(SpacesContext);

  const handleValueChange = (value: string) => {
    const formattedValue = value.toUpperCase();
    if (odFilterState.type === formattedValue) {
      odFilterDispatch({
        type: OdFilterActionType.CHANGE_TYPE,
        payload: null,
      });
      return;
    }

    odFilterDispatch({
      type: OdFilterActionType.CHANGE_TYPE,
      payload: formattedValue as "EXCLUSIVE" | "SHAREABLE",
    });
  };

  return (
    <SectionContainer>
      <div>
        <p>Desk Type:</p>

        <NavigationButtonContainer>
          <NavigationButton
            buttonTexts={["Exclusive", "Shareable"]}
            activeButton={capitalizeFirstLetter(odFilterState.type)}
            callback={(tab) => () => handleValueChange(tab)}
          />
        </NavigationButtonContainer>
      </div>
    </SectionContainer>
  );
};
