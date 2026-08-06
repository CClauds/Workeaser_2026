import { CheckboxIcon } from "@components/FormElements/CheckboxIcon";
import {
  DateRangePicker,
  RangeValue,
} from "@components/FormElements/DateRangePicker";
import { InputComponent } from "@components/FormElements/Input";
import { Icomoon } from "@components/Icomoon";
import { useDebounce } from "@hooks/useDebounce";
import { ClientFilters } from "pages/relationship/client-management";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTheme } from "styled-components";
import { ServicesSlugEnum } from "types/enums";
import { Grid, InputContainer, SectionContainer } from "./styles";

interface ClientFiltersProps {
  filters: ClientFilters;
  setFilters: Dispatch<SetStateAction<ClientFilters>>;
}
export const ClientFiltersComponent: React.FC<ClientFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const deboucedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setFilters({ ...filters, searchTerm: deboucedSearch });
  }, [deboucedSearch]);

  const handleDateChange = (values: RangeValue) => {
    if (!values) {
      setFilters({ ...filters, dueDateFrom: "", dueDateTo: "" });
      return null;
    }
    const dateFrom = values[0].format("YYYY-MM-DD");
    const dateTo = values[1].format("YYYY-MM-DD");
    setFilters({ ...filters, dueDateFrom: dateFrom, dueDateTo: dateTo });
  };

  return (
    <>
      <SectionContainer>
        <InputContainer>
          <Icomoon
            iconName="search"
            fontSize={18}
            color={theme.colors.blue800}
          />
          <InputComponent
            placeholder="Search for Name, Company. Email or Phone..."
            width="100%"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputContainer>
      </SectionContainer>
      <SectionContainer>
        <div className="row">
          <p>Next Due Date:</p>

          <DateRangePicker onChange={handleDateChange} />
        </div>
      </SectionContainer>
      <SectionContainer>
        <h4>Contracted Services:</h4>

        <Grid>
          {Object.keys(ServicesSlugEnum).map((service) => (
            <CheckboxIcon
              key={service}
              value={service}
              label={ServicesSlugEnum[service]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  [service]: e.currentTarget.checked ? 1 : 0,
                })
              }
            />
          ))}
        </Grid>
      </SectionContainer>
      <SectionContainer>
        <h4>Balance Status:</h4>

        <Grid>
          {BALANCE_STATUS.map((status) => (
            <CheckboxIcon
              key={status.slug}
              value={status.slug}
              label={status.name}
              badgeColor={status.badgeColor}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  [status.slug]: e.currentTarget.checked ? 1 : 0,
                })
              }
            />
          ))}
        </Grid>
      </SectionContainer>
    </>
  );
};

const BALANCE_STATUS: { name: string; slug: string; badgeColor: string }[] = [
  {
    name: "Open Invoice",
    slug: "balanceOpen",
    badgeColor: "yellow",
  },
  {
    name: "Partially Paid",
    slug: "balancePartiallyPaid",
    badgeColor: "gray",
  },
  {
    name: "Fully Paid",
    slug: "balanceFullyPaid",
    badgeColor: "green",
  },
  {
    name: "Overdue",
    slug: "balanceOverdue",
    badgeColor: "red",
  },
];
