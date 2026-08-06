/**
 * SlackNotificationService — webhook notifications pra Slack / Discord / Mattermost.
 * Sprint F (HF-SPRINT-F-07).
 *
 * Por que existe:
 *  - Saber quando coisa boa aconteceu (new subscription) sem precisar olhar dashboard
 *  - Saber quando coisa ruim aconteceu (SEV-1 error, churn, large refund) IMEDIATAMENTE
 *  - Substituir "abrir 5 abas a cada hora" por "ler mensagem quando chega"
 *
 * Setup (env):
 *  - SLACK_WEBHOOK_URL_GENERAL  — eventos comerciais (new sub, churn, milestones)
 *  - SLACK_WEBHOOK_URL_ALERTS   — alertas operacionais (SEV-1, payment_failed pico, etc.)
 *  - SLACK_WEBHOOK_URL_FINANCE  — eventos financeiros (large refund, chargeback)
 *
 * Format compatível com Slack E Discord (ambos aceitam payload simples `{ text }`).
 * Para mensagens ricas usa Slack Block Kit (Discord ignora silenciosamente — degrada bem).
 *
 * Fire-and-forget: erro nunca propaga.
 */
import axios from 'axios';
import Logger from '@ioc:Adonis/Core/Logger';

export type SlackChannel = 'general' | 'alerts' | 'finance';

export interface SlackBlock {
  type: string;
  [k: string]: unknown;
}

export interface SlackMessage {
  channel?: SlackChannel; // default 'general'
  text: string; // fallback pra mobile / Discord
  emoji?: string; // ex: ':tada:' ou ':warning:'
  blocks?: SlackBlock[]; // Slack Block Kit (rico)
}

const TIMEOUT_MS = 5000;

class SlackNotificationServiceClass {
  private getUrl(channel: SlackChannel): string | null {
    const map: Record<SlackChannel, string> = {
      general: process.env.SLACK_WEBHOOK_URL_GENERAL || '',
      alerts: process.env.SLACK_WEBHOOK_URL_ALERTS || '',
      finance: process.env.SLACK_WEBHOOK_URL_FINANCE || '',
    };
    return map[channel] || null;
  }

  /** Envia mensagem genérica. Fire-and-forget. */
  public async send(msg: SlackMessage): Promise<void> {
    const channel = msg.channel || 'general';
    const url = this.getUrl(channel);
    if (!url) {
      // Sem webhook configurado: noop silencioso
      return;
    }

    const emoji = msg.emoji || '';
    const text = emoji ? `${emoji} ${msg.text}` : msg.text;

    const payload: Record<string, unknown> = { text };
    if (msg.blocks) payload.blocks = msg.blocks;

    try {
      await axios.post(url, payload, {
        timeout: TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      // Não bloqueia caller — log warning
      Logger.warn({ err, channel }, 'Slack webhook delivery falhou (não propaga)');
    }
  }

  // ───── Helpers semânticos ─────

  public newSubscription(planCode: string, currency: string, mrrCents: number) {
    return this.send({
      channel: 'general',
      emoji: ':tada:',
      text: `Nova assinatura! Plano *${planCode}* (${currency} ${(mrrCents / 100).toFixed(2)}/mês)`,
    });
  }

  public subscriptionCanceled(planCode: string, atPeriodEnd: boolean) {
    return this.send({
      channel: 'general',
      emoji: ':wave:',
      text: `Cancelamento do plano *${planCode}* ${atPeriodEnd ? '(ao fim do período)' : '(imediato)'}`,
    });
  }

  public paymentFailed(invoiceId: number, amountCents: number, currency: string) {
    return this.send({
      channel: 'alerts',
      emoji: ':warning:',
      text: `Pagamento falhou: invoice #${invoiceId} - ${currency} ${(amountCents / 100).toFixed(2)}`,
    });
  }

  public largeRefund(amountCents: number, currency: string, invoiceId: number) {
    return this.send({
      channel: 'finance',
      emoji: ':money_with_wings:',
      text: `Refund grande: ${currency} ${(amountCents / 100).toFixed(2)} (invoice #${invoiceId})`,
    });
  }

  public severeError(title: string, detail: string) {
    return this.send({
      channel: 'alerts',
      emoji: ':rotating_light:',
      text: `*SEV-1*: ${title}\n\`\`\`${detail.slice(0, 800)}\`\`\``,
    });
  }

  public newSignup(coworkName: string, plan: string) {
    return this.send({
      channel: 'general',
      emoji: ':seedling:',
      text: `Novo cowork cadastrado: *${coworkName}* (interesse: ${plan})`,
    });
  }

  public bounceComplaintSpike(count: number, period: string) {
    return this.send({
      channel: 'alerts',
      emoji: ':mailbox_with_no_mail:',
      text: `Spike de bounce/complaint: ${count} ocorrências em ${period}. Investigar reputação SES.`,
    });
  }
}

export const SlackNotificationService = new SlackNotificationServiceClass();
export default SlackNotificationService;
