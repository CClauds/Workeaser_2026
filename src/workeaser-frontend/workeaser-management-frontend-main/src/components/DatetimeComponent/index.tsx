import { formatDateExtendMonth, formatTime } from "@utils/numberFormat";
import React from "react";
import { Container, TimeContainer } from "./styles";

interface DatetimeComponentProps {
  dateStart: string;
  dateEnd: string;
}

export const DatetimeComponent: React.FC<DatetimeComponentProps> = ({
  dateStart,
  dateEnd,
}) => {
  return (
    <Container>
      <span>{formatDateExtendMonth(dateStart)}</span>
      <div>
        <TimeContainer>
          <p>From:</p>
          <span>{formatTime(dateStart)}</span>
        </TimeContainer>
        <TimeContainer>
          <p>To:</p>
          <span>{formatTime(dateEnd)}</span>
        </TimeContainer>
      </div>
    </Container>
  );
};
