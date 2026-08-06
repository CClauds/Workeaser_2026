import { NavigationButton } from "@components/Button/NavigationButton";
import { CheckboxIcon } from "@components/FormElements/CheckboxIcon";
import { DatePickerAntd } from "@components/FormElements/DatePicker";
import { NumberInput } from "@components/FormElements/NumberInput";
import { NavigationButtonContainer } from "@components/Headers/SpacesHeader/styles";
import { Icomoon } from "@components/Icomoon";
import {
  MeetingRoomCategories,
  MrFilterActionType,
  SpacesContext,
} from "@contexts/SpacesContext";
import React, { useContext } from "react";
import {
  CategoriesContainer,
  DatePickerContainer,
  SectionContainer,
} from "./styles";

export const MeetingRoomFilters: React.FC = () => {
  const { mrFilterState, mrFilterDispatch } = useContext(SpacesContext);

  const handleGroupSizeChange = (value: number) => {
    mrFilterDispatch({
      type: MrFilterActionType.CHANGE_GROUP_SIZE,
      payload: value,
    });
  };

  const handleValueChange = (key: string, value: "yes" | "no") => {
    const valueFormatted = value.toLowerCase();
    const stateValue = valueFormatted === "yes" ? 1 : 0;

    if (stateValue === mrFilterState[key]) {
      mrFilterDispatch({
        type: MrFilterActionType.CHANGE_KEY_VALUE,
        payload: { key, value: null },
      });
      return;
    }

    mrFilterDispatch({
      type: MrFilterActionType.CHANGE_KEY_VALUE,
      payload: { key, value: valueFormatted },
    });
  };

  const handleDateChange = (date: string) => {
    mrFilterDispatch({
      type: MrFilterActionType.CHANGE_DATE,
      payload: date,
    });
  };

  return (
    <>
      <SectionContainer>
        <div className="row">
          <p>Date Range:</p>

          <DatePickerContainer>
            {/* <CalendarIcon /> */}
            <label htmlFor="From">From:</label>
            <DatePickerAntd id="From" onDateChange={handleDateChange} />
          </DatePickerContainer>
        </div>
      </SectionContainer>
      <SectionContainer>
        <div className="row">
          <p>Expected Group Size:</p>

          <NumberInput
            initialValue={mrFilterState.groupSize}
            onChange={handleGroupSizeChange}
            icon={<Icomoon iconName="relationship" fontSize={22} />}
          />
        </div>
      </SectionContainer>
      <SectionContainer>
        <h4>Room Category</h4>

        <CategoriesContainer>
          {MEETING_ROOM_CATEGORIES?.map((category) => (
            <CheckboxIcon
              key={category.slug}
              value={category.slug}
              label={category.name}
              checked={mrFilterState.categories.indexOf(category.slug) >= 0}
              onChange={(e) =>
                mrFilterDispatch({
                  type: MrFilterActionType.CHANGE_CATEGORIES,
                  payload: {
                    checked: e.currentTarget.checked,
                    value: e.currentTarget.value,
                  },
                })
              }
            />
          ))}
        </CategoriesContainer>
      </SectionContainer>
      <SectionContainer>
        <div className="row">
          <p>
            Do you need <strong>Office Supplies?</strong>
          </p>

          <NavigationButtonContainer>
            <NavigationButton
              buttonTexts={["Yes", "No"]}
              activeButton={formatTabValue(mrFilterState.officeSupplies)}
              callback={(tab: "yes" | "no") => () =>
                handleValueChange("officeSupplies", tab)}
            />
          </NavigationButtonContainer>
        </div>
        <div className="row">
          <p>
            Do you need <strong>Multimedia Connectors &amp; Adapters?</strong>
          </p>

          <NavigationButtonContainer>
            <NavigationButton
              buttonTexts={["Yes", "No"]}
              activeButton={formatTabValue(mrFilterState.multimedia)}
              callback={(tab: "yes" | "no") => () =>
                handleValueChange("multimedia", tab)}
            />
          </NavigationButtonContainer>
        </div>
        <div className="row">
          <p>
            Do you need an <strong>ADA Compliant Room?</strong>
          </p>

          <NavigationButtonContainer>
            <NavigationButton
              buttonTexts={["Yes", "No"]}
              activeButton={formatTabValue(mrFilterState.adaCompliant)}
              callback={(tab: "yes" | "no") => () =>
                handleValueChange("adaCompliant", tab)}
            />
          </NavigationButtonContainer>
        </div>
        <div className="row">
          <p>
            Do you need a <strong>Presentation Projector?</strong>
          </p>

          <NavigationButtonContainer>
            <NavigationButton
              buttonTexts={["Yes", "No"]}
              activeButton={formatTabValue(mrFilterState.projector)}
              callback={(tab: "yes" | "no") => () =>
                handleValueChange("projector", tab)}
            />
          </NavigationButtonContainer>
        </div>
        <div className="row">
          <p>
            Do you need a <strong>Whiteboard?</strong>
          </p>

          <NavigationButtonContainer>
            <NavigationButton
              buttonTexts={["Yes", "No"]}
              activeButton={formatTabValue(mrFilterState.whiteboard)}
              callback={(tab: "yes" | "no") => () =>
                handleValueChange("whiteboard", tab)}
            />
          </NavigationButtonContainer>
        </div>
        <div className="row">
          <p>
            Do you need to <strong>Eat in the Room?</strong>
          </p>

          <NavigationButtonContainer>
            <NavigationButton
              buttonTexts={["Yes", "No"]}
              activeButton={formatTabValue(mrFilterState.eat)}
              callback={(tab: "yes" | "no") => () =>
                handleValueChange("eat", tab)}
            />
          </NavigationButtonContainer>
        </div>
      </SectionContainer>
    </>
  );
};

const formatTabValue = (value: number) =>
  value === null ? null : value === 1 ? "Yes" : "No";

const MEETING_ROOM_CATEGORIES: { name: string; slug: MeetingRoomCategories }[] =
  [
    {
      name: "Desk",
      slug: "DESK",
    },
    {
      name: "Call",
      slug: "CALL",
    },
    {
      name: "Meeting",
      slug: "MEETING",
    },
    {
      name: "Conference",
      slug: "CONFERENCE",
    },
    {
      name: "Auditorium",
      slug: "AUDITORIUM",
    },
    {
      name: "Private",
      slug: "PRIVATE",
    },
  ];
