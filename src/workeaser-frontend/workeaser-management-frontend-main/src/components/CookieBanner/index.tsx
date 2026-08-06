/**
 * CookieBanner — banner LGPD/GDPR cookie consent.
 * Sprint B (HF-SPRINT-B-06).
 *
 * Uso (em src/pages/_app.tsx):
 *   import { CookieBanner } from "@components/CookieBanner";
 *   ...
 *   <CookieBanner />
 *
 * Comportamento:
 *  - Renderiza só após mount (evita SSR hydration mismatch)
 *  - Mostra somente se usuário NÃO decidiu ainda
 *  - 2 botões: "Aceitar" / "Apenas essenciais"
 *  - Link "Saiba mais" → /privacy
 *  - Fixed bottom, z-index alto, mobile-friendly
 *  - Acessível: role="dialog", aria-label
 */
import React from "react";
import Link from "next/link";
import { useCookieConsent } from "@hooks/useCookieConsent";

const styles = {
  container: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: "#1a1a1a",
    color: "#ffffff",
    padding: "16px 24px",
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 99999,
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    fontSize: 14,
    lineHeight: 1.5,
  },
  message: {
    flex: "1 1 320px",
    minWidth: 0,
  },
  link: {
    color: "#4dabf7",
    textDecoration: "underline",
  },
  buttons: {
    display: "flex",
    gap: 12,
    flexShrink: 0,
  },
  buttonPrimary: {
    background: "#1677ff",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 4,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  buttonSecondary: {
    background: "transparent",
    color: "#cccccc",
    border: "1px solid #555",
    padding: "10px 20px",
    borderRadius: 4,
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 14,
  },
};

export function CookieBanner() {
  const { shouldShowBanner, accept, reject } = useCookieConsent();

  if (!shouldShowBanner) return null;

  return (
    <div role="dialog" aria-label="Aviso de cookies" style={styles.container}>
      <div style={styles.message}>
        <strong>Workeaser usa cookies.</strong>{" "}
        Cookies essenciais mantêm seu login. Cookies opcionais ajudam a melhorar
        o produto (analytics anônimos).{" "}
        <Link href="/privacy" passHref legacyBehavior>
          <a style={styles.link}>Saiba mais</a>
        </Link>
        .
      </div>
      <div style={styles.buttons}>
        <button
          type="button"
          style={styles.buttonSecondary}
          onClick={reject}
          aria-label="Aceitar apenas cookies essenciais"
        >
          Apenas essenciais
        </button>
        <button
          type="button"
          style={styles.buttonPrimary}
          onClick={accept}
          aria-label="Aceitar todos os cookies"
        >
          Aceitar todos
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
