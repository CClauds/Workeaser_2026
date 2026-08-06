import React from "react";
import { OptionsButton } from "@components/Button/OptionsButton";

interface ServicesOptionsProps {
  id: number;
  onChatClick?: (id: number) => () => void;
  onAttachClick: (id: number) => () => void;
  onDetachClick: (id: number) => () => void;
  type?: "SERVICE" | "CUSTOMER";
}

export const ServicesOptions: React.FC<ServicesOptionsProps> = ({
  id,
  onChatClick,
  onAttachClick,
  onDetachClick,
  type = "SERVICE",
}) => {
  return (
    <>
      {type === "CUSTOMER" && (
        <OptionsButton
          onClick={onChatClick ? onChatClick(id) : () => {}}
          icon={<></>}
        >
          CHAT
        </OptionsButton>
      )}
      <OptionsButton
        disabled={!onAttachClick}
        onClick={onAttachClick ? onAttachClick(id) : null}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <path
                  d="M0,0H16V16H0Z"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g clipPath="url(#clip-path)">
              <g transform="translate(1.818)">
                <path
                  d="M4,11.091A1.091,1.091,0,0,1,5.091,10H15.273a1.091,1.091,0,0,1,1.091,1.091v7.273a1.091,1.091,0,0,1-1.091,1.091H5.091A1.091,1.091,0,0,1,4,18.364Zm1.091-.364a.364.364,0,0,0-.364.364v7.273a.364.364,0,0,0,.364.364H15.273a.364.364,0,0,0,.364-.364V11.091a.364.364,0,0,0-.364-.364Z"
                  transform="translate(-4 -3.455)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M11.273,1.727A2.545,2.545,0,0,0,8.727,4.273H8a3.273,3.273,0,1,1,6.545,0h-.727A2.545,2.545,0,0,0,11.273,1.727Z"
                  transform="translate(-5.091 -1)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M8,9.136V5.5h.727V9.136Z"
                  transform="translate(-5.091 -2.227)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M16,9.136V5.5h.727V9.136Z"
                  transform="translate(-7.273 -2.227)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        ATTACH {type === "SERVICE" ? "CUSTOMER" : "SERVICE"}
      </OptionsButton>
      <OptionsButton
        onClick={onDetachClick(id)}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <path
                  d="M0,0H16V16H0Z"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g clipPath="url(#clip-path)">
              <g transform="translate(1.818)">
                <path
                  d="M4,11.091A1.091,1.091,0,0,1,5.091,10H15.273a1.091,1.091,0,0,1,1.091,1.091v7.273a1.091,1.091,0,0,1-1.091,1.091H5.091A1.091,1.091,0,0,1,4,18.364Zm1.091-.364a.364.364,0,0,0-.364.364v7.273a.364.364,0,0,0,.364.364H15.273a.364.364,0,0,0,.364-.364V11.091a.364.364,0,0,0-.364-.364Z"
                  transform="translate(-4 -3.455)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M11.273,1.727A2.545,2.545,0,0,0,8.727,4.273a.364.364,0,1,1-.727,0,3.273,3.273,0,1,1,6.545,0h-.727A2.545,2.545,0,0,0,11.273,1.727Z"
                  transform="translate(-5.091 -1)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M16,9.136V5.5h.727V9.136Z"
                  transform="translate(-7.273 -2.227)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        DETACH {type === "SERVICE" ? "CUSTOMER" : "SERVICE"}
      </OptionsButton>
    </>
  );
};
