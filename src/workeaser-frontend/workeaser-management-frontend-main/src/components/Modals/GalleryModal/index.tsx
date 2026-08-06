import { CloseModalButton } from "@components/Button/CloseModalButton";
import { Icomoon } from "@components/Icomoon";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useTheme } from "styled-components";
import { Carousel, Content, SliderItems } from "./styles";
import Image from "next/legacy/image";

interface GalleryModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  photos: string[];
  onGalleryChange: (direction: number) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onRequestClose,
  photos,
  onGalleryChange,
}) => {
  const theme = useTheme();

  const [carouselDirection, setCarouselDirection] = useState({
    current: 0,
    last: -1,
  });

  useEffect(() => {
    if (!isOpen) {
      if (carouselDirection.last === 1) {
        onGalleryChange(carouselDirection.last);
      }
      setCarouselDirection({
        current: 0,
        last: -1,
      });
    }
  }, [isOpen]);

  const renderSliderClick = (type: "next" | "prev") => {
    const direction = type === "next" ? -1 : 1;

    setCarouselDirection({
      current: direction,
      last: direction,
    });

    if (type === "prev" && carouselDirection.last === -1) {
      onGalleryChange(carouselDirection.last);
      return;
    } else if (type === "next" && carouselDirection.last === 1) {
      onGalleryChange(carouselDirection.last);
      return;
    }
  };

  const handleCarouselTransitionEnd = () => {
    onGalleryChange(carouselDirection.current);
    setCarouselDirection({
      ...carouselDirection,
      current: 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="gallery-modal-content"
      overlayClassName="gallery-modal-overlay"
    >
      <CloseModalButton color="#fff" onClick={onRequestClose} />

      <Content>
        <Carousel animationDirection={carouselDirection.last}>
          {photos.length > 1 && (
            <button onClick={() => renderSliderClick("prev")}>
              <Icomoon
                iconName="arrow-down"
                color={theme.colors.blue800}
                size={26}
                fontSize={26}
              />
            </button>
          )}

          <SliderItems
            itemsQuantity={photos.length}
            animationDirection={carouselDirection.current}
            onTransitionEnd={handleCarouselTransitionEnd}
          >
            {photos.map((item, index) => (
              <figure key={`${index}-${item}`}>
                {item && (
                  <Image
                    src={item}
                    alt="logo"
                    objectFit="cover"
                    objectPosition="center"
                    layout="fill"
                  />
                )}
              </figure>
            ))}
          </SliderItems>

          {photos.length > 1 && (
            <button onClick={() => renderSliderClick("next")}>
              <Icomoon
                iconName="arrow-down"
                color={theme.colors.blue800}
                size={26}
                fontSize={26}
              />
            </button>
          )}
        </Carousel>
      </Content>
    </Modal>
  );
};
