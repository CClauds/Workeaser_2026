import React, { InputHTMLAttributes, useRef } from "react";
import { Icomoon } from "../../Icomoon";
import styles from "./styles.module.scss";

interface CheckboxIconProps extends InputHTMLAttributes<HTMLInputElement> {
  value: number | string;
  label: string;
  icon?: string;
  badgeColor?: string;
}

export const CheckboxIcon: React.FC<CheckboxIconProps> = ({
  value,
  label,
  icon,
  badgeColor,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label className={styles.container}>
      {icon && <Icomoon iconName={icon} />}
      <span
        className={`${styles.label} ${badgeColor ? styles[badgeColor] : ""}`}
      >
        {label}
      </span>
      <input ref={inputRef} type="checkbox" value={value} {...props} />
    </label>
  );
};
