/**
 * StripeCardForm — componente reutilizável de captura de cartão via Stripe Elements.
 * Sprint E (HF-SPRINT-E-01).
 *
 * Como funciona:
 *  1. Pai envolve em <Elements stripe={loadStripe(pk)}> </Elements>
 *  2. Componente renderiza <CardElement>
 *  3. Ao submit, chama stripe.createPaymentMethod() → devolve `pm_xxx`
 *  4. Pai recebe via callback onPaymentMethodId(pmId) e usa pra criar Subscription
 *
 * Segurança: dados do cartão NUNCA tocam nosso backend — Stripe processa tudo
 * via PCI-compliant iframe. Recebemos só o `pm_xxx` token opaco.
 */
import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

interface StripeCardFormProps {
  onPaymentMethodId: (pmId: string) => void | Promise<void>;
  disabled?: boolean;
  submitLabel?: string;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#222",
      "::placeholder": { color: "#999" },
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    invalid: { color: "#cf1322" },
  },
  hidePostalCode: false,
};

const containerStyle: React.CSSProperties = {
  padding: 16,
  border: "1px solid #d9d9d9",
  borderRadius: 4,
  background: "#fff",
  marginBottom: 12,
};

export function StripeCardForm({
  onPaymentMethodId,
  disabled,
  submitLabel = "Salvar cartão e continuar",
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!stripe || !elements) {
      setErr("Stripe ainda carregando, aguarde...");
      return;
    }
    const cardEl = elements.getElement(CardElement);
    if (!cardEl) {
      setErr("Formulário não pronto");
      return;
    }
    setBusy(true);
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardEl,
      });
      if (error) {
        setErr(error.message || "Cartão inválido");
        return;
      }
      if (!paymentMethod?.id) {
        setErr("Stripe não devolveu payment method id");
        return;
      }
      await onPaymentMethodId(paymentMethod.id);
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado ao processar cartão");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={containerStyle}>
        <CardElement options={cardElementOptions} />
      </div>
      {err && (
        <div
          role="alert"
          style={{ color: "#cf1322", background: "#fff1f0", padding: 12, borderRadius: 4, marginBottom: 12 }}
        >
          ⚠️ {err}
        </div>
      )}
      <button
        type="submit"
        disabled={busy || disabled || !stripe}
        style={{
          background: "#1677ff",
          color: "#fff",
          border: "none",
          padding: "12px 24px",
          borderRadius: 4,
          fontWeight: 600,
          cursor: busy || disabled || !stripe ? "not-allowed" : "pointer",
          opacity: busy || disabled ? 0.6 : 1,
          fontSize: 16,
        }}
      >
        {busy ? "Processando..." : submitLabel}
      </button>
    </form>
  );
}

export default StripeCardForm;
