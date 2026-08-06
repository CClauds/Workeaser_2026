import React from "react";
import { OptionsButton } from "@components/Button/OptionsButton";
import { Container } from "./styles";

interface BankingOptionsProps {
  onAddNote: () => void;
  onRecordTransaction: () => void;
  onVoidTransaction: () => void;
}
export const BankingOptions: React.FC<BankingOptionsProps> = ({
  onAddNote,
  onRecordTransaction,
  onVoidTransaction,
}) => {
  return (
    <Container>
      <OptionsButton
        onClick={onAddNote}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(444 600)"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-444 -600)" clipPath="url(#clipPath)">
              <g transform="translate(442 598.4)">
                <path
                  d="M5.6,11.6a.4.4,0,0,1,.4-.4h8a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,11.6Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M5.6,14a.4.4,0,0,1,.4-.4h8a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,14Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M5.6,9.2A.4.4,0,0,1,6,8.8h8a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,9.2Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M5.6,6.8A.4.4,0,0,1,6,6.4H9.2a.4.4,0,1,1,0,.8H6A.4.4,0,0,1,5.6,6.8Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M4.4,2.4a.4.4,0,0,0-.4.4V16.4a.4.4,0,0,0,.4.4H15.6a.4.4,0,0,0,.4-.4V7.6a.4.4,0,0,0-.4-.4H12.4A1.2,1.2,0,0,1,11.2,6V2.8a.4.4,0,0,0-.4-.4Zm-1.2.4A1.2,1.2,0,0,1,4.4,1.6h6.4A1.2,1.2,0,0,1,12,2.8V6a.4.4,0,0,0,.4.4h3.2a1.2,1.2,0,0,1,1.2,1.2v8.8a1.2,1.2,0,0,1-1.2,1.2H4.4a1.2,1.2,0,0,1-1.2-1.2Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M11.269,2.4H10.8V1.6h.469a1.2,1.2,0,0,1,.849.351l4.331,4.331a1.2,1.2,0,0,1,.351.849V7.6H16V7.131a.4.4,0,0,0-.117-.283L11.551,2.517A.4.4,0,0,0,11.269,2.4Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        ADD A NOTE
      </OptionsButton>
      <OptionsButton
        onClick={onRecordTransaction}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(446 641)"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-446 -641)" clipPath="url(#clipPath)">
              <g transform="translate(445.273 640.272)">
                <path
                  d="M8.364,3.636A5.428,5.428,0,0,0,5.3,4.58a1.148,1.148,0,0,1-1.077.128L2.909,4.177v3.1A1.091,1.091,0,0,1,1.818,8.364a.364.364,0,0,0-.364.364v1.455a.364.364,0,0,0,.364.364h.49a1.154,1.154,0,0,1,1.047.711,5.457,5.457,0,0,0,.864,1.381,1.519,1.519,0,0,1,.216,1.455,1.455,1.455,0,1,0,2.815.705.364.364,0,0,1,.4-.3,5.506,5.506,0,0,0,.708.045h2.182a5.506,5.506,0,0,0,.708-.045.364.364,0,0,1,.4.3,1.455,1.455,0,1,0,2.815-.705,1.519,1.519,0,0,1,.216-1.455,5.455,5.455,0,0,0-4.144-9ZM4.886,3.98a6.155,6.155,0,0,1,3.478-1.07h2.182a6.182,6.182,0,0,1,4.7,10.2.8.8,0,0,0-.077.755,2.182,2.182,0,0,1-4.138,1.388q-.238.018-.481.019H8.364q-.243,0-.481-.019a2.182,2.182,0,0,1-4.138-1.388.8.8,0,0,0-.077-.755,6.184,6.184,0,0,1-.979-1.565.428.428,0,0,0-.38-.273h-.49A1.091,1.091,0,0,1,.727,10.182V8.727A1.091,1.091,0,0,1,1.818,7.636a.364.364,0,0,0,.364-.364V3.636a.364.364,0,0,1,.5-.337l1.81.735A.422.422,0,0,0,4.886,3.98Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M6.182,7.636A.364.364,0,0,1,5.818,8H5.455a.364.364,0,0,1,0-.727h.364A.364.364,0,0,1,6.182,7.636Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M9.091,1.455A1.8,1.8,0,0,0,7.3,3.572L6.585,3.7a2.545,2.545,0,1,1,5.012,0l-.716-.129a1.8,1.8,0,0,0-1.79-2.118Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        RECORD TRANSACTION
      </OptionsButton>
      <OptionsButton
        onClick={onVoidTransaction}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  height="16"
                  transform="translate(441 683)"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-441 -683)" clipPath="url(#clipPath)">
              <g transform="translate(439.476 682.238)">
                <path
                  d="M14.936,2.969a.381.381,0,0,1,0,.539L4.269,14.174a.381.381,0,0,1-.539-.539L14.4,2.969A.381.381,0,0,1,14.936,2.969Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M9.524,1.524a7.238,7.238,0,1,0,7.238,7.238A7.238,7.238,0,0,0,9.524,1.524Zm-8,7.238a8,8,0,1,1,8,8A8,8,0,0,1,1.524,8.762Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        VOID TRANSACTION
      </OptionsButton>
    </Container>
  );
};
