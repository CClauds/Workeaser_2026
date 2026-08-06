import { DatetimeComponent } from "@components/DatetimeComponent";
import { InputComponent } from "@components/FormElements/Input";
import React from "react";
import { Tour as TourType } from "types/cowork/relationship";
import { Container, Content } from "./styles";

interface TourProps {
  event: TourType;
}
export const Tour: React.FC<TourProps> = ({ event }) => {
  const { lead, location } = event;
  return (
    <Container>
      <Content>
        <div>
          <InputComponent
            value={`${lead.clientAccount.user.first_name} ${lead.clientAccount.user.last_name}`}
            readOnly
          />
        </div>
        <div>
          <InputComponent value={lead.clientAccount.user.email} readOnly />
        </div>
        <div>
          <InputComponent
            value={lead.clientAccount.user.personal_phone ?? "Not informed"}
            readOnly
          />
        </div>
        <div>
          <InputComponent value={lead.clientAccount.company_name} readOnly />
        </div>
        <div>
          <InputComponent value={location.name} readOnly />
        </div>
        <DatetimeComponent
          dateStart={event.date_start}
          dateEnd={event.date_end}
        />
      </Content>
    </Container>
  );
};
