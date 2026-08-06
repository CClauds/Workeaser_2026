import React, { useState } from "react";
import Image from "next/legacy/image";
import { SliderItems } from "./styles";
import { Icomoon } from "@components/Icomoon";
import { useTheme } from "styled-components";

interface ImagesCarouselProps {
  photos: string[];
  onGalleryChange: (direction: number) => void;
  onImageClick: (index: number) => void;
}

export const ImagesCarousel: React.FC<ImagesCarouselProps> = ({
  photos,
  onGalleryChange,
  onImageClick,
}) => {
  const theme = useTheme();

  const [carouselDirection, setCarouselDirection] = useState({
    current: 0,
    last: -1,
  });

  const handleSliderClick = (type: "next" | "prev") => {
    const direction = type === "next" ? -1 : 1;

    setCarouselDirection({
      current: direction,
      last: direction,
    });
  };

  const handleCarouselTransitionEnd = () => {
    onGalleryChange(carouselDirection.current);
    setCarouselDirection({
      ...carouselDirection,
      current: 0,
    });
  };

  return (
    <>
      <button onClick={() => handleSliderClick("prev")}>
        <Icomoon
          iconName="arrow-down"
          color={theme.colors.blue800}
          size={26}
          fontSize={26}
        />
      </button>

      <SliderItems
        itemsQuantity={photos.length}
        animationDirection={carouselDirection.current}
        lastDirection={carouselDirection.last}
        onTransitionEnd={handleCarouselTransitionEnd}
      >
        {photos.map((item, index) => (
          <figure key={`${index}-${item}`} onClick={() => onImageClick(index)}>
            {item && (
              <Image
                src={item}
                width={480}
                height={480}
                alt="logo"
                layout="fixed"
                objectFit="cover"
                objectPosition="center"
              />
            )}
          </figure>
        ))}
      </SliderItems>

      <button onClick={() => handleSliderClick("next")}>
        <Icomoon
          iconName="arrow-down"
          color={theme.colors.blue800}
          size={26}
          fontSize={26}
        />
      </button>
    </>
  );
};
