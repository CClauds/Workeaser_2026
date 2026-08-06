import { CloseButton } from "@components/Button/CloseButton";
import { ChatAvatar } from "@components/Chat/ChatAvatar";
import { formatTime } from "@utils/numberFormat";
import React from "react";
import { Container, MessageContainer, TitleRow } from "./styles";

interface PopupCardProps {
  id?: number;
  type: "notification" | "message";
  title: string;
  message: string;
  time: string;
  avatarUrl: string;
  isNew: boolean;
}
interface PopupCardNotificationProps extends PopupCardProps {
  type: "notification";
  onDelete: (id: number) => void;
  onMessageClick?: never;
}
interface PopupCardMessageProps extends PopupCardProps {
  type: "message";
  onDelete?: never;
  onMessageClick: () => void;
}

export const PopupCard: React.FC<
  PopupCardNotificationProps | PopupCardMessageProps
> = ({
  id,
  type,
  title,
  message,
  time,
  avatarUrl,
  isNew,
  onDelete,
  onMessageClick,
}) => {
  const RenderCloseButton = () => {
    if (type === "message") {
      return null;
    }

    return (
      <CloseButton onClick={() => onDelete(id)} className="close__button" />
    );
  };

  const handleClick = () => {
    if (type === "notification") {
      return;
    }

    onMessageClick();
  };

  return (
    <Container
      isNew={isNew}
      isClickable={type === "message"}
      onClick={handleClick}
    >
      <ChatAvatar url={avatarUrl} alt="avatar" size={40} />

      <div className="infos">
        <section>
          <TitleRow>
            <h2>{title}</h2>

            <time>{formatTime(time)}</time>
          </TitleRow>
          <MessageContainer>
            <p>{message}</p>
          </MessageContainer>
        </section>
      </div>

      <RenderCloseButton />
    </Container>
  );
};
