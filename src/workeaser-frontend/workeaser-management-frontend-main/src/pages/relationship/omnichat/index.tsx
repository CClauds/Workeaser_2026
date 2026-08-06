import { ChatBalloon } from "@components/Chat/ChatBalloon";
import { ChatCard } from "@components/Chat/ChatCard";
import { ChatInfo } from "@components/Chat/ChatInfo";
import { ChatTextBox } from "@components/Chat/ChatTextBox";
import { PageHeader } from "@components/Headers/PageHeader";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import useIntervalAsync from "@hooks/useIntervalHook";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useCallback, useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { UserClient, UserCoworking, UserResponse } from "types/user";
import styles from "./styles.module.scss";
import { Chat, ChatMessage, MessagesResponse } from "./types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: "/login?expired=true",
        permanent: false,
      },
    };
  }
  const apiClient = getAPIClient(context);

  const { data: usersRes } = await apiClient.get<UserResponse>("/me");

  const user = usersRes ? usersRes.result[0] : null;
  const clientType = user.role === "COWORKING" ? "cowork" : "client";

  const chatsPromise = await apiClient.get<MessagesResponse<Chat[]>>(
    `/${clientType}/chats`
  );

  return {
    props: {
      user: usersRes.result[0],
      chats: chatsPromise.data.result,
    },
  };
};

interface OmnichatProps {
  user: UserCoworking & UserClient;
  chats: Chat[];
}
const Omnichat = ({ user, chats }: OmnichatProps) => {
  const [activeChat, setActiveChat] = useState<Partial<Chat>>();
  const [messages, setMessages] = useState<ChatMessage[]>();
  const router = useRouter();
  const clientType = user.role === "COWORKING" ? "cowork" : "client";
  const { chatId } = router.query;

  const getChatMessanges = useCallback(async () => {
    if (activeChat) {
      const { data } = await api.get<MessagesResponse<ChatMessage[]>>(
        `/${clientType}/chats/${activeChat.uuid}/messages`
      );
      setMessages(data.result);
    }
  }, [clientType, activeChat]);

  useEffect(() => {
    if (activeChat) {
      getChatMessanges();
    } else if (chatId) {
      const actualChat = chats.find((chat) => chat.uuid === chatId);
      setActiveChat(actualChat);
    } else {
      setActiveChat(chats?.length > 0 ? chats[0] : null);
    }
  }, [getChatMessanges, activeChat, chatId, chats]);

  const handleSendMessage = async (message: string) => {
    await api.post(`/${clientType}/chats/${activeChat.uuid}/messages`, {
      message,
    });
    getChatMessanges();
  };

  useIntervalAsync(getChatMessanges, 3000);

  const getMyPhoto = (clientType) =>
    clientType === "CLIENT"
      ? activeChat?.clientAccount?.companyPhoto?.file
      : activeChat?.coworkAccount?.photo?.file;

  const getMyCompanyName = (clientType) =>
    clientType === "CLIENT"
      ? activeChat?.clientAccount?.company_name
      : activeChat?.coworkAccount?.name;

  const RenderChatMessages = () => {
    return (
      <>
        {messages &&
          messages?.map((msg, index) => (
            <ChatBalloon
              key={index}
              user={{
                thumbnail: getMyPhoto(msg.sent_by) || "",
                name: getMyCompanyName(msg.sent_by),
              }}
              messageFromUser={msg.sent_by === clientType.toUpperCase()}
            >
              {msg.message}
            </ChatBalloon>
          ))}
      </>
    );
  };

  const RenderPageHeader = () => {
    if (clientType === "client") return null;

    return (
      <PageHeader>
        <div>
          <h1>
            <Link href="/relationship/dashboard">Relationship</Link>
          </h1>
          <h2>Omnichat</h2>
        </div>
      </PageHeader>
    );
  };

  return (
    <>
      <Head>
        <title>Omnichat | Workeaser</title>
      </Head>
      <RenderPageHeader />
      <div
        className={`${styles.container} ${
          clientType === "client" ? styles.client__layout : ""
        }`}
      >
        <div className={`${styles.conversations} ${styles[clientType]}`}>
          <header>
            <h1>List of Conversations:</h1>
          </header>

          <div>
            {chats.length > 0 ? (
              chats.map((chat) => (
                <ChatCard
                  key={chat.uuid}
                  name={
                    clientType === "client"
                      ? chat?.coworkAccount?.name
                      : chat?.clientAccount?.company_name
                  }
                  avatar={
                    clientType === "client"
                      ? chat?.coworkAccount?.photo?.file
                      : chat?.clientAccount?.companyPhoto?.file
                  }
                  onChatClick={() => setActiveChat(chat)}
                  isActive={chat.uuid === activeChat?.uuid}
                />
              ))
            ) : (
              <span>No conversations</span>
            )}
          </div>
        </div>

        <div className={styles.chat}>
          <div className={`${styles.messagesContainer} ${styles[clientType]}`}>
            <RenderChatMessages />
          </div>

          <ChatTextBox
            chatId={activeChat?.uuid}
            onSendMessage={handleSendMessage}
            avatar={getMyPhoto(clientType.toUpperCase())}
          />
        </div>

        {clientType === "cowork" && activeChat && (
          <ChatInfo
            userId={activeChat?.clientAccount?.user?.uuid}
            companyPhoto={
              activeChat && activeChat?.clientAccount?.companyPhoto?.file
            }
          />
        )}
      </div>
    </>
  );
};

Omnichat.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  const {
    props: {
      children: { props },
    },
  } = page;
  const { user } = props;

  if (user?.role === "CLIENT") {
    return <ClientLayout componentProps={componentProps}>{page}</ClientLayout>;
  }

  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default Omnichat;
