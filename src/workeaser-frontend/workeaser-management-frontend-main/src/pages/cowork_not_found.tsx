/**
 * HF-SPRINT-O — i18n PT-BR + UX (era so um texto solto sem layout).
 */
import React from "react";
import Head from "next/head";
import Link from "next/link";

const CoworkNotFound = () => {
  return (
    <>
      <Head>
        <title>Workeaser — Coworking não encontrado</title>
      </Head>
      <main
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          background: "#fafafa",
          color: "#1a1a1a",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🏢❌</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px" }}>
            Coworking não encontrado
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#525252",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Sua conta não está associada a nenhum coworking ativo. Se você é
            dono de cowork, crie sua conta. Se você é membro, peça pro
            administrador do seu cowork te enviar um convite.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              href="/login"
              style={{
                padding: "12px 24px",
                border: "1px solid #1a1a1a",
                color: "#1a1a1a",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Voltar pro login
            </Link>
            <Link
              href="/create-account"
              style={{
                padding: "12px 24px",
                background: "#0369a1",
                color: "#fff",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Criar conta grátis →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default CoworkNotFound;
