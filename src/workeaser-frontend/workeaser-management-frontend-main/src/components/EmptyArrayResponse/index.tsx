/**
 * Sprint K (HF-SPRINT-K-03) — EmptyArrayResponse com CTA opcional.
 *
 * Antes: <h1>No {item} found.</h1> (genérico, em inglês, sem ação)
 * Agora:
 *   - Texto em PT-BR ("Nenhum X encontrado")
 *   - Aceita props opcionais pra CTA: title, description, ctaLabel, onCta OR ctaHref, icon
 *   - **100% retrocompatível**: chamadas antigas `<EmptyArrayResponse item="locations" />`
 *     continuam funcionando (só ficam mais bonitas, sem CTA)
 *
 * Exemplo novo (com CTA):
 *   <EmptyArrayResponse
 *     item="locations"
 *     icon="🏢"
 *     title="Sem locais cadastrados"
 *     description="Crie sua 1ª filial pra começar a receber reservas e cobrar mensalidades."
 *     ctaLabel="Criar primeiro local →"
 *     ctaHref="/locations/create"
 *   />
 */
import React from "react";
import Link from "next/link";
import { Container } from "./styles";

export interface EmptyArrayResponseProps {
  /** Nome do item (modo legado). Ex: "locations", "invoices" */
  item: string;
  /** Ícone emoji opcional (default: 📭) */
  icon?: string;
  /** Título customizado em PT-BR. Se omitido, usa traduções built-in pra `item` comum */
  title?: string;
  /** Descrição secundária (motiva ação) */
  description?: string;
  /** Texto do botão CTA */
  ctaLabel?: string;
  /** Se href: vira <Link>. Se onClick: vira <button>. Se ambos omitidos: sem CTA */
  ctaHref?: string;
  ctaOnClick?: () => void;
}

// Traduções built-in pros itens mais comuns (UX consistente sem precisar passar title sempre)
const ITEM_TRANSLATIONS: Record<string, string> = {
  locations: "Nenhum local cadastrado",
  invoices: "Nenhuma fatura ainda",
  bookings: "Nenhuma reserva",
  contracts: "Nenhum contrato",
  members: "Nenhum membro",
  clients: "Nenhum cliente",
  leads: "Nenhum lead",
  rooms: "Nenhuma sala",
  desks: "Nenhuma mesa",
  meetings: "Nenhuma reunião",
  meetrooms: "Nenhuma sala de reunião",
  taxes: "Nenhum imposto",
  services: "Nenhum serviço",
  amenities: "Nenhuma comodidade",
  notifications: "Você está em dia",
  reports: "Nenhum relatório disponível",
  subscriptions: "Nenhuma assinatura ativa",
  partners: "Nenhum parceiro",
  coworkings: "Nenhum coworking",
};

export const EmptyArrayResponse: React.FC<EmptyArrayResponseProps> = ({
  item,
  icon = "📭",
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaOnClick,
}) => {
  const computedTitle =
    title || ITEM_TRANSLATIONS[item.toLowerCase()] || `Nenhum ${item} encontrado`;

  const ctaButton = ctaLabel ? (
    ctaHref ? (
      <Link
        href={ctaHref}
        style={{
          display: "inline-block",
          padding: "10px 22px",
          background: "#1677ff",
          color: "#fff",
          borderRadius: 6,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
          marginTop: 20,
        }}
      >
        {ctaLabel}
      </Link>
    ) : ctaOnClick ? (
      <button
        type="button"
        onClick={ctaOnClick}
        style={{
          padding: "10px 22px",
          background: "#1677ff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 14,
          marginTop: 20,
          cursor: "pointer",
        }}
      >
        {ctaLabel}
      </button>
    ) : null
  ) : null;

  return (
    <Container>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "40px 20px",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            fontSize: 56,
            lineHeight: 1,
            marginBottom: 16,
            opacity: 0.85,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1a1a1a",
            margin: 0,
            marginBottom: description ? 8 : 0,
          }}
        >
          {computedTitle}
        </h2>
        {description && (
          <p
            style={{
              fontSize: 14,
              color: "#737373",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 360,
            }}
          >
            {description}
          </p>
        )}
        {ctaButton}
      </div>
    </Container>
  );
};

export default EmptyArrayResponse;
