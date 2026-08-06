import React from "react";
import { useTheme } from "styled-components";
import { Card, Container, Content, NumberSpan } from "./styles";

interface MailboxOverviewProps {
  title: string;
  pickingUp: number;
  hold: number;
  forward: number;
  trash: number;
}

export const MailboxOverview: React.FC<MailboxOverviewProps> = ({
  title,
  pickingUp,
  hold,
  forward,
  trash,
}) => {
  const theme = useTheme();

  return (
    <Container>
      <h2>{title}</h2>

      <Content>
        <Card>
          <h3>Picking Up</h3>
          <NumberSpan data-testid="pickingUp" color={theme.colors.chartGreen}>
            {pickingUp}
          </NumberSpan>
        </Card>
        <Card>
          <h3>Hold at Location</h3>
          <NumberSpan
            data-testid="holdAtLocation"
            color={theme.colors.chartRed}
          >
            {hold}
          </NumberSpan>
        </Card>
        <Card>
          <h3>Forward It</h3>
          <NumberSpan data-testid="forwardIt" color={theme.colors.chartYellow}>
            {forward}
          </NumberSpan>
        </Card>
        <Card>
          <h3>Trash It</h3>
          <NumberSpan data-testid="trashIt" color={theme.colors.chartBlue}>
            {trash}
          </NumberSpan>
        </Card>
      </Content>
    </Container>
  );
};
