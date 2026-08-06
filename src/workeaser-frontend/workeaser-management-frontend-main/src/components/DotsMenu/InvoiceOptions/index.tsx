import React, { MouseEvent } from "react";
import { OptionsButton } from "@components/Button/OptionsButton";
import { InvoiceStatusEnum } from "types/cowork/financial/enums";

interface InvoiceOptionsProps {
  id: string;
  /** HF-SPRINT-N-04: invoice ID numerico (db) pra montar a URL de download de PDF */
  invoiceId?: number | string;
  status: string;
  onCaptureClick: (
    id: string
  ) => (event: MouseEvent<HTMLButtonElement>) => void;
  onCopyClick?: (id: string) => (event: MouseEvent<HTMLButtonElement>) => void;
  onDuplicate?: (dup: string) => (event: MouseEvent<HTMLButtonElement>) => void;
  onResend?: (id: string) => Promise<void>;
}
export const InvoiceOptions: React.FC<InvoiceOptionsProps> = ({
  id,
  invoiceId,
  status,
  onCaptureClick,
  onCopyClick,
  onDuplicate,
  onResend,
}) => {
  // HF-SPRINT-N-04: handler de download PDF (abre em nova aba)
  const handleDownloadPdf = () => {
    if (!invoiceId) return;
    const url = `/api/cowork/finance/invoices/${invoiceId}/pdf`;
    // axios apiClient ja anexa Authorization — aqui usa window.open com o cookie de sessao
    // (auth client tem cookie HTTP-only "user-token" que axios manda automatico)
    window.open(url, "_blank");
  };

  return (
    <>
      {invoiceId && (
        <OptionsButton
          onClick={handleDownloadPdf}
          value="DOWNLOAD_PDF"
          icon={
            <span style={{ fontSize: 14 }} aria-hidden="true">📄</span>
          }
        >
          BAIXAR PDF
        </OptionsButton>
      )}
      {InvoiceStatusEnum[status] !== InvoiceStatusEnum.FULLY_PAID && (
        <>
          <OptionsButton
            onClick={onCaptureClick(id)}
            value="CAPTURE_PAYMENT"
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16">
                <defs>
                  <clipPath>
                    <rect
                      width="16"
                      height="16"
                      transform="translate(1083 597)"
                      fill="#2b3450"
                      stroke="#707070"
                      strokeWidth="1"
                    />
                  </clipPath>
                </defs>
                <g transform="translate(-1083 -597)">
                  <g transform="translate(1082.272 596.272)">
                    <path
                      d="M.727,4.364A1.455,1.455,0,0,1,2.182,2.909H15.273a1.455,1.455,0,0,1,1.455,1.455v8.727a1.455,1.455,0,0,1-1.455,1.455H2.182A1.455,1.455,0,0,1,.727,13.091Zm1.455-.727a.727.727,0,0,0-.727.727v8.727a.727.727,0,0,0,.727.727H15.273A.727.727,0,0,0,16,13.091V4.364a.727.727,0,0,0-.727-.727Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                    <path
                      d="M16.364,10.182H1.091V9.455H16.364Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                    <path
                      d="M16.364,11.636H1.091v-.727H16.364Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
              </svg>
            }
          >
            CAPTURE PAYMENT
          </OptionsButton>
          <OptionsButton
            onClick={onCaptureClick(id)}
            value="RECEIVE_PAYMENT"
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16">
                <defs>
                  <clipPath>
                    <rect
                      width="16"
                      height="16"
                      transform="translate(1083 556)"
                      fill="#2b3450"
                      stroke="#707070"
                      strokeWidth="1"
                    />
                  </clipPath>
                </defs>
                <g transform="translate(-1083 -556)">
                  <g transform="translate(1082.272 555.272)">
                    <path
                      d="M.727,4.727A1.091,1.091,0,0,1,1.818,3.636H15.636a1.091,1.091,0,0,1,1.091,1.091v8a1.091,1.091,0,0,1-1.091,1.091H1.818A1.091,1.091,0,0,1,.727,12.727Zm1.091-.364a.364.364,0,0,0-.364.364v8a.364.364,0,0,0,.364.364H15.636A.364.364,0,0,0,16,12.727v-8a.364.364,0,0,0-.364-.364Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                    <path
                      d="M7.475,6.888a3.083,3.083,0,0,0-.566,1.839,3.083,3.083,0,0,0,.566,1.839,1.587,1.587,0,0,0,1.252.707,1.587,1.587,0,0,0,1.252-.707,3.083,3.083,0,0,0,.566-1.839,3.083,3.083,0,0,0-.566-1.839,1.587,1.587,0,0,0-1.252-.707A1.587,1.587,0,0,0,7.475,6.888Zm-.582-.436a2.31,2.31,0,0,1,1.834-1,2.31,2.31,0,0,1,1.834,1,3.808,3.808,0,0,1,.712,2.275A3.808,3.808,0,0,1,10.561,11a2.31,2.31,0,0,1-1.834,1,2.31,2.31,0,0,1-1.834-1,3.808,3.808,0,0,1-.712-2.275A3.808,3.808,0,0,1,6.894,6.452Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                    <path
                      d="M1.091,5.818A1.818,1.818,0,0,0,2.909,4h.727A2.545,2.545,0,0,1,1.091,6.545Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                    <path
                      d="M2.909,13.455a1.818,1.818,0,0,0-1.818-1.818v-.727a2.545,2.545,0,0,1,2.545,2.545Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                    <path
                      d="M16.364,5.818A1.818,1.818,0,0,1,14.545,4h-.727a2.545,2.545,0,0,0,2.545,2.545Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                    <path
                      d="M14.545,13.455a1.818,1.818,0,0,1,1.818-1.818v-.727a2.545,2.545,0,0,0-2.545,2.545Z"
                      fill="#2b3450"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
              </svg>
            }
          >
            RECEIVE PAYMENT
          </OptionsButton>
        </>
      )}
      {InvoiceStatusEnum[status] !== InvoiceStatusEnum.FULLY_REFUNDED && (
        <OptionsButton
          onClick={onCaptureClick(id)}
          value="REFUND_PAYMENT"
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
          REFUND INVOICE
        </OptionsButton>
      )}

      {onResend && (
        <OptionsButton
          onClick={() => onResend(id)}
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
              <g>
                <g id="Send" transform="translate(0 0.381)">
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
          SEND A REMIDER
        </OptionsButton>
      )}
      {onCopyClick && (
        <OptionsButton
          onClick={onCopyClick(id)}
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
          GET SHAREABLE LINK
        </OptionsButton>
      )}
      {onDuplicate && (
        <OptionsButton
          onClick={onDuplicate(id)}
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
          DUPLICATE INVOICE
        </OptionsButton>
      )}
    </>
  );
};
