import { OptionsButton } from "@components/Button/OptionsButton";
import { Icomoon } from "@components/Icomoon";
import { useOutsideClick } from "hooks/useOutsideClick";
import React, { useRef, useState } from "react";
import {
  Content,
  Wrapper,
  ContentRow,
  MenuIcon,
  ContentColumn,
} from "./styles";

interface LocationsOptionsProps {
  id: number;
  onViewClick?: (id: number) => void;
  onGreenButtonClick?: (id: number) => void;
  onYellowButtonClick?: (id: number) => void;
  onRedButtonClick?: (id: number) => void;
}

export const LocationsOptions: React.FC<LocationsOptionsProps> = ({
  id,
  onViewClick,
  onGreenButtonClick,
  onYellowButtonClick,
  onRedButtonClick,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useOutsideClick({
    ref: wrapperRef,
    callback: () => setIsOpen(false),
  });

  const toggle = () => setIsOpen(!isOpen);

  // const handleView = () => {
  //   if (onViewClick) onViewClick(id);
  //   setIsOpen(false);
  // };
  const handlePreview = () => {
    if (onGreenButtonClick) onGreenButtonClick(id);
    setIsOpen(false);
  };
  const handleEdit = () => {
    if (onYellowButtonClick) onYellowButtonClick(id);
    setIsOpen(false);
  };
  const handleDelete = () => {
    if (onRedButtonClick) onRedButtonClick(id);
    setIsOpen(false);
  };

  return (
    <Wrapper ref={wrapperRef}>
      <MenuIcon isOpen={isOpen} onClick={toggle}>
        {!isOpen ? (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <defs>
              <clipPath>
                <rect
                  id="Retângulo_506"
                  data-name="Retângulo 506"
                  width="12"
                  height="12"
                  rx="5"
                  transform="translate(429 226)"
                  fill="#2b3450"
                />
              </clipPath>
            </defs>
            <g transform="translate(-429 -226)" clipPath="url(#clipPath)">
              <g transform="translate(433.5 226)">
                <path
                  d="M18.167,19.5a.5.5,0,1,0-.5-.5A.5.5,0,0,0,18.167,19.5Zm0,1a1.5,1.5,0,1,0-1.5-1.5A1.5,1.5,0,0,0,18.167,20.5Z"
                  transform="translate(-16.667 -13)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M18.167,27a.5.5,0,1,0-.5-.5A.5.5,0,0,0,18.167,27Zm0,1a1.5,1.5,0,1,0-1.5-1.5A1.5,1.5,0,0,0,18.167,28Z"
                  transform="translate(-16.667 -16)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M18.167,12a.5.5,0,1,0-.5-.5A.5.5,0,0,0,18.167,12Zm0,1a1.5,1.5,0,1,0-1.5-1.5A1.5,1.5,0,0,0,18.167,13Z"
                  transform="translate(-16.667 -10)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M18.5,20.333a1,1,0,1,0-1-1A1,1,0,0,0,18.5,20.333Z"
                  transform="translate(-17 -13.333)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M18.5,27.833a1,1,0,1,0-1-1A1,1,0,0,0,18.5,27.833Z"
                  transform="translate(-17 -16.333)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
                <path
                  d="M18.5,12.833a1,1,0,1,0-1-1A1,1,0,0,0,18.5,12.833Z"
                  transform="translate(-17 -10.333)"
                  fill="#2b3450"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>
        ) : (
          <svg width="7.991" height="7.991" viewBox="0 0 7.991 7.991">
            <g transform="translate(-24.222 -26.222)">
              <rect
                width="10.273"
                height="1.027"
                rx="0.514"
                transform="translate(24.948 26.222) rotate(45)"
                fill="#fff"
              />
              <rect
                width="10.273"
                height="1.027"
                rx="0.514"
                transform="translate(32.212 26.948) rotate(135)"
                fill="#fff"
              />
            </g>
          </svg>
        )}
      </MenuIcon>
      <Content isOpen={isOpen}>
        <div>
          {/* <ContentColumn>
            <OptionsButton
              onClick={handleView}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <defs>
                    <clipPath>
                      <rect
                        id="Retângulo_869"
                        data-name="Retângulo 869"
                        width="16"
                        height="16"
                        transform="translate(693 677)"
                        fill="#2b3450"
                        stroke="#707070"
                        strokeWidth="1"
                      />
                    </clipPath>
                  </defs>
                  <g
                    id="Grupo_de_máscara_200"
                    data-name="Grupo de máscara 200"
                    transform="translate(-693 -677)"
                    clipPath="url(#clip-path)"
                  >
                    <g
                      id="Eye_Pupil"
                      data-name="Eye Pupil"
                      transform="translate(693 679.86)"
                    >
                      <path
                        id="Caminho_544"
                        data-name="Caminho 544"
                        d="M1.8,10.189A8.324,8.324,0,0,0,9.01,14.594a8.324,8.324,0,0,0,7.214-4.406A8.324,8.324,0,0,0,9.01,5.783,8.324,8.324,0,0,0,1.8,10.189Zm-.742-.173A9.079,9.079,0,0,1,9.01,5.048a9.079,9.079,0,0,1,7.957,4.967.367.367,0,0,1,0,.346A9.079,9.079,0,0,1,9.01,15.329a9.079,9.079,0,0,1-7.957-4.967A.367.367,0,0,1,1.053,10.016Z"
                        transform="translate(-1.01 -5.048)"
                        fill="#2b3450"
                        fillRule="evenodd"
                      />
                      <path
                        id="Caminho_545"
                        data-name="Caminho 545"
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
              PREVIEW
            </OptionsButton>
          </ContentColumn> */}
          <ContentRow>
            <button className="success" onClick={handlePreview}>
              <Icomoon iconName="eye" />
              Preview
            </button>

            <button className="warning" onClick={handleEdit}>
              <Icomoon iconName="write" />
              Edit
            </button>
            <button className="danger" onClick={handleDelete}>
              <Icomoon iconName="trash" />
              Delete
            </button>
          </ContentRow>
        </div>
      </Content>
    </Wrapper>
  );
};
