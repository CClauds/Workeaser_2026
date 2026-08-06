import { NavigationButton } from "@components/Button/NavigationButton";
import { FilterButton } from "@components/Filters/FilterButton";
import { CheckboxIcon } from "@components/FormElements/CheckboxIcon";
import { InputComponent } from "@components/FormElements/Input";
import { SelectComponent } from "@components/FormElements/Select";
import { SpacesActionType, SpacesContext } from "@contexts/SpacesContext";
import { MeetingRoomFilters } from "@features/Filters/MeetingRoomFilters";
import { OpenDeskFilters } from "@features/Filters/OpenDeskFilters";
import { PrivateRoomFilters } from "@features/Filters/PrivateRoomFilters";
import { VirtualOfficeFilters } from "@features/Filters/VirtualOfficeFilters";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Space } from "types/client";
import { AmenitiesIconsEnum, ServicesSlugEnum } from "types/enums";
import { Amenity } from "types/infos";
import {
  AmenitiesContainer,
  Container,
  FilterContent,
  NavigationButtonContainer,
  SelectContainer,
  SliderContainer,
  StyledSlider,
  StyledThumb,
  StyledTrack,
} from "./styles";
import Money from "dinero.js";

const FilterComponents = {
  VIRTUAL_OFFICE: VirtualOfficeFilters,
  OPEN_DESK: OpenDeskFilters,
  PRIVATE_ROOM: PrivateRoomFilters,
  MEETING_ROOM: MeetingRoomFilters,
  "": null,
};

interface SpaceHeaderProps {
  amenities: Amenity[];
}
export const SpacesHeader: React.FC<SpaceHeaderProps> = ({ amenities }) => {
  const { dispatch, state } = useContext(SpacesContext);

  const [sliderMaxValue, setSliderMaxValue] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerRect = containerRef.current?.getBoundingClientRect();
  let offSet =
    Math.floor(containerRect?.height) + Math.round(containerRect?.top);

  useEffect(() => {
    if (state.pricingRange.end === 0) {
      setSliderMaxValue(getMaxValue(state.result));
    }
  }, [state.result]);

  const handleTabClick = (button: string) => () => {
    const [serviceType] = Object.entries(ServicesSlugEnum).find(
      ([_, service]) => service === button
    );

    dispatch({
      type: SpacesActionType.CHANGE_PRICING_RANGE,
      payload: {
        start: 0,
        end: 0,
      },
    });

    if (serviceType === state.serviceType) {
      dispatch({
        type: SpacesActionType.CHANGE_SERVICE_TYPE,
        payload: "",
      });
      return;
    }

    dispatch({
      type: SpacesActionType.CHANGE_SERVICE_TYPE,
      payload: serviceType,
    });
  };

  const handlePriceChange = (values: number[], index: number) => {
    const [start, end] = values;
    dispatch({
      type: SpacesActionType.CHANGE_PRICING_RANGE,
      payload: {
        start,
        end,
      },
    });
  };

  const RenderFilterContent = FilterComponents[state.serviceType];

  const Thumb = (props, state) => <StyledThumb {...props} />;
  const Track = (props, state) => (
    <StyledTrack {...props} index={state.index} />
  );

  const maxSliderValue = state.pricingRange.end || sliderMaxValue;

  return (
    <Container ref={containerRef}>
      <section>
        <div>
          <label htmlFor="search">Write the Location:</label>
          <InputComponent
            id="search"
            type="search"
            placeholder="City, Space Name or Zip Code"
            className="input"
            value={state.location}
            onChange={(e) =>
              dispatch({
                type: SpacesActionType.CHANGE_LOCATION,
                payload: e.currentTarget.value,
              })
            }
          />
        </div>
        <div>
          <label htmlFor="searchAreaType">
            Search Area &amp; Measurements:
          </label>
          <SelectContainer>
            <InputComponent
              id="searchAreaType"
              className="area__input"
              placeholder="area"
              value={state.searchArea}
              onChange={(e) =>
                dispatch({
                  type: SpacesActionType.CHANGE_AREA,
                  payload: e.currentTarget.value,
                })
              }
            />
            <SelectComponent
              width={145}
              options={SEARCH_AREA_TYPE}
              onChange={(option) =>
                dispatch({
                  type: SpacesActionType.CHANGE_AREA_MEASUREMENT,
                  payload: option.value as string,
                })
              }
            />
          </SelectContainer>
        </div>
        <div>
          <label htmlFor="">Choose the Service Type:</label>
          <NavigationButtonContainer>
            <NavigationButton
              buttonTexts={[
                "Virtual Office",
                "Open Desk",
                "Meeting Room",
                "Private Room",
              ]}
              activeButton={ServicesSlugEnum[state.serviceType]?.replace(
                / /gi,
                ""
              )}
              callback={handleTabClick}
            />
          </NavigationButtonContainer>
        </div>
        <FilterButton buttonText="More Filters" topOffset={offSet}>
          <FilterContent>
            {state.serviceType && (
              <section>
                <h4>Pricing Range:</h4>

                <SliderContainer>
                  <div>
                    <span>
                      {Money({ amount: state.pricingRange.start }).toFormat(
                        "$0,0.00"
                      )}
                    </span>
                    <span>
                      {Money({ amount: maxSliderValue }).toFormat("$0,0.00")}
                    </span>
                  </div>
                  <StyledSlider
                    renderTrack={Track}
                    renderThumb={Thumb}
                    min={0}
                    max={sliderMaxValue}
                    value={[state.pricingRange.start, maxSliderValue]}
                    onAfterChange={handlePriceChange}
                  />
                </SliderContainer>
              </section>
            )}
            {state.serviceType && <RenderFilterContent />}

            <section>
              <h4>Amenities Needed:</h4>

              <AmenitiesContainer>
                {amenities?.map((amenity) => (
                  <CheckboxIcon
                    key={amenity.id}
                    value={amenity.id}
                    label={amenity.name}
                    icon={AmenitiesIconsEnum[amenity.id]}
                    checked={state.amenities.indexOf(amenity.id) >= 0}
                    onChange={(e) =>
                      dispatch({
                        type: SpacesActionType.CHANGE_AMENITIES,
                        payload: {
                          checked: e.currentTarget.checked,
                          id: e.currentTarget.value,
                        },
                      })
                    }
                  />
                ))}
              </AmenitiesContainer>
            </section>
          </FilterContent>
        </FilterButton>
      </section>
      {/* <section></section> */}
    </Container>
  );
};

const SEARCH_AREA_TYPE = [
  {
    value: "MILES",
    label: "Miles",
  },
  {
    value: "KILOMETERS",
    label: "Kilometers",
  },
];

const getMaxValue = (spaces: Space[]) => {
  let maxValue = 0;
  spaces.forEach((space) => {
    if (space.price > maxValue) {
      maxValue = space.price;
    }
  });
  return maxValue;
};
