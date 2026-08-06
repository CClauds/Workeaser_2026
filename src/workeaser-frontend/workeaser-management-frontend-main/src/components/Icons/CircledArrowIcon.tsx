import React from "react";

interface CircledArrowIconProps {
  size?: number;
}

export const CircledArrowIcon: React.FC<CircledArrowIconProps> = ({
  size = 22,
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22">
      <defs>
        <clipPath>
          <rect
            width="10"
            height="10"
            transform="translate(267 410)"
            fill="#2b3450"
            stroke="#707070"
            strokeWidth="1"
          />
        </clipPath>
      </defs>
      <g transform="translate(-783 -762)">
        <g>
          <g
            transform="translate(783 762)"
            fill="#fff"
            stroke="#2b3450"
            strokeWidth="1"
          >
            <circle cx="11" cy="11" r="11" stroke="none" />
            <circle cx="11" cy="11" r="10.5" fill="none" />
          </g>
          <g transform="translate(522 359)" clipPath="url(#clipPath)">
            <path
              d="M3.7,6.5a.333.333,0,0,1,.471,0L8.6,10.929,13.031,6.5a.333.333,0,1,1,.471.471l-4.9,4.9-4.9-4.9A.333.333,0,0,1,3.7,6.5Z"
              transform="translate(263.4 405.864)"
              fill="#2b3450"
              fillRule="evenodd"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
