import React, { InputHTMLAttributes } from "react";

import styles from "./styles.module.scss";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox: React.FC<CheckboxProps> = ({ ...rest }) => {
  return (
    <label className={styles.container}>
      <input type="checkbox" {...rest} />
    </label>
  );
};
