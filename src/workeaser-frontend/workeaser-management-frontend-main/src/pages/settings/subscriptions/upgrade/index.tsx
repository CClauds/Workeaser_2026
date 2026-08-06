/**
 * /settings/subscriptions/upgrade — HF-SPRINT-D-10 + HF-SPRINT-E-02 (card flow ativo).
 *
 * Fluxos:
 *  PIX: POST /api/cowork/subscriptions { plan_id, use_pix:true } → redirect checkoutUrl
 *  Card: Stripe Elements captura cartão → pm_id → POST { plan_id, payment_method_id }
 *        → se requer 3DS: stripe.confirmCardPayment(clientSecret) → confirma
 */
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe as StripeJs } from "@stripe/stripe-js";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { StripeCardForm } from "@components/StripeCardForm";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface PlanFeatures {
  max_locations?: number;
  max_members?: number;
  whatsapp_included?: boolean;
  ai_support?: boolean;
  custom_branding?: boolean;
  [k: string]: unknown;
}

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  currency: string;
  amount_cents: number;
  interval: "monthly" | "yearly";
  features: PlanFeatures | null;
}

interface UpgradePageProps {
  initialPlans: Plan[];
  loadError: string | null;
  stripePk: string | null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return { redirect: { destination: "/login?expired=true", permanent: false } };
  }
  try {
    const api = getAPIClient(context);
    const { data } = await api.get("/cowork/subscriptions/plans");
    return {
      props: {
        initialPlans: data?.result || [],
        loadError: null,
        stripePk: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || null,
      },
    };
  } catch (err: any) {
    return {
      props: {
        initialPlans: [],
        loadError:
          err?.response?.data?.error?.message ||
          "Não consegui carregar os planos. Tente novamente em alguns segundos.",
        stripePk: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || null,
      },
    };
  }
};

const formatPrice = (cents: number, currency: string) => {
  const value = (cents || 0) / 100;
  if (currency === "BRL") return `R$ ${value.toFixed(2).replace(".", ",")}`;
  return `${currency} ${value.toFixed(2)}`;
};

function PlanCard({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
  const f = plan.features || {};
  const featureLines = [
    `Locais: ${f.max_locations === -1 ? "ilimitado" : f.max_locations ?? "-"}`,
    `Membros: ${f.max_members === -1 ? "ilimitado" : f.max_members ?? "-"}`,
    f.whatsapp_included ? "✓ WhatsApp" : "✗ WhatsApp",
    f.ai_support ? "✓ IA de suporte" : "✗ IA",
    f.custom_branding ? "✓ White-label" : "✗ Branding fixo",
  ];
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      style={{
        border: selected ? "2px solid #1677ff" : "1px solid #d9d9d9",
        borderRadius: 8,
        padding: 24,
        cursor: "pointer",
        background: selected ? "#e6f7ff" : "#fff",
        flex: "1 1 280px",
        minWidth: 0,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 20 }}>{plan.name}</h3>
      <p style={{ color: "#666", marginTop: 4, marginBottom: 16 }}>{plan.description}</p>
      <div style={{ fontSize: 28, fontWeight: 700 }}>
        {formatPrice(plan.amount_cents, plan.currency)}
        <span style={{ fontSize: 14, fontWeight: 400, color: "#666" }}>
          /{plan.interval === "yearly" ? "ano" : "mês"}
        </span>
      </div>
      <ul style={{ marginTop: 16, paddingLeft: 18, color: "#444", fontSize: 14 }}>
        {featureLines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

type PaymentMethod = "pix" | "card";

// HF-SPRINT-I-06: estado do cupom
interface DiscountValidation {
  valid: boolean;
  reason?: string;
  discount_cents?: number;
  final_price_cents?: number;
}

const UpgradePage = ({ initialPlans, loadError, stripePk }: UpgradePageProps) => {
  const [plans] = useState<Plan[]>(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [submittingPix, setSubmittingPix] = useState(false);
  // HF-SPRINT-I-06: estado do discount code
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidation, setDiscountValidation] = useState<DiscountValidation | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) setSelectedPlanId(plans[1]?.id ?? plans[0].id);
  }, [plans]);

  // Re-valida cupom quando plano muda (cupom pode não se aplicar a outros planos)
  useEffect(() => {
    if (discountValidation && discountCode && selectedPlanId) {
      void validateDiscount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId]);

  const validateDiscount = async () => {
    if (!discountCode.trim() || !selectedPlanId) {
      setDiscountValidation(null);
      return;
    }
    setValidatingDiscount(true);
    try {
      const api = getAPIClient();
      const { data } = await api.get("/cowork/subscriptions/validate-discount", {
        params: { code: discountCode.trim(), plan_id: selectedPlanId },
      });
      setDiscountValidation(data?.result || null);
    } catch (err: any) {
      setDiscountValidation({
        valid: false,
        reason: err?.response?.data?.error?.message || "Falha ao validar cupom",
      });
    } finally {
      setValidatingDiscount(false);
    }
  };

  const stripePromise: Promise<StripeJs | null> = useMemo(() => {
    if (!stripePk) return Promise.resolve(null);
    return loadStripe(stripePk);
  }, [stripePk]);

  const handlePix = async () => {
    if (!selectedPlanId) return toast.warn("Selecione um plano");
    setSubmittingPix(true);
    try {
      const api = getAPIClient();
      const { data } = await api.post("/cowork/subscriptions", {
        plan_id: selectedPlanId,
        use_pix: true,
        // HF-SPRINT-I-06: passa cupom se validado
        ...(discountValidation?.valid && discountCode.trim()
          ? { discount_code: discountCode.trim() }
          : {}),
      });
      const url = data?.result?.checkoutUrl;
      if (url) {
        toast.info("Redirecionando para pagamento PIX...");
        window.location.href = url;
        return;
      }
      toast.error("Stripe não devolveu URL de checkout");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao iniciar pagamento PIX");
    } finally {
      setSubmittingPix(false);
    }
  };

  // HF-SPRINT-E-02: card flow real via Stripe Elements
  const handleCardPaymentMethodId = async (pmId: string) => {
    if (!selectedPlanId) {
      toast.warn("Selecione um plano");
      return;
    }
    try {
      const api = getAPIClient();
      const { data } = await api.post("/cowork/subscriptions", {
        plan_id: selectedPlanId,
        payment_method_id: pmId,
        // HF-SPRINT-I-06: passa cupom se validado
        ...(discountValidation?.valid && discountCode.trim()
          ? { discount_code: discountCode.trim() }
          : {}),
      });
      const result = data?.result;
      if (result?.clientSecret) {
        // Cartão exige 3DS → confirmar
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe não carregou");
        const { error } = await stripe.confirmCardPayment(result.clientSecret);
        if (error) {
          toast.error(`3DS falhou: ${error.message}`);
          return;
        }
      }
      toast.success("Assinatura criada com sucesso!");
      setTimeout(() => {
        window.location.href = "/settings/subscriptions";
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao criar assinatura");
    }
  };

  return (
    <>
      <Head>
        <title>Mudar plano | Workeaser</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 8 }}>Escolha seu plano</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>
          14 dias grátis em qualquer plano. Cancele a qualquer momento, sem multa.
        </p>

        {loadError && (
          <div role="alert" style={{ background: "#fff1f0", padding: 16, borderRadius: 8, marginBottom: 24 }}>
            ⚠️ {loadError}
          </div>
        )}

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              selected={selectedPlanId === p.id}
              onSelect={() => setSelectedPlanId(p.id)}
            />
          ))}
        </div>

        {/* HF-SPRINT-I-06: campo cupom de desconto */}
        {plans.length > 0 && (
          <div style={{ background: "#fff", padding: 16, borderRadius: 8, marginBottom: 16, border: "1px solid #e8e8e8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>🎟️ Cupom de desconto:</label>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value.toUpperCase());
                  setDiscountValidation(null);
                }}
                onBlur={() => discountCode.trim() && validateDiscount()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    validateDiscount();
                  }
                }}
                placeholder="ABRIL30"
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 14,
                  textTransform: "uppercase",
                  flex: "1 1 200px",
                }}
              />
              <button
                type="button"
                onClick={validateDiscount}
                disabled={validatingDiscount || !discountCode.trim()}
                style={{
                  background: "transparent",
                  color: "#1677ff",
                  border: "1px solid #1677ff",
                  padding: "8px 16px",
                  borderRadius: 4,
                  cursor: validatingDiscount ? "wait" : "pointer",
                }}
              >
                {validatingDiscount ? "Validando..." : "Aplicar"}
              </button>
            </div>
            {discountValidation && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 4,
                  background: discountValidation.valid ? "#f6ffed" : "#fff1f0",
                  border: `1px solid ${discountValidation.valid ? "#b7eb8f" : "#ffa39e"}`,
                  fontSize: 14,
                }}
              >
                {discountValidation.valid ? (
                  <>
                    ✅ <strong>Cupom válido!</strong> Desconto:{" "}
                    {((discountValidation.discount_cents || 0) / 100).toFixed(2)}{" "}
                    {plans.find((p) => p.id === selectedPlanId)?.currency || "USD"}
                    {". Valor final: "}
                    <strong>
                      {((discountValidation.final_price_cents || 0) / 100).toFixed(2)}{" "}
                      {plans.find((p) => p.id === selectedPlanId)?.currency || "USD"}
                    </strong>
                  </>
                ) : (
                  <>❌ {discountValidation.reason || "Cupom inválido"}</>
                )}
              </div>
            )}
          </div>
        )}

        {plans.length > 0 && (
          <div style={{ background: "#fafafa", padding: 24, borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Método de pagamento</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ marginRight: 24, cursor: "pointer" }}>
                <input
                  type="radio"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                  style={{ marginRight: 8 }}
                />
                Cartão de crédito
              </label>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  checked={method === "pix"}
                  onChange={() => setMethod("pix")}
                  style={{ marginRight: 8 }}
                />
                PIX (Brasil)
              </label>
            </div>

            {method === "card" ? (
              stripePk ? (
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    onPaymentMethodId={handleCardPaymentMethodId}
                    submitLabel="Pagar e ativar plano"
                  />
                </Elements>
              ) : (
                <div style={{ color: "#cf1322", padding: 12, background: "#fff1f0", borderRadius: 4 }}>
                  Stripe não configurado (NEXT_PUBLIC_STRIPE_PUBLIC_KEY ausente no .env).
                  Use PIX por enquanto.
                </div>
              )
            ) : (
              <>
                <p style={{ color: "#666" }}>Pagamento via QR Code Pix. Você será redirecionado.</p>
                <button
                  type="button"
                  onClick={handlePix}
                  disabled={submittingPix || !selectedPlanId}
                  style={{
                    background: "#1677ff",
                    color: "#fff",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: submittingPix ? "not-allowed" : "pointer",
                    opacity: submittingPix ? 0.6 : 1,
                  }}
                >
                  {submittingPix ? "Redirecionando..." : "Pagar com Pix"}
                </button>
              </>
            )}

            <p style={{ color: "#666", fontSize: 12, marginTop: 12 }}>
              Workeaser nunca tem acesso aos dados do seu cartão — tudo processado pela Stripe (PCI-DSS).
            </p>
          </div>
        )}
      </div>
    </>
  );
};

(UpgradePage as any).authRoles = ["COWORKING"];
(UpgradePage as any).getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <SettingsLayout>{page}</SettingsLayout>
  </CoworkingLayout>
);

export default UpgradePage;
