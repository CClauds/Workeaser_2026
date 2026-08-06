import React from "react";
import { OptionsButton } from "@components/Button/OptionsButton";

interface BookingsOptionsProps {
  id: number;
  type?: string;
  onViewClick: (id: number, type?: string) => () => void;
  onAttachClick?: (id: number) => Promise<void>;
}

export const BookingsOptions: React.FC<BookingsOptionsProps> = ({
  id,
  type,
  onViewClick,
  onAttachClick,
}) => {
  return (
    <>
      <OptionsButton
        onClick={onViewClick(id, type)}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(693 677)"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-693 -677)" clipPath="url(#clip-path)">
              <g transform="translate(693 679.86)">
                <path
                  d="M1.8,10.189A8.324,8.324,0,0,0,9.01,14.594a8.324,8.324,0,0,0,7.214-4.406A8.324,8.324,0,0,0,9.01,5.783,8.324,8.324,0,0,0,1.8,10.189Zm-.742-.173A9.079,9.079,0,0,1,9.01,5.048a9.079,9.079,0,0,1,7.957,4.967.367.367,0,0,1,0,.346A9.079,9.079,0,0,1,9.01,15.329a9.079,9.079,0,0,1-7.957-4.967A.367.367,0,0,1,1.053,10.016Z"
                  transform="translate(-1.01 -5.048)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M11.152,9.317a1.836,1.836,0,1,0,1.836,1.836A1.836,1.836,0,0,0,11.152,9.317Zm-2.57,1.836a2.57,2.57,0,1,1,2.57,2.57A2.57,2.57,0,0,1,8.582,11.152Z"
                  transform="translate(-3.075 -6.012)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        VIEW INFORMATION
      </OptionsButton>
      {onAttachClick && (
        <OptionsButton
          onClick={() => onAttachClick(id)}
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16">
              <defs>
                <clipPath>
                  <rect
                    width="16"
                    height="16"
                    transform="translate(1083 638)"
                    fill="#2b3450"
                    stroke="#707070"
                    strokeWidth="1"
                  />
                </clipPath>
              </defs>
              <g transform="translate(-1083 -638)">
                <g id="wallet-4-coins" transform="translate(1082.272 637.636)">
                  <path
                    d="M.727,2.909A1.441,1.441,0,0,1,2.154,1.455h.354a.364.364,0,0,1,0,.727H2.154a.714.714,0,0,0-.7.727v.727a.714.714,0,0,0,.7.727H13.846a.714.714,0,0,0,.7-.727V2.909a.714.714,0,0,0-.7-.727h-.709a.364.364,0,0,1,0-.727h.709a1.441,1.441,0,0,1,1.427,1.455V6.182h-.727V4.9a1.4,1.4,0,0,1-.7.186H2.154a1.4,1.4,0,0,1-.7-.186v9.641a.727.727,0,0,0,.727.727H13.846a.714.714,0,0,0,.7-.727V13.091h.727v1.455A1.441,1.441,0,0,1,13.846,16H2.182A1.455,1.455,0,0,1,.727,14.545Z"
                    fill="#2b3450"
                    fillRule="evenodd"
                  />
                  <path
                    d="M8.727,10.182a2.909,2.909,0,0,1,2.909-2.909h4.727a.364.364,0,0,1,.364.364v5.091a.364.364,0,0,1-.364.364H11.636A2.909,2.909,0,0,1,8.727,10.182ZM11.636,8a2.182,2.182,0,0,0,0,4.364H16V8Z"
                    fill="#2b3450"
                    fillRule="evenodd"
                  />
                  <path
                    d="M6.727,1.455A2.73,2.73,0,0,0,4.042,4.664l-.716.127a3.455,3.455,0,1,1,6.8,0l-.716-.127A2.73,2.73,0,0,0,6.727,1.455Z"
                    fill="#2b3450"
                    fillRule="evenodd"
                  />
                  <path
                    d="M9.273,1.455A2.716,2.716,0,0,0,8.15,1.7l-.3-.663a3.457,3.457,0,0,1,4.824,3.758l-.716-.127A2.73,2.73,0,0,0,9.273,1.455Z"
                    fill="#2b3450"
                    fillRule="evenodd"
                  />
                  <path
                    d="M11.636,9.455a.727.727,0,1,0,.727.727A.727.727,0,0,0,11.636,9.455Zm-1.455.727a1.455,1.455,0,1,1,1.455,1.455A1.455,1.455,0,0,1,10.182,10.182Z"
                    fill="#2b3450"
                    fillRule="evenodd"
                  />
                </g>
              </g>
            </svg>
          }
        >
          ATTACH CONTRACT
        </OptionsButton>
      )}
    </>
  );
};
