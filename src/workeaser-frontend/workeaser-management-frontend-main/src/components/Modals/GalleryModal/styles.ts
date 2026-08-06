import styled from "styled-components";

export const Content = styled.div`
  /* width: clamp(1000px, 90vw, 1280px); */
  /* height: clamp(450px, 90vw, 500px); */
  width: 1080px;
  height: 570px;
  margin: auto;
`;

interface CarouselProps {
  animationDirection: number;
}
export const Carousel = styled.div<CarouselProps>`
  display: flex;
  justify-content: ${({ animationDirection }) =>
    animationDirection === 1 ? "flex-end" : "flex-start"};

  width: 100%;
  height: 100%;

  margin-top: 1.5rem;

  overflow: hidden;

  & > button {
    position: absolute;

    width: 50px;
    height: 50px;

    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 25px;

    top: 50%;

    transform: translateY(-50%);
    z-index: 10;

    span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &:first-child {
      left: 0;

      span {
        transform: rotate(90deg);
      }
    }
    &:last-child {
      right: 0;

      span {
        transform: rotate(-90deg);
      }
    }
  }
`;

interface SliderItemsProps {
  itemsQuantity: number;
  animationDirection: number;
}
export const SliderItems = styled.div<SliderItemsProps>`
  width: ${({ itemsQuantity }) => 100 * itemsQuantity}%;
  flex-shrink: 0;

  height: 100%;

  display: flex;

  /* gap: 30px; */

  transform: ${({ animationDirection, itemsQuantity }) =>
    animationDirection !== 0
      ? `translateX(${
          animationDirection === 1
            ? `${(100 / itemsQuantity) * animationDirection}`
            : `${(100 / itemsQuantity) * animationDirection}`
        }%)`
      : "translateX(0)"};

  transition: ${({ animationDirection }) =>
    animationDirection !== 0 ? "all 0.5s" : "none"};

  & > figure {
    position: relative;

    width: ${({ itemsQuantity }) => 100 / itemsQuantity}%;
    flex: 1 0 ${({ itemsQuantity }) => 100 / itemsQuantity}%;
  }
`;
