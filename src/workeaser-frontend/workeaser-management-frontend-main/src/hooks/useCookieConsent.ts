/**
 * useCookieConsent — hook React para LGPD cookie consent.
 * Sprint B (HF-SPRINT-B-05).
 *
 * Estados possíveis:
 *  - "unknown" — usuário nunca decidiu (mostrar banner)
 *  - "accepted" — aceitou cookies não-essenciais (analytics, marketing)
 *  - "rejected" — rejeitou opcionais (mantém só essenciais de sessão)
 *
 * Cookies essenciais (user-token via nookies) NÃO dependem desse consent —
 * são necessários pro app funcionar e estão amparados pela base legal
 * "execução de contrato" (LGPD Art. 7 V).
 *
 * O que depende de consent:
 *  - PostHog analytics
 *  - Sentry session replay
 *  - Marketing pixels (Meta, Google Ads — quando habilitar)
 */
import { useCallback, useEffect, useState } from "react";

export type ConsentState = "unknown" | "accepted" | "rejected";

const STORAGE_KEY = "workeaser_cookie_consent";
const STORAGE_VERSION = "1"; // bump quando política de cookies mudar — força re-consent
const STORAGE_VERSION_KEY = "workeaser_cookie_consent_version";

interface UseCookieConsentReturn {
  consent: ConsentState;
  /** true se o usuário aceitou cookies opcionais (analytics/marketing). */
  hasAcceptedOptional: boolean;
  /** Mostra banner? (false se já decidiu ou ainda em SSR) */
  shouldShowBanner: boolean;
  accept: () => void;
  reject: () => void;
  /** Limpa e força banner novamente (útil em "configurações de privacidade"). */
  reset: () => void;
}

function readStored(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (version !== STORAGE_VERSION) {
      // Política mudou — força re-consent
      localStorage.removeItem(STORAGE_KEY);
      return "unknown";
    }
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
    return "unknown";
  } catch {
    return "unknown";
  }
}

function writeStored(value: ConsentState) {
  if (typeof window === "undefined") return;
  try {
    if (value === "unknown") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_VERSION_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
      localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    }
  } catch {
    // localStorage indisponível (modo private etc) — silencioso
  }
}

export function useCookieConsent(): UseCookieConsentReturn {
  // Iniciar como "unknown" em SSR para evitar mismatch (server não vê localStorage)
  const [consent, setConsent] = useState<ConsentState>("unknown");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readStored());
  }, []);

  const accept = useCallback(() => {
    writeStored("accepted");
    setConsent("accepted");
    // Hook PostHog / Sentry init podem escutar evento custom
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("workeaser:consent", { detail: "accepted" }));
    }
  }, []);

  const reject = useCallback(() => {
    writeStored("rejected");
    setConsent("rejected");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("workeaser:consent", { detail: "rejected" }));
    }
  }, []);

  const reset = useCallback(() => {
    writeStored("unknown");
    setConsent("unknown");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("workeaser:consent", { detail: "unknown" }));
    }
  }, []);

  return {
    consent,
    hasAcceptedOptional: mounted && consent === "accepted",
    shouldShowBanner: mounted && consent === "unknown",
    accept,
    reject,
    reset,
  };
}
