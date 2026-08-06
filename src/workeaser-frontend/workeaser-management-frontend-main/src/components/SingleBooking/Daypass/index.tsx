import { DatetimeComponent } from "@components/DatetimeComponent";
import { InputComponent } from "@components/FormElements/Input";
import React from "react";
import { DayPass as DayPassType } from "types/cowork/relationship";
import { ServiceTypeEnum } from "types/enums";
import { Container, Content } from "./styles";

interface DayPassProps {
  event: DayPassType;
}
export const DayPass: React.FC<DayPassProps> = ({ event }) => {
  const { lead, client, location } = event;
  return (
    <Container>
      <Content>
        <div>
          <InputComponent
            value={
              client
                ? `${client.first_name} ${client.last_name}`
                : `${lead.clientAccount.user.first_name} ${lead.clientAccount.user.last_name}`
            }
            readOnly
          />
        </div>
        <div>
          <InputComponent
            value={client ? client.email : lead.clientAccount.user.email}
            readOnly
          />
        </div>
        <div>
          <InputComponent
            value={
              client
                ? client.personal_phone
                : lead.clientAccount.user.personal_phone ?? "Not informed"
            }
            readOnly
          />
        </div>
        <div>
          <InputComponent
            value={client ? "Not informed" : lead.clientAccount.company_name}
            readOnly
          />
        </div>
        <div>
          <InputComponent value={location.name} readOnly />
        </div>
        <div>
          <InputComponent value={ServiceTypeEnum[event.space]} readOnly />
        </div>
        <DatetimeComponent dateStart={event.date} dateEnd={event.date} />
      </Content>
    </Container>
  );
};
