import React from "react";
import { Container } from "./styles";

interface StatusIconProps {
  status: boolean;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  return (
    <Container>
      {status ? (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <defs>
            <clipPath id="a">
              <rect
                width="16"
                height="16"
                rx="8"
                transform="translate(855 300)"
                fill="#2dc9a5"
                stroke="#f3f6f9"
                strokeWidth="1"
              />
            </clipPath>
          </defs>
          <g transform="translate(-855 -300)" clipPath="url(#a)">
            <g transform="translate(853.477 299.238)">
              <path
                d="M9.524,1.524a7.238,7.238,0,1,0,7.238,7.238A7.238,7.238,0,0,0,9.524,1.524Zm-8,7.238a8,8,0,1,1,8,8A8,8,0,0,1,1.524,8.762Z"
                fill="#2dc9a5"
                fillRule="evenodd"
              />
              <path
                d="M12.455,6.964a.381.381,0,0,1,.01.539L8.89,11.217,6.963,9.207a.381.381,0,1,1,.55-.527l1.378,1.437,3.025-3.143A.381.381,0,0,1,12.455,6.964Z"
                fill="#2dc9a5"
                fillRule="evenodd"
              />
            </g>
          </g>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <defs>
            <clipPath id="b">
              <rect
                width="16"
                height="16"
                rx="8"
                transform="translate(855 341)"
                fill="#f14b5c"
                stroke="#f3f6f9"
                strokeWidth="1"
              />
            </clipPath>
          </defs>
          <g transform="translate(-855 -341)" clipPath="url(#b)">
            <g transform="translate(853.477 340.238)">
              <path
                d="M9.524,1.524a7.238,7.238,0,1,0,7.238,7.238A7.238,7.238,0,0,0,9.524,1.524Zm-8,7.238a8,8,0,1,1,8,8A8,8,0,0,1,1.524,8.762Z"
                fill="#f14b5c"
                fillRule="evenodd"
              />
              <path
                d="M7.731,6.969a.381.381,0,0,1,.539,0l3.048,3.048a.381.381,0,1,1-.539.539L7.731,7.507A.381.381,0,0,1,7.731,6.969Z"
                fill="#f14b5c"
                fillRule="evenodd"
              />
              <path
                d="M11.317,6.969a.381.381,0,0,1,0,.539L8.269,10.555a.381.381,0,1,1-.539-.539l3.048-3.048A.381.381,0,0,1,11.317,6.969Z"
                fill="#f14b5c"
                fillRule="evenodd"
              />
            </g>
          </g>
        </svg>
      )}
    </Container>
  );
};
