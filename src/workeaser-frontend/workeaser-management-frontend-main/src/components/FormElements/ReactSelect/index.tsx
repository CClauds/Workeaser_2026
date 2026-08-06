import React, { useContext, useRef } from "react";
import ReactSelect, { Props } from "react-select";

import { Icomoon } from "@components/Icomoon";
import { Loader } from "@components/Loader";
import { ThemeContext } from "styled-components";
import { OptionType } from "types";
import styles from "./styles.module.scss";

interface SelectProps extends Props<OptionType> {
  icon?: string;
  width?: number;
  extraClass?: string;
  isLoading?: boolean;
}

export const ReactSelectComponent: React.FC<SelectProps> = ({
  icon,
  width,
  extraClass,
  isLoading,
  ...props
}) => {
  const themeContext = useContext(ThemeContext);
  const selectRef = useRef(null);

  return (
    <div className={styles.wrapper} style={{ width }}>
      {icon && <Icomoon iconName={icon} />}
      <ReactSelect
        ref={selectRef}
        classNamePrefix={styles.selectContainer}
        isClearable={true}
        className={`
          ${styles.selectContainer}
          ${extraClass ? extraClass : ""}
          ${icon ? styles.icon : ""}
        `}
        {...props}
      />

      {isLoading && (
        <div className={styles.loader}>
          <Loader color={themeContext.colors.blue200} />
        </div>
      )}
    </div>
  );
};
