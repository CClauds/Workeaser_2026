import React, { SyntheticEvent, CSSProperties } from "react";
import styles from "./styles.module.scss";

interface IcomoonProps {
  iconName: string;
  color?: string;
  size?: number;
  fontSize?: number;
  flip?: boolean;
  className?: string;
  onClick?: (e: SyntheticEvent) => void;
}

export const Icomoon: React.FC<IcomoonProps> = ({
  iconName,
  color,
  size,
  fontSize,
  flip,
  className,
  onClick,
}) => {
  return (
    <span
      className={`${styles.container} 
        ${styles[iconName]}
        ${flip ? styles.flip : ""}
        ${fontSize ? styles.fontSize : ""}
        ${onClick ? styles.clickable : ""}
        ${className ? className : ""}
      `}
      onClick={onClick}
      style={
        {
          color,
          "--size-var": `${size}px`,
          fontSize,
          height: size,
          width: size,
        } as CSSProperties
      }
    />
  );
};
