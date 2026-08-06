import { ProfilePopup } from "@components/Header/ProfilePopup";
import { Thumbnail } from "@components/Thumbnail";
import { AuthContext } from "@contexts/AuthContext";
import { useOutsideClick } from "hooks/useOutsideClick";
import React, { useContext, useRef, useState } from "react";
import { Button, Container } from "./styles";

export const ClientProfileButton: React.FC = () => {
  const { user } = useContext(AuthContext);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: wrapperRef,
    callback: () => setIsPopupOpen(false),
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const photo = user?.photo;

  return (
    <Container ref={wrapperRef}>
      <Button active={isPopupOpen} onClick={() => setIsPopupOpen(!isPopupOpen)}>
        <Thumbnail
          url={photo?.file}
          alt="profile picture"
          size={34}
          radius={5}
        />
      </Button>
      <ProfilePopup isOpen={isPopupOpen} />
    </Container>
  );
};
