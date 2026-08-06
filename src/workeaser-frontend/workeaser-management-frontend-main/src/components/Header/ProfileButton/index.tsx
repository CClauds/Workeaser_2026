import { ClientProfilePopup } from "@components/Client/ProfilePopup";
import { Icomoon } from "@components/Icomoon";
import { Thumbnail } from "@components/Thumbnail";
import { AuthContext } from "@contexts/AuthContext";
import { useOutsideClick } from "hooks/useOutsideClick";
import React, { useContext, useRef, useState } from "react";
import { Button, Container, NoPhtoContainer } from "./styles";
import { useTheme } from "styled-components";

interface ProfileButtonProps {}

export const ProfileButton: React.FC<ProfileButtonProps> = ({}) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();

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
        {photo?.file ? (
          <Thumbnail
            url={photo.file}
            alt="profile picture"
            size={34}
            // radius={5}
          />
        ) : (
          <NoPhtoContainer>
            <Icomoon
              iconName="user"
              color={theme.colors.blue800}
              fontSize={22}
            />
          </NoPhtoContainer>
        )}
      </Button>
      <ClientProfilePopup isOpen={isPopupOpen} />
    </Container>
  );
};
