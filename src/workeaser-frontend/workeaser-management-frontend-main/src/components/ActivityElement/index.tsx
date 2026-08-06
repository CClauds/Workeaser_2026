import { dateMask } from "@utils/masks";
import React, { ReactNode } from "react";
import { Circle, Container, Content } from "./styles";

interface ActivityElementProps {
  title: string;
  text?: string;
  date?: string;
  children?: ReactNode;
  isLastChild?: boolean;
}

export const ActivityElement: React.FC<ActivityElementProps> = ({
  title,
  text,
  date,
  children,
  isLastChild,
}) => {
  return (
    <Container data-testid="activity-element" lastChild={isLastChild}>
      <Circle lastChild={isLastChild} />

      <Content hasBorder={!!text}>
        <h4>{title}</h4>
        {children ? (
          children
        ) : (
          <div>
            <p>
              {text} {date ? <time>{dateMask(date)}</time> : null}
            </p>
          </div>
        )}
      </Content>
    </Container>
  );
};
