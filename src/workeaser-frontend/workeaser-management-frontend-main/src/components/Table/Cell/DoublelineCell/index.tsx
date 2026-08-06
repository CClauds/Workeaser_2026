import React, { CSSProperties } from "react";
import { Title, Subtitle } from "./styles";

interface DoublelineCellProps {
  style?: CSSProperties;
  title: string;
  subtitle?: string;
}

export const DoublelineCell: React.FC<DoublelineCellProps> = ({
  title,
  subtitle,
  style,
}) => {
  return (
    <div style={style ?? {}}>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </div>
  );
};
