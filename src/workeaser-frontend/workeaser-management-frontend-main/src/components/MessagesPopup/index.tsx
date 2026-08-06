import { Button } from "@components/Button";
import { PopupCard } from "@components/PopupCard";
import { useFetch } from "@hooks/useFetch";
import { useOutsideClick } from "hooks/useOutsideClick";
import { useRouter } from "next/router";
import {
  LastMessages,
  MessagesResponse,
} from "pages/relationship/omnichat/types";
import React, { MutableRefObject, useContext, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Container } from "./styles";
import { AuthContext } from "@contexts/AuthContext";

interface MessagesPopupProps {
  isOpen: boolean;
  onRequestClose: () => void;
  buttonRef: MutableRefObject<HTMLButtonElement>;
}

type ClientType = "cowork" | "client";

interface MessageProps {
  name: string;
  avatar: string;
}

export const MessagesPopup: React.FC<MessagesPopupProps> = ({
  isOpen,
  onRequestClose,
  buttonRef,
}) => {
  const { user } = useContext(AuthContext);
  let clientType: ClientType = null;
  if (user) {
    clientType = user.role === "COWORKING" ? "cowork" : "client";
  }

  const router = useRouter();
  const wrapperRef = useRef(null);

  useOutsideClick({
    ref: wrapperRef,
    extraRef: buttonRef,
    callback: onRequestClose,
  });

  const { data: { result: messagesData } = {}, isLoading } = useFetch<
    MessagesResponse<LastMessages[]>
  >(clientType ? `/${clientType}/chats/lastmessages` : null);

  const handleChatClick = (chatId: string) => {
    onRequestClose();
    router.push({
      pathname: "/relationship/omnichat",
      query: { chatId },
    });
  };

  const handleButtonClick = () => {
    onRequestClose();
    router.push("/relationship/omnichat");
  };

  const getMessageProps = (message: LastMessages): MessageProps => {
    switch (clientType) {
      case "client":
        return {
          name: message?.chat?.coworkAccount?.name,
          avatar: message?.chat?.coworkAccount?.photo?.file,
        };
      case "cowork":
        return {
          name: message?.chat?.clientAccount?.company_name,
          avatar: message?.chat?.clientAccount?.companyPhoto?.file,
        };
    }
  };

  const RenderMessages = () => {
    if (isLoading) {
      return (
        <>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <Skeleton width="100%" height={70} />
            </div>
          ))}
        </>
      );
    }

    if (!messagesData || !messagesData.length) {
      return <h2>No messages</h2>;
    }

    return (
      <>
        {messagesData.map((message, index) => (
          <PopupCard
            key={index}
            type="message"
            title={getMessageProps(message).name || "Not defined"}
            message={message.message}
            time={message.created_at}
            avatarUrl={getMessageProps(message).avatar}
            isNew={false}
            onMessageClick={() => handleChatClick(message.chat.uuid)}
          />
        ))}
      </>
    );
  };

  return (
    <Container ref={wrapperRef} isOpen={isOpen}>
      <header>
        <h1>Last Messages</h1>
        {/* <div>
          <p>
            <strong>02 </strong>
            Unread Chats
          </p>
        </div> */}
      </header>

      <section>
        <RenderMessages />
      </section>

      <footer>
        <Button text="VIEW IN THE MESSENGER" onClick={handleButtonClick} />
      </footer>
    </Container>
  );
};
