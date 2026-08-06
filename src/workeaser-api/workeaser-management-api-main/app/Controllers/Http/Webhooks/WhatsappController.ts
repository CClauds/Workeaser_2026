/**
 * WhatsappController — recebe webhooks da Meta Cloud API.
 * Sprint C (HF-SPRINT-C-05).
 *
 * 2 endpoints:
 *  GET  /api/webhooks/whatsapp — validation challenge (Meta valida endpoint via hub.challenge)
 *  POST /api/webhooks/whatsapp — eventos reais (status update + mensagens recebidas)
 *
 * Segurança:
 *  - Verify token (WHATSAPP_META_VERIFY_TOKEN) confere no GET de verificação
 *  - Signature X-Hub-Signature-256 confere autenticidade do POST (HMAC SHA-256)
 */
import Env from '@ioc:Adonis/Core/Env';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Logger from '@ioc:Adonis/Core/Logger';
import { createHmac, timingSafeEqual } from 'crypto';
import { responseWithSuccess } from 'App/Utils/ResponseApi';
import WhatsappService from 'App/Services/WhatsappService';
// HF-SPRINT-G-02: anti-replay protection
import { isReplayed, registerNonce } from 'App/Utils/WebhookReplayProtection';

export default class WhatsappController {
  /** Endpoint de verificação inicial da Meta (1x ao configurar webhook). */
  public async verify({ request, response }: HttpContextContract) {
    const mode = request.input('hub.mode');
    const token = request.input('hub.verify_token');
    const challenge = request.input('hub.challenge');
    const expected = Env.get('WHATSAPP_META_VERIFY_TOKEN') as string | undefined;

    if (mode === 'subscribe' && expected && token === expected) {
      response.status(200).send(String(challenge));
      return;
    }
    response.status(403).send('forbidden');
  }

  /** Eventos reais. */
  public async store({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    // Verificar signature
    const appSecret = Env.get('WHATSAPP_META_APP_SECRET') as string | undefined;
    if (appSecret) {
      const signature = request.header('x-hub-signature-256') as string | undefined;
      if (!signature || !signature.startsWith('sha256=')) {
        Logger.warn('whatsapp webhook sem signature — rejeitando');
        response.status(401).send('unauthorized');
        return;
      }
      const expected = createHmac('sha256', appSecret).update(request.raw() || '').digest('hex');
      const provided = signature.slice('sha256='.length);
      try {
        const ok = timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
        if (!ok) {
          Logger.warn('whatsapp webhook signature inválida');
          response.status(401).send('unauthorized');
          return;
        }
      } catch {
        response.status(401).send('unauthorized');
        return;
      }
    }
    // (Se WHATSAPP_META_APP_SECRET não configurado em dev/sandbox, segue sem verificação —
    //  Logger.debug mostraria. Em prod é OBRIGATÓRIO setar.)

    try {
      const payload = request.body();

      // HF-SPRINT-G-02: anti-replay via message id (wamid.xxx) ou entry.id
      // Meta envia múltiplas mensagens num único webhook; dedupe por id do PRIMEIRO evento
      const firstChange: any = payload?.entry?.[0]?.changes?.[0]?.value;
      const replayKey: string | undefined =
        firstChange?.statuses?.[0]?.id ||
        firstChange?.messages?.[0]?.id ||
        payload?.entry?.[0]?.id;
      if (isReplayed(replayKey)) {
        Logger.warn({ replayKey }, 'WhatsApp webhook já processado (replay ignorado)');
        return responseWithSuccess(response, { ok: true });
      }

      await WhatsappService.handleIncomingWebhook(payload);
      registerNonce(replayKey);
      return responseWithSuccess(response, { ok: true });
    } catch (err) {
      Logger.error({ err }, 'whatsapp webhook processing error');
      // Devolve 200 mesmo em erro pra Meta não ficar reenvolando (idempotência manual).
      return responseWithSuccess(response, { ok: true });
    }
  }
}
