import { Loader } from "@components/Loader";
import React from "react";
import { ButtonHTMLAttributes } from "react";
import { useTheme } from "styled-components";

import styles from "./styles.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  color?: "primary" | "secondary" | "plain" | "danger";
  extraClass?: string;
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  color = "primary",
  extraClass = "",
  className = "",
  loading,
  ...props
}) => {
  const theme = useTheme();

  return (
    <button
      type="button"
      className={`
        ${styles.container} 
        ${styles[color]}
        ${loading ? styles.loading : ""}
        ${className}
        ${extraClass}
      `}
      disabled={loading}
      {...props}
    >
      {!loading ? (
        text
      ) : (
        <Loader color={color === "plain" ? theme.colors.blue200 : "#ffffff"} />
      )}
    </button>
  );
};
