import { NumberInput } from "@components/FormElements/NumberInput";
import { Icomoon } from "@components/Icomoon";
import { PrFilterActionType, SpacesContext } from "@contexts/SpacesContext";
import React, { useContext } from "react";
import { SectionContainer } from "./styles";

export const PrivateRoomFilters: React.FC = () => {
  const { prFilterState, prFilterDispatch } = useContext(SpacesContext);

  const handleValueChange = (value: number) => {
    prFilterDispatch({
      type: PrFilterActionType.CHANGE_SIZE,
      payload: value,
    });
  };

  return (
    <SectionContainer>
      <div>
        <p>Group Size:</p>

        <NumberInput
          initialValue={prFilterState.size}
          onChange={handleValueChange}
          icon={<Icomoon iconName="relationship" fontSize={22} />}
        />
      </div>
    </SectionContainer>
  );
};
