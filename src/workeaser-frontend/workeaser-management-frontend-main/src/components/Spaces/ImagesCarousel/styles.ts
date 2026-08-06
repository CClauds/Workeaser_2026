import styled from "styled-components";

interface SliderItemsProps {
  itemsQuantity: number;
  animationDirection: number;
  lastDirection?: number;
}
export const SliderItems = styled.div<SliderItemsProps>`
  width: ${({ itemsQuantity }) => 100 * itemsQuantity}%;

  height: 100%;

  display: flex;
  gap: 30px;

  /* transform: ${({ animationDirection, lastDirection }) =>
    animationDirection !== 0
      ? `translateX(${animationDirection === 1 ? 620 : -620}px)`
      : `translateX(${lastDirection === 1 ? 110 : -110}px)`}; */
  transform: ${({ animationDirection }) =>
    animationDirection !== 0
      ? `translateX(${animationDirection === 1 ? 510 : -510}px)`
      : `translateX(0)`};
  /* transform: ${({ animationDirection }) =>
    animationDirection !== 0
      ? `translateX(${animationDirection === 1 ? 400 : -620}px)`
      : `translateX(-110px)`}; */

  transition: ${({ animationDirection }) =>
    animationDirection !== 0 ? "all 0.5s" : "none"};

  & > figure {
    cursor: pointer;
    flex: 1 0 480px;
    width: 480px;
  }
`;
