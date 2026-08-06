/**
 * Sprint L (HF-SPRINT-L-02) — Sequencia de emails de onboarding pos-signup.
 *
 * Quando rodar: chamar `OnboardingEmailService.scheduleSequence(user)` UMA vez,
 * idealmente apos email confirmation bem-sucedido.
 *
 * Sequencia (3 emails):
 *   1. Welcome (dia 0)  -> imediato
 *   2. Dica de uso (dia 3) -> scheduleAt = now + 3 days
 *   3. Check-in (dia 7) -> scheduleAt = now + 7 days
 *
 * Idempotente: usa `relatedType = 'onboarding_sequence_v1'` + `relatedId = user.id` pra
 * checar se ja foi enfileirado antes (evita duplicar se signup confirmar 2x).
 *
 * Como cancela:
 *   - Se user deletar conta antes de receber: EmailQueueService nao envia emails pra
 *     users com `email_bouncing=true` OU `email_complaint=true` (HF-SPRINT-D-03)
 *   - Se quiser cancelar manualmente: `EmailQueueItem.query()
 *       .where('related_type', 'onboarding_sequence_v1')
 *       .where('related_user_id', userId)
 *       .where('status', 'pending')
 *       .update({ status: 'canceled' })`
 *
 * Cada email aponta pra app.workeaser.com/dashboard ou /onboarding (depende do step).
 */
import { DateTime } from 'luxon';
import Env from '@ioc:Adonis/Core/Env';
import Logger from '@ioc:Adonis/Core/Logger';
import EmailQueueService from 'App/Services/EmailQueueService';
import EmailQueueItem from 'App/Models/EmailQueueItem';
import User from 'App/Models/User';

const SEQUENCE_VERSION = 'onboarding_sequence_v1';

export default class OnboardingEmailService {
  /**
   * Enfileira a sequencia de 3 emails pra um user.
   * Idempotente: nao re-enfileira se ja existir uma sequencia pra esse user.
   *
   * @returns numero de emails enfileirados (0 se ja existia, 3 se primeira vez)
   */
  public static async scheduleSequence(user: User): Promise<number> {
    if (!user?.email) {
      Logger.warn({ userId: user?.id }, '[OnboardingEmailService] user sem email, pula');
      return 0;
    }

    // Idempotency: ja enfileirou antes?
    const existing = await EmailQueueItem.query()
      .where('related_type', SEQUENCE_VERSION)
      .where('related_user_id', user.id)
      .count('* as c')
      .first();
    const existingCount = Number((existing as any)?.$extras?.c || 0);
    if (existingCount > 0) {
      Logger.info(
        { userId: user.id, existing: existingCount },
        '[OnboardingEmailService] sequencia ja existe, pula'
      );
      return 0;
    }

    const appUrl = Env.get('APP_URL', 'https://app.workeaser.com');
    const firstName = user.firstName || 'Coworker';

    try {
      // Dia 0 — Welcome (imediato)
      await EmailQueueService.enqueue({
        to: user.email,
        toName: firstName,
        subject: '🎉 Bem-vindo ao Workeaser!',
        templateCode: 'onboarding_welcome',
        templateData: {
          first_name: firstName,
          app_url: appUrl,
          onboarding_url: `${appUrl}/onboarding`,
          demo_email: 'demo@workeaser.com',
          demo_password: 'demo1234',
        },
        relatedUserId: user.id,
        relatedType: SEQUENCE_VERSION,
        relatedId: 1,
      });

      // Dia 3 — Dica
      await EmailQueueService.enqueue({
        to: user.email,
        toName: firstName,
        subject: '💡 Dica rápida pro seu cowork (3 min de leitura)',
        templateCode: 'onboarding_day3_tip',
        templateData: {
          first_name: firstName,
          app_url: appUrl,
          contracts_url: `${appUrl}/relationship/contracts`,
          settings_url: `${appUrl}/settings`,
        },
        scheduleAt: DateTime.now().plus({ days: 3 }),
        relatedUserId: user.id,
        relatedType: SEQUENCE_VERSION,
        relatedId: 2,
      });

      // Dia 7 — Check-in
      await EmailQueueService.enqueue({
        to: user.email,
        toName: firstName,
        subject: 'Como está o uso do Workeaser? (responda esse email)',
        templateCode: 'onboarding_day7_checkin',
        templateData: {
          first_name: firstName,
          app_url: appUrl,
          support_email: 'contato@workeaser.com',
        },
        scheduleAt: DateTime.now().plus({ days: 7 }),
        relatedUserId: user.id,
        relatedType: SEQUENCE_VERSION,
        relatedId: 3,
      });

      Logger.info(
        { userId: user.id },
        '[OnboardingEmailService] 3 emails enfileirados (dia 0, +3, +7)'
      );
      return 3;
    } catch (err: any) {
      Logger.error(
        { err: err.message, userId: user.id },
        '[OnboardingEmailService] falha ao enfileirar sequencia (parcial pode ter passado)'
      );
      return 0;
    }
  }

  /**
   * Cancela emails pendentes da sequencia pra um user (uso: data deletion, unsubscribe).
   * @returns numero de emails cancelados
   */
  public static async cancelSequence(userId: number): Promise<number> {
    const updated = await EmailQueueItem.query()
      .where('related_type', SEQUENCE_VERSION)
      .where('related_user_id', userId)
      .where('status', 'pending')
      .update({ status: 'canceled', lastError: 'Canceled by OnboardingEmailService.cancelSequence' });
    return Array.isArray(updated) ? updated[0] : 0;
  }
}
