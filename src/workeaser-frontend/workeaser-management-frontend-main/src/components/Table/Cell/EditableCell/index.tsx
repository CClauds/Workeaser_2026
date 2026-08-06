import { DatePickerAntd } from "@components/Form/DatePickerAntd";
import { TableInput as TestInput } from "@components/Form/TableInput";
import { ReactSelectComponent } from "@components/FormElements/ReactSelect";
import { SelectComponent } from "@components/FormElements/Select";
import { currencyUnmask } from "@utils/masks";
import Money from "dinero.js";
import React, {
  ChangeEvent,
  InputHTMLAttributes,
  useEffect,
  useState,
} from "react";
import { ColumnInstance, Row as RowType } from "react-table";
import { TransactionCategory } from "types/cowork/financial/enums";
import { OptionType } from "types/form";
import { TableInput } from "./styles";

interface EditableCellProps {
  value: any;
  maxvalue?: number | string;
  options?: OptionType[];
  row: RowType;
  column: ColumnInstance;
  updateMyData?: (
    rowIndex: number,
    columnId: string,
    value: string,
    rowData?: RowType
  ) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value: initialValue,
  maxvalue,
  options,
  row,
  column: { id, type, name, inputOptions },
  updateMyData,
}) => {
  const [value, setValue] = useState<string>(initialValue);
  const [datalistValue, setDatalistValue] = useState<string>(initialValue);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (type === "currency") {
      const number = parseInt(currencyUnmask(value));
      if (!number) {
        value = "0";
        setValue(value);
        if (updateMyData) updateMyData(row.index, id, value);
        return;
      }
      if (maxvalue >= 0) {
        if (number <= maxvalue && maxvalue !== 0) value = String(number);
        else return;
      } else {
        value = String(number);
      }
    }

    if (type === "datalist") {
      updateMyData(row.index, id, value, row);
      setValue(TransactionCategory[value]);
      return;
    }

    setValue(value);
    if (updateMyData) updateMyData(row.index, id, value);
  };

  const onBlur = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length) updateMyData(row.index, id, value, row);
  };

  const handleSuggestionClick = (suggestionIndex: number) => {
    const value = inputOptions[suggestionIndex].label;
    setValue(value);
    updateMyData(row.index, id, value);
  };

  if (type === "currency") {
    return (
      <TestInput
        name={`${name}[${row.index}].${id}`}
        value={Money({ amount: parseInt(value) ?? 0 }).toFormat("$0,0.00")}
        onChange={onChange}
      />
    );
  }
  if (type === "text") {
    return (
      <>
        <TestInput
          // list={`${name}[${row.index}].${id}-list`}
          type="text"
          name={`${name}[${row.index}].${id}`}
          value={value}
          onChange={onChange}
          suggestions={inputOptions?.map(({ value, label }) => ({
            id: String(value),
            fulltext: label,
          }))}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* // <datalist id={`${name}[${row.index}].${id}-list`}>
          //   {inputOptions.map((option) => (
          //     <option key={option.value} value={option.value}>
          //       {option.label}
          //     </option>
          //   ))}
          // </datalist> */}
      </>
    );
  }
  if (type === "number") {
    return (
      <TestInput
        name={`${name}[${row.index}].${id}`}
        type="number"
        min={1}
        value={value}
        onChange={onChange}
      />
    );
  }
  if (type === "date") {
    return (
      <DatePickerAntd
        name={`${name}[${row.index}].${id}`}
        // type="date"
        // width={140}
        // value={value}
        // onChange={onChange}
      />
    );
  }
  if (type === "datalist") {
    return (
      <>
        <TableInput
          list="list"
          type="text"
          value={TransactionCategory[datalistValue] ?? datalistValue}
          onChange={(e) => {
            setDatalistValue(e.target.value);
          }}
          onBlur={onBlur}
        />
        {options && (
          <datalist id="list">
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
        )}
      </>
    );
  }

  if (name) {
    return (
      <TestInput
        name={`${name}[${row.index}].${id}`}
        value={value}
        onChange={onChange}
        readOnly
      />
    );
  }

  return <TableInput type="text" value={value} onChange={onChange} readOnly />;
};
