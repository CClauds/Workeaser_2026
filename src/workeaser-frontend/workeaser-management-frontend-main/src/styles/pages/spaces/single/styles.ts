import styled from "styled-components";
import { Form } from "@unform/web";

export const Container = styled.div`
  padding: 1rem 1rem 2rem;
  margin: auto 0;

  h3 {
    font-size: 1.25rem;
    font-weight: ${({ theme }) => theme.fonts.bold};
    margin-bottom: 1.25rem;
  }
`;

interface CarouselProps {
  animationDirection?: number;
  itemsQuantity: number;
}
export const Carousel = styled.div<CarouselProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  & > div {
    position: relative;

    display: flex;
    justify-content: flex-start;

    max-width: 1500px;

    width: 100%;
    height: 480px;

    margin-top: 1.5rem;

    overflow: hidden;

    & > button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);

      width: 50px;
      height: 50px;

      background-color: ${({ theme }) => theme.colors.white};
      border-radius: 25px;

      transition: filter 0.2s;
      z-index: 10;

      &:hover {
        filter: brightness(0.9);
      }

      span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      &:first-child {
        left: 468px;

        span {
          transform: rotate(90deg);
        }
      }
      &:last-child {
        right: 468px;

        span {
          transform: rotate(-90deg);
        }
      }
    }

    @media screen and (min-width: 2520px) {
      max-width: ${({ itemsQuantity }) => (itemsQuantity > 4 ? 2520 : 1500)}px;

      button {
        &:first-child {
          left: ${({ itemsQuantity }) => (itemsQuantity > 4 ? 978 : 468)}px;
        }
        &:last-child {
          right: ${({ itemsQuantity }) => (itemsQuantity > 4 ? 978 : 468)}px;
        }
      }
    }
  }
`;

export const ContentContainer = styled.div`
  max-width: 1280px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;

  padding-top: 1.5rem;
  margin: 1.5rem auto 0;
  border-top: 1px solid ${({ theme }) => theme.colors.darkGray};

  section:first-child {
    flex: 1 0 780px;
  }
  section:last-child {
    flex-basis: 425px;
  }
`;

export const Content = styled.div`
  margin-top: 1.5rem;

  p {
    font-size: 0.85rem;
    font-weight: ${({ theme }) => theme.fonts.regular};

    &.description {
      font-size: 0.95rem;
      line-height: 1.4rem;
    }
  }
`;

interface PricingContainerProps {
  isCollapsed?: boolean;
}
export const PricingContainer = styled.div<PricingContainerProps>`
  margin-top: 1rem;

  border: 1px solid ${({ theme }) => theme.colors.gray300};

  & > div.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 1rem 0;
    margin: 0 1rem;

    letter-spacing: 0.9px;

    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};
    border-bottom-width: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)}px;

    & > svg {
      transition: transform 0.3s;
      transform: ${({ isCollapsed }) => (isCollapsed ? "" : "rotate(180deg)")};
    }
  }

  p {
    font-size: 0.75rem;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
`;

export const PricingContent = styled.div`
  padding: 0 1rem 1rem;

  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 1rem;

    &.pricing__card {
      background-color: ${({ theme }) => theme.colors.lightGray};
      border: 1px solid ${({ theme }) => theme.colors.gray300};

      & + div {
        margin-top: 0.6rem;
      }

      p {
        font-weight: ${({ theme }) => theme.fonts.bold};
      }
    }

    & > div {
      width: 16rem;
      display: flex;
      justify-content: space-between;

      & > p {
        width: 6rem;
        text-align: center;
      }
    }
  }
`;

interface FeesContainerProps {
  isCollapsed?: boolean;
}
export const FeesContainer = styled.div<FeesContainerProps>`
  margin-top: 1rem;

  border: 1px solid ${({ theme }) => theme.colors.gray300};

  & > div.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    padding: 1rem 0;
    margin: 0 1rem;

    letter-spacing: 0.9px;

    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};
    border-bottom-width: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)}px;

    & > svg {
      transition: transform 0.3s;
      transform: ${({ isCollapsed }) => (isCollapsed ? "" : "rotate(180deg)")};
    }
  }

  p {
    font-size: 0.75rem;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
`;
export const FeesContent = styled.div`
  padding: 0 1rem 1rem;

  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    padding: 1rem;
  }
`;

export const PricingCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  & > div {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    & > div {
      position: relative;
      height: 18px;
    }
  }

  & + div {
    margin-top: 0.6rem;
  }

  p {
    font-weight: ${({ theme }) => theme.fonts.bold};

    &.regular {
      font-weight: ${({ theme }) => theme.fonts.regular};
    }
    &.small {
      font-size: 0.85rem;
    }
  }
`;

export const AmenitiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;

  margin-top: 1rem;
`;

export const AmenityCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  padding: 0.5rem;

  border: 1px solid ${({ theme }) => theme.colors.gray300};

  & > span {
    font-size: 0.95rem;
  }
`;

export const MapContainer = styled.div`
  width: 100%;
  height: 20rem;
`;

export const MapSubtitle = styled.p`
  margin-top: 1rem;
`;

export const OtherServicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-top: 2.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.darkGray};

  & > div,
  section {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  .cards__container {
    & > div {
      width: clamp(320px, 30vw, 460px);
    }
  }

  section {
    margin-top: 1rem;
  }
`;

export const Sidebar = styled.aside`
  position: sticky;
  top: 3rem;

  padding: 1rem;
  margin-top: 2rem;

  background-color: ${({ theme }) => theme.colors.lightGray};

  .sidebar__footer {
    display: flex;
    justify-content: center;
    gap: 1rem;

    margin-top: 1rem;

    & > button {
      width: 11.25rem;
      font-size: 0.75rem;
      font-weight: ${({ theme }) => theme.fonts.semibold};
    }
  }
`;

export const SidebarHeader = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  place-items: center;

  margin-top: 2rem;

  & > figure {
    position: absolute;
    top: -5rem;
  }

  h4 {
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.bold};

    margin-top: 1rem;
  }
  p {
    font-size: 0.9rem;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
`;

export const SidebarForm = styled(Form)`
  display: flex;
  flex-direction: column;

  padding: 0.75rem;
  margin-top: 1rem;

  background-color: ${({ theme }) => theme.colors.white};
  /* border-width: 0 1px 1px 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.darkGray};*/
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  label {
    /* flex: 1; */
    font-size: 0.9rem;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
  h4 {
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.bold};
    text-align: center;

    margin-bottom: 1rem;
  }
  h5 {
    font-size: 0.95rem;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }

  & > div + div {
    margin-top: 1.25rem;
  }

  button {
    width: 100%;
    margin-top: 0.75rem;
  }

  .container__border {
    padding-top: 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.gray300};

    p.justified__text {
      text-align: justify;
      text-justify: inter-word;
      font-size: 0.85rem;
      font-weight: ${({ theme }) => theme.fonts.regular};
      line-height: 1.25;

      margin: 1rem 0;
    }

    & > div > div > div ~ div {
      margin: 1rem 0;
    }
  }
`;

export const Blur = styled.div`
  position: absolute;
  inset: 0;
  top: -2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);

  display: flex;
  justify-content: center;
  align-items: center;

  span {
    font-size: 1.25rem;
    font-weight: ${({ theme }) => theme.fonts.bold};
  }
`;
