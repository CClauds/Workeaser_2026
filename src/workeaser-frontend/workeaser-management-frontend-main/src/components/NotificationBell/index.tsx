/**
 * NotificationBell — sino com badge de não-lidas + dropdown com últimas N.
 * Sprint H (HF-SPRINT-H-06).
 *
 * ⚠️ DEPRECATED (HF-SPRINT-J-01): Header.tsx já tem `<NotificationsPopup>` montado
 * com badge via `useFetch("/notifications/count")`. Foi estendido no Sprint J pra usar
 * os mesmos endpoints (mark-as-read + mark-all-read) que este componente.
 *
 * Mantido aqui como referência de implementação standalone (caso queira usar fora dos
 * layouts que já têm Header — ex: app mobile, embed, página pública futura).
 * Para o app principal use NotificationsPopup via Header.
 *
 * Comportamento:
 *  - Polling a cada 60s do count de não-lidas
 *  - Click no sino abre dropdown com últimas 10 notifications
 *  - Click em 1 notification: marca como lida + redireciona pra deep link (se houver em metadata)
 *  - Botão "Marcar todas como lidas"
 *
 * Mount: adicionar no header do layout (Sidebar.tsx ou CoworkingLayout)
 *   <NotificationBell />
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getAPIClient } from "@services/apiClient";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
  data?: Record<string, unknown> | string | null;
}

const POLL_INTERVAL_MS = 60_000;
const MAX_PREVIEW = 10;

function getDeepLink(data: Notification["data"]): string | null {
  if (!data) return null;
  let obj: Record<string, unknown>;
  if (typeof data === "string") {
    try {
      obj = JSON.parse(data);
    } catch {
      return null;
    }
  } else {
    obj = data;
  }
  if (typeof obj?.deep_link === "string") return obj.deep_link;
  if (typeof obj?.url === "string") return obj.url;
  return null;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function NotificationBell() {
  const [count, setCount] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(async () => {
    try {
      const api = getAPIClient();
      const { data } = await api.get("/notifications/count");
      const c = typeof data?.result === "number" ? data.result : data?.result?.count ?? 0;
      setCount(Number(c) || 0);
    } catch {
      // silent
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const { data } = await api.get("/notifications?page=1");
      const list: Notification[] = data?.result || [];
      setItems(list.slice(0, MAX_PREVIEW));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling do count
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchCount]);

  // Carrega items quando abrir
  useEffect(() => {
    if (open) fetchItems();
  }, [open, fetchItems]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleItemClick = async (n: Notification) => {
    if (!n.read_at) {
      try {
        const api = getAPIClient();
        await api.post(`/notifications/${n.id}/read`);
        setItems((prev) =>
          prev.map((i) => (i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i))
        );
        fetchCount();
      } catch {
        // silent
      }
    }
    const link = getDeepLink(n.data);
    if (link) {
      setOpen(false);
      router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const api = getAPIClient();
      await api.post("/notifications/read-all");
      setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at || new Date().toISOString() })));
      setCount(0);
    } catch {
      // silent
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificações ${count > 0 ? `(${count} não lidas)` : ""}`}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          position: "relative",
          padding: 8,
        }}
      >
        🔔
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "#ff4d4f",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: 12,
              minWidth: 18,
              textAlign: "center",
            }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificações"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            width: 360,
            maxWidth: "90vw",
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 8,
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            zIndex: 99999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>Notificações</strong>
            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#1677ff",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 16, textAlign: "center", color: "#999" }}>Carregando...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 13 }}>
              Você está em dia. Nenhuma notificação por enquanto.
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  onKeyDown={(e) => e.key === "Enter" && handleItemClick(n)}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    background: n.read_at ? "#fff" : "#e6f7ff",
                    transition: "background 0.1s",
                  }}
                >
                  <div
                    style={{ fontWeight: n.read_at ? 400 : 600, fontSize: 14, marginBottom: 4 }}
                  >
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                    {timeAgo(n.created_at)} atrás
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid #f0f0f0", padding: "8px 16px", textAlign: "center" }}>
            <a
              href="/notifications"
              style={{ color: "#1677ff", fontSize: 12, textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              Ver todas →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
