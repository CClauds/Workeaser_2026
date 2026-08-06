import { Icomoon } from "@components/Icomoon";
import { Loader } from "@components/Loader";
import { useField } from "@unform/core";
import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import ReactSelect, { components, Props } from "react-select";
import { ThemeContext } from "styled-components";
import { OptionType } from "types";
import { ErrorTooltip } from "../ErrorTooltip";
import { LocationOptions } from "./LocationOptions";
import { ServiceOptions } from "./ServiceOptions";
import styles from "./styles.module.scss";
import { TaxOptions } from "./TaxOptions";
import { UserOptions } from "./UserOptions";

interface SelectProps extends Props<OptionType> {
  name: string;
  icon?: string;
  locationId?: string | number;
  width?: number;
  extraClass?: string;
  isLoading?: boolean;
  formatType?: string;
}

export const Select: React.FC<SelectProps> = (props) => {
  const { name, icon, width, extraClass, isLoading, formatType } = props;
  const themeContext = useContext(ThemeContext);
  const selectRef = useRef(null);

  const { fieldName, defaultValue, registerField, error, clearError } =
    useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef.current,
      getValue: (ref) => {
        if (props.isMulti) {
          if (!ref.state.selectValue) {
            return [];
          }
          return ref.state.selectValue.map(
            (option: OptionType) => option.value
          );
        }
        if (!ref.state.selectValue[0]) {
          return "";
        }
        return ref.state.selectValue[0].value;
      },
      clearValue: (ref) => {
        ref.setValue(null);
      },
      setValue: (ref, value: any | OptionType) => {
        const optionValue = value;
        if (optionValue) {
          if (props.options && props.options.length > 0) {
            ref.setValue(
              props?.options.find(
                (option: OptionType) => option.value === optionValue
              )
            );
          } else if (typeof optionValue === "object") {
            const { value, label } = optionValue as OptionType;
            ref.setValue({ value, label });
          }
        }
      },
    });
  }, [
    fieldName,
    registerField,
    props,
    props.isMulti,
    props?.options,
    isLoading,
  ]);

  useEffect(() => {
    if (props.options && props.options.length > 0 && props.locationId) {
      selectRef.current.setValue(
        props?.options.find(
          (option: OptionType) => option.value === props.locationId
        )
      );
    }
  }, [selectRef, props.locationId, props]);
  // const Option = (props) => {
  //   const { innerProps, innerRef } = props;
  //   return (
  //     <components.Option ref={innerRef} {...innerProps} className="label">
  //       <span>{props.data.first_name}</span>
  //       <span>{props.data.email}</span>
  //     </components.Option>
  //   );
  // };
  // const Menu = (props) => {
  //   return (
  //     <>
  //       <components.Menu {...props}>
  //         <div>
  //           {props.selectProps.fetchingData ? (
  //             <span className="fetching">Fetching data...</span>
  //           ) : (
  //             <div>{props.children}</div>
  //           )}
  //           <button
  //             className={"change-data"}
  //             onClick={props.selectProps.changeOptionsData}
  //           >
  //             Change data
  //           </button>
  //         </div>
  //       </components.Menu>
  //     </>
  //   );
  // };

  const renderFormat = (props) => {
    switch (formatType) {
      case "user":
        return <UserOptions {...props} />;
      case "locations":
        return <LocationOptions {...props} />;
      case "services":
        return <ServiceOptions {...props} />;
      case "taxes":
        return <TaxOptions {...props} />;
      default:
        return null;
    }
  };

  const components = { ValueContainer };
  return (
    <div className={styles.wrapper} style={{ width }}>
      {icon && <Icomoon iconName={icon} />}
      <ReactSelect
        ref={selectRef}
        defaultValue={defaultValue}
        components={components}
        formatOptionLabel={formatType ? (props) => renderFormat(props) : null}
        classNamePrefix={styles.selectContainer}
        isClearable={true}
        onFocus={clearError}
        className={`
          ${styles.selectContainer}
          ${extraClass ? extraClass : ""}
          ${icon ? styles.icon : ""}
          ${error ? styles.error : ""}
        `}
        {...props}
      />

      {isLoading && (
        <div className={styles.loader}>
          <Loader color={themeContext.colors.blue200} />
        </div>
      )}
      {error && (
        <span className={styles.errorContainer}>
          <ErrorTooltip message={error}>
            <FiAlertCircle />
          </ErrorTooltip>
        </span>
      )}
    </div>
  );
};

const ValueContainer = ({ children, ...props }: any) => {
  const { getValue, hasValue } = props;
  const newChildren = [...children];
  const nbValues = getValue();
  if (nbValues.length > 1) {
    newChildren[0] = nbValues?.map((p) => p.label).join(", ");
  } else {
    newChildren[0] = nbValues[0]?.label;
  }

  if (!hasValue) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }
  return (
    <components.ValueContainer {...props}>
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {newChildren}
      </div>
    </components.ValueContainer>
  );
};
