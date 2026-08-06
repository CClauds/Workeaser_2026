import styled, { css, keyframes } from "styled-components";

interface SidebarProps {
  isOpen?: boolean;
}

export const SidebarWrapper = styled.aside<SidebarProps>`
  min-width: ${({ isOpen }) => (isOpen ? 220 : 60)}px;
  width: ${({ isOpen }) => (isOpen ? 220 : 60)}px;
  min-height: calc(100vh - 70px);
  /* height: 100%; */

  background: ${({ theme }) => theme.colors.lightGray};
  border-right: 1px solid ${({ theme }) => theme.colors.gray300};

  overflow: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: width 0.3s, min-width 0.3s;
`;

interface PageNavigatorProps {
  isSidebarOpen: boolean;
  open: boolean;
  opened: boolean;
  close: boolean;
  height: number;
}

const expand = (value: number) => keyframes`
  from {
    height: 0;
  }
  to {
    height: ${value}px;
  }
`;
const shrink = (value: number) => keyframes`
  from {
    height: ${value}px;
  }
  to {
    height: 0;
  }
`;

export const Navigator = styled.nav<SidebarProps>`
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
  }
  & > ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 20px;

    a {
      display: flex;
      align-items: center;

      font-size: 15px;
      font-weight: ${({ theme }) => theme.fonts.bold};

      transition: color 0.3s;

      span {
        opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
        transition: opacity 0.3s;
      }

      &:hover {
        color: ${({ theme }) => theme.colors.blue100};
      }

      .icon {
        opacity: 1;
        &::before {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;

          margin-right: 9px;

          font-size: 24px;
          font-weight: ${({ theme }) => theme.fonts.regular};
          text-align: center;
          color: ${({ theme }) => theme.colors.blue100};

          background-color: ${({ theme }) => theme.colors.darkGray};
        }
      }
    }
  }
`;

export const PageNavigator = styled.div<PageNavigatorProps>`
  /* display: ${({ isSidebarOpen }) => (isSidebarOpen ? "block" : "none")}; */
  max-height: ${({ isSidebarOpen, opened, open, height }) =>
    !isSidebarOpen ? 0 : opened || open ? height : 0}px;
  /* height: ${({ height }) => height}px; */

  overflow: ${({ isSidebarOpen, opened, open }) =>
    isSidebarOpen && (opened || open) ? "visible" : "hidden"};

  transition: all 0.3s;

  /* animation: ${({ open, height }) =>
    open ? expand(height) : ""} 0.5s forwards;
  animation-play-state: ${({ open }) => (open ? "running" : "paused")}; */

  ul.subMenu {
    gap: 15px;
    margin-top: 15px;
    margin-left: 15px;
    flex: 1;

    opacity: ${({ isSidebarOpen, opened, open }) =>
      isSidebarOpen && (opened || open) ? 1 : 0};
    transition: opacity 0.3s;

    & > li > a,
    p {
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.regular};
      white-space: nowrap;
    }

    .extraMenu {
      position: relative;
      display: flex;

      span {
        position: absolute;
        right: 10px;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        transform: translate(50%, -15%) rotate(-90deg);

        &::before {
          color: ${({ theme }) => theme.colors.blue800};
        }
      }
    }
  }
`;

interface SideMenuPopupProps {
  navSize: number;
  width: number;
  active: boolean;
}

export const SideMenuPopup = styled.div<SideMenuPopupProps>`
  position: absolute;
  /* top: -${({ navSize }) =>
    (24 + 15 * (navSize - 1) + 16.8 * navSize) / 3}px; */
  top: 10%;
  transform: translateY(-37%);

  height: 45px;
  width: 190px;

  /* background-color: rgba(123, 124, 15, 0.6); */
  clip-path: polygon(
    85% 30%,
    92% 30%,
    100% 0%,
    100% 100%,
    92% 72%,
    85% 72%,
    80% 72%,
    80% 30%
  );

  z-index: 1000;

  ${({ active }) =>
    active
      ? css<SideMenuPopupProps>`
          top: 90%;
          height: ${({ navSize }) => 24 + 15 * (navSize - 1) + 20 * navSize}px;
          width: ${({ width }) => 190 + width}px;

          ${({ navSize }) =>
            navSize === 2
              ? css`
                  clip-path: polygon(
                    50% 15%,
                    55% 15%,
                    100% 15%,
                    100% 100%,
                    55% 100%,
                    50% 42%,
                    44% 42%,
                    44% 15%
                  );
                `
              : navSize === 3
              ? css`
                  clip-path: polygon(
                    50% 15%,
                    53% 15%,
                    100% 15%,
                    100% 100%,
                    53% 100%,
                    50% 42%,
                    43% 42%,
                    43% 15%
                  );
                `
              : css`
                  clip-path: polygon(
                    50% 15%,
                    55% 0%,
                    100% 0%,
                    100% 100%,
                    55% 100%,
                    50% 42%,
                    44% 42%,
                    44% 15%
                  );
                `};

          & > ul {
            display: flex;
          }
        `
      : ""};

  &:hover {
    top: 90%;
    height: ${({ navSize }) => 24 + 15 * (navSize - 1) + 20 * navSize}px;
    width: ${({ width }) => 190 + width}px;

    ${({ navSize }) =>
      navSize === 2
        ? css`
            clip-path: polygon(
              50% 15%,
              55% 15%,
              100% 15%,
              100% 100%,
              55% 100%,
              50% 42%,
              44% 42%,
              44% 15%
            );
          `
        : navSize === 3
        ? css`
            clip-path: polygon(
              50% 15%,
              53% 15%,
              100% 15%,
              100% 100%,
              53% 100%,
              50% 42%,
              43% 42%,
              43% 15%
            );
          `
        : css`
            clip-path: polygon(
              50% 15%,
              55% 0%,
              100% 0%,
              100% 100%,
              55% 100%,
              50% 42%,
              44% 42%,
              44% 15%
            );
          `};

    & > ul {
      display: flex;
    }
  }

  /* & > ul {
    display: none;
    position: absolute;
    top: 16%;
    left: 190px;

    gap: 15px;

    width: fit-content;
    height: fit-content;
    padding: 12px;
    margin: 0;

    background-color: ${({ theme }) => theme.colors.darkGray};
    z-index: 1000;

    a {
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.regular};
    }
  } */
`;

interface ExtraMenuProps {
  active: boolean;
}
export const ExtraMenu = styled.ul<ExtraMenuProps>`
  display: ${({ active }) => (active ? "flex" : "none")};
  position: absolute;
  top: 16%;
  left: 190px;

  gap: 15px;

  width: fit-content;
  height: fit-content;
  padding: 12px;
  margin: 0;
  & > li > a,
  p {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.regular};
    white-space: nowrap;
  }

  background-color: ${({ theme }) => theme.colors.darkGray};
  z-index: 1000;

  a {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
`;
