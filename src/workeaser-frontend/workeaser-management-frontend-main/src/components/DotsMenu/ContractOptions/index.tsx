import React from "react";
import { OptionsButton } from "@components/Button/OptionsButton";
import { Icomoon } from "@components/Icomoon";
import { useTheme } from "styled-components";
import { ContractStatusEnum } from "types/cowork/relationship/enums";

interface ContractOptionsProps {
  status?: string;
  onSignContract?: () => void;
  onViewContract: () => void;
  onSend: () => void;
  onViewDocuments: () => void;
  getLink: () => void;
  onCancel: () => void;
}

export const ContractOptions: React.FC<ContractOptionsProps> = ({
  status,
  onSignContract,
  onViewContract,
  onSend,
  onViewDocuments,
  getLink,
  onCancel,
}) => {
  const theme = useTheme();
  return (
    <>
      {[ContractStatusEnum.CREATED].includes(ContractStatusEnum[status]) && (
        <OptionsButton
          disabled={!onSend}
          onClick={onSend}
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
              <g clipPath="url(#clipPath)">
                <g transform="translate(0 0.381)">
                  <path
                    d="M16.9,2.177a.381.381,0,0,1,.135.386L13.651,17.039a.381.381,0,0,1-.561.244L6.572,13.536l.38-.661,6.074,3.492L16.11,3.182,2.232,10.162l2.954,1.7a.381.381,0,0,1-.38.661L1.239,10.47A.381.381,0,0,1,1.257,9.8L16.5,2.136A.381.381,0,0,1,16.9,2.177Z"
                    transform="translate(-1.048 -2.095)"
                    fill="#2b3450"
                    fillRule="evenodd"
                  />
                  <path
                    d="M14.379,10.342a.381.381,0,0,1-.03.538L9.143,15.528v2.445L10.8,16.588a.381.381,0,1,1,.488.585l-2.286,1.9a.381.381,0,0,1-.625-.293V15.357a.381.381,0,0,1,.127-.284l5.333-4.762A.381.381,0,0,1,14.379,10.342Z"
                    transform="translate(-3.048 -4.31)"
                    fill="#2b3450"
                    fillRule="evenodd"
                  />
                </g>
              </g>
            </svg>
          }
        >
          SEND CONTRACT
        </OptionsButton>
      )}
      <OptionsButton
        onClick={onViewContract}
        icon={<Icomoon iconName="eye" color={theme.colors.blue800} />}
      >
        VIEW CONTRACT
      </OptionsButton>
      <OptionsButton
        onClick={onViewDocuments}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(1141 531)"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-1141 -531)">
              <g transform="translate(1139.476 529.477)">
                <path
                  d="M6.1,2.667A1.143,1.143,0,0,1,7.238,1.524h3.81A1.143,1.143,0,0,1,12.19,2.667V5.714a.381.381,0,0,0,.381.381h3.048a1.143,1.143,0,0,1,1.143,1.143v6.1a1.143,1.143,0,0,1-1.143,1.143H12.571v-.762h3.048A.381.381,0,0,0,16,13.333v-6.1a.381.381,0,0,0-.381-.381H12.571a1.143,1.143,0,0,1-1.143-1.143V2.667a.381.381,0,0,0-.381-.381H7.238a.381.381,0,0,0-.381.381V4.952H6.1Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M11.494,2.286H10.286V1.524h1.208a1.143,1.143,0,0,1,.808.335l4.125,4.125a1.143,1.143,0,0,1,.335.808V8H16V6.792a.381.381,0,0,0-.112-.269L11.763,2.4A.381.381,0,0,0,11.494,2.286Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M3.429,5.333a.381.381,0,0,0-.381.381V16.381a.381.381,0,0,0,.381.381H11.81a.381.381,0,0,0,.381-.381v-6.1A.381.381,0,0,0,11.81,9.9H8.762A1.143,1.143,0,0,1,7.619,8.762V5.714a.381.381,0,0,0-.381-.381Zm-1.143.381A1.143,1.143,0,0,1,3.429,4.571h3.81A1.143,1.143,0,0,1,8.381,5.714V8.762a.381.381,0,0,0,.381.381H11.81a1.143,1.143,0,0,1,1.143,1.143v6.1a1.143,1.143,0,0,1-1.143,1.143H3.429a1.143,1.143,0,0,1-1.143-1.143Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M7.684,5.333H6.476V4.571H7.684a1.143,1.143,0,0,1,.808.335l4.125,4.125a1.143,1.143,0,0,1,.335.808v1.589H12.19V9.839a.381.381,0,0,0-.112-.269L7.954,5.445A.381.381,0,0,0,7.684,5.333Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        VIEW DOCUMENTS
      </OptionsButton>
      {/* <OptionsButton
        onClick={getLink}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath>
                <rect
                  width="16"
                  height="16"
                  transform="translate(1141 466)"
                  fill="#2b3450"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-1141 -466)">
              <g id="Share" transform="translate(1140.273 465.272)">
                <path
                  d="M3.273,1.455A1.818,1.818,0,1,0,5.091,3.273,1.818,1.818,0,0,0,3.273,1.455ZM.727,3.273A2.545,2.545,0,1,1,3.273,5.818,2.545,2.545,0,0,1,.727,3.273Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M3.273,12.364a1.818,1.818,0,1,0,1.818,1.818A1.818,1.818,0,0,0,3.273,12.364ZM.727,14.182a2.545,2.545,0,1,1,2.545,2.545A2.545,2.545,0,0,1,.727,14.182Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M5.254,3.675l7.273,3.636-.325.65L4.928,4.325Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M5.254,13.78l7.273-3.636-.325-.65L4.928,13.129Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M14.182,6.909A1.818,1.818,0,1,0,16,8.727,1.818,1.818,0,0,0,14.182,6.909ZM11.636,8.727a2.545,2.545,0,1,1,2.545,2.545A2.545,2.545,0,0,1,11.636,8.727Z"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        }
      >
        GET SHARABLE LINK
      </OptionsButton> */}
      {[
        ContractStatusEnum.CONTRACT_SENT,
        ContractStatusEnum.SIGN_BY_CLIENT,
        ContractStatusEnum.SIGN_BY_COWORK,
      ].includes(ContractStatusEnum[status]) &&
        onSignContract && (
          <OptionsButton
            onClick={onSignContract}
            icon={<Icomoon iconName="write" color={theme.colors.blue800} />}
          >
            SIGN CONTRACT
          </OptionsButton>
        )}
      {ContractStatusEnum[status] != ContractStatusEnum.CANCELED && (
        <OptionsButton
          onClick={onCancel}
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
              <g clipPath="url(#clipPath)">
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
          CANCEL AGREEMENT
        </OptionsButton>
      )}
    </>
  );
};
