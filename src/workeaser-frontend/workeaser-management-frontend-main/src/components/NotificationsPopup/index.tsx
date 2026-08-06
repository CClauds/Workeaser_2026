import { PopupCard } from "@components/PopupCard";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { useOutsideClick } from "hooks/useOutsideClick";
import { useRouter } from "next/router";
import React, { MutableRefObject, useRef } from "react";
import { NotificationsResponse } from "types";
import { Container } from "./styles";

interface NotificationsPopupProps {
  isOpen: boolean;
  onRequestClose: () => void;
  buttonRef: MutableRefObject<HTMLButtonElement>;
}

/**
 * HF-SPRINT-J-01: integração com endpoints mark-as-read (HF-SPRINT-H-05).
 *  - Click em notification: marca como lida + redireciona pro deep_link em data
 *  - Botão "Marcar todas como lidas" no header do popup
 */
function parseData(data: unknown): Record<string, unknown> | null {
  if (!data) return null;
  if (typeof data === "object") return data as Record<string, unknown>;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

function getDeepLink(notification: any): string | null {
  const d = parseData(notification?.data);
  if (!d) return null;
  if (typeof d.deep_link === "string") return d.deep_link;
  if (typeof d.url === "string") return d.url;
  return null;
}

export const NotificationsPopup: React.FC<NotificationsPopupProps> = ({
  isOpen,
  onRequestClose,
  buttonRef,
}) => {
  const router = useRouter();
  const { data: { result: notifications, pagination } = {}, mutate } =
    useFetch<NotificationsResponse>(`/notifications?page=${1}`);
  // HF-SPRINT-J-01: revalida o count global (badge no Header) quando marca como lida
  const { mutate: mutateCount } = useFetch<{ result: { total: number } }>(
    "/notifications/count"
  );

  const wrapperRef = useRef(null);
  useOutsideClick({
    ref: wrapperRef,
    extraRef: buttonRef,
    callback: onRequestClose,
  });

  const handleNotificationDelete = async (id: number) => {
    mutate(
      {
        result: notifications.filter((notification) => notification.id !== id),
        pagination,
      },
      false
    );
    await api.delete(`/notifications/${id}`);
    mutate();
    mutateCount();
  };

  // HF-SPRINT-J-01: marca como lida + deep_link redirect
  const handleNotificationClick = async (notification: any) => {
    if (!notification?.id) return;
    try {
      // Otimista: atualiza UI ANTES da API responder
      mutate(
        {
          result: notifications.map((n: any) =>
            n.id === notification.id ? { ...n, is_new: false } : n
          ),
          pagination,
        },
        false
      );
      await api.post(`/notifications/${notification.id}/read`);
      mutate();
      mutateCount();
    } catch {
      // Silent — UX não regride
    }
    const link = getDeepLink(notification);
    if (link) {
      onRequestClose();
      router.push(link);
    }
  };

  // HF-SPRINT-J-01: marca todas como lidas
  const handleMarkAllRead = async () => {
    try {
      mutate(
        {
          result: notifications.map((n: any) => ({ ...n, is_new: false })),
          pagination,
        },
        false
      );
      await api.post("/notifications/read-all");
      mutate();
      mutateCount();
    } catch {
      mutate(); // revalida em caso de falha
    }
  };

  const hasUnread = notifications?.some((n: any) => n.is_new);

  return (
    <Container ref={wrapperRef} isOpen={isOpen}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Notifications</h1>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            style={{
              background: "transparent",
              border: "none",
              color: "#1677ff",
              fontSize: 12,
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Marcar todas como lidas
          </button>
        )}
      </header>

      <section>
        {notifications?.map((notification: any) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            onKeyDown={(e) => e.key === "Enter" && handleNotificationClick(notification)}
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer" }}
          >
            <PopupCard
              id={notification.id}
              type="notification"
              avatarUrl={notification.photo}
              title={notification.title}
              message={notification.message}
              time={notification.created_at}
              isNew={notification.is_new}
              onDelete={handleNotificationDelete}
            />
          </div>
        ))}
        {(!notifications || notifications.length === 0) && (
          <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 13 }}>
            Você está em dia. Nenhuma notificação por enquanto.
          </div>
        )}
      </section>
    </Container>
  );
};
