import React from "react";
import styles from "./styles.module.scss";

interface LoaderProps {
  color?: string;
  size?: number;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  className = "",
  color = "#ffffff",
  size = 15,
}) => {
  return (
    <svg
      className={`${styles.loading} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 14.997 14.999"
    >
      <g id="icon-wrapper" transform="translate(-239 -173)">
        <path
          id="loading"
          d="M-8003.958-230.711A1.014,1.014,0,0,1-8004-231a1,1,0,0,1,1-1,1,1,0,0,1,1,1v0h.022a5.482,5.482,0,0,0,1.759,3.549A5.488,5.488,0,0,0-7996.5-226a5.509,5.509,0,0,0,5.5-5.5,5.489,5.489,0,0,0-1.45-3.718,5.485,5.485,0,0,0-3.55-1.76V-237a1,1,0,0,1-1-1,1,1,0,0,1,1-1,1,1,0,0,1,.28.04A7.515,7.515,0,0,1-7989-231.5a7.507,7.507,0,0,1-7.5,7.5A7.516,7.516,0,0,1-8003.958-230.711Z"
          transform="translate(8243 412)"
          fill={color}
        />
      </g>
    </svg>
  );
};
