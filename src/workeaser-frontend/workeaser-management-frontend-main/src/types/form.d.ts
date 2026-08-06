import type { ReactNode } from "react";
import type { UnformField } from "@unform/core";

export type Field = {
  fieldName: string;
  registerField: <T>(field: UnformField<T>) => void;
  defaultValue: any;
  clearError: () => void;
  error: string | undefined;
};

export type Option = {
  value: string;
  label: string;
  icon?: ReactNode;
};

export type OptionType = {
  value: string | number;
  label: string;
};
