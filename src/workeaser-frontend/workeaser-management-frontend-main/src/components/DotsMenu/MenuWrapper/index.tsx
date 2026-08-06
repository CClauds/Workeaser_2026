import { Loader } from "@components/Loader";
import { useOutsideClick } from "@hooks/useOutsideClick";
import React, { ReactNode, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { Content, MenuIcon, Wrapper } from "./styles";

interface MenuWrapperProps {
  children: ReactNode | ((ctx: () => void) => ReactNode);
  loading?: boolean;
}

export const MenuWrapper: React.FC<MenuWrapperProps> = ({
  children,
  loading,
}) => {
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: wrapperRef,
    callback: () => handleClose(),
  });

  const toggle = () => setIsOpen(!isOpen);

  const handleClose = () => {
    setIsOpen(false);
  };

  const RenderChildren = () => {
    if (typeof children === "function") {
      return <div>{children(handleClose)}</div>;
    }
    return <div onClick={handleClose}>{children}</div>;
  };

  return (
    <Wrapper ref={wrapperRef}>
      {loading ? (
        <Loader color={theme.colors.blue800} />
      ) : (
        <MenuIcon isOpen={isOpen} onClick={toggle}>
          {!isOpen ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <defs>
                <clipPath>
                  <rect
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
      )}

      <Content isOpen={isOpen}>
        <RenderChildren />
      </Content>
    </Wrapper>
  );
};
