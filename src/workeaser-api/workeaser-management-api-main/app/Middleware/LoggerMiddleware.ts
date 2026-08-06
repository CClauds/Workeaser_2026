import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

/**
 * HF-AUDIT-06: sanitização de campos sensíveis em logs.
 *
 * ANTES: `logger.info({ body: request.body() })` gravava password/token em texto puro.
 * AGORA: redige campos sensíveis antes de logar. Mantém visibilidade pra debug,
 * sem expor credencial em logs persistidos.
 *
 * Lista de keys redigidas pode ser estendida via env REDACT_FIELDS (CSV).
 */

const DEFAULT_REDACT_KEYS = new Set([
  'password',
  'password_confirmation',
  'currentPassword',
  'newPassword',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'apiKey',
  'secret',
  'client_secret',
  'private_key',
  'privateKey',
  'card_number',
  'cardNumber',
  'cvv',
  'cvc',
  'pin',
  'ssn',
  'authorization',
  'cookie',
  'x-api-key',
]);

function buildRedactSet(): Set<string> {
  const extra = (process.env.REDACT_FIELDS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const s = new Set<string>();
  DEFAULT_REDACT_KEYS.forEach((k) => s.add(k.toLowerCase()));
  extra.forEach((k) => s.add(k));
  return s;
}

const REDACT_SET = buildRedactSet();
const REDACT_VALUE = '[REDACTED]';

function redactDeep(input: unknown, depth = 0): unknown {
  if (depth > 8) return '[MAX_DEPTH]'; // proteção contra ciclo
  if (input === null || input === undefined) return input;
  if (typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map((v) => redactDeep(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (REDACT_SET.has(k.toLowerCase())) {
      out[k] = REDACT_VALUE;
    } else {
      out[k] = redactDeep(v, depth + 1);
    }
  }
  return out;
}

export default class LoggerMiddleware {
  public async handle({ request, logger }: HttpContextContract, next: () => Promise<void>) {
    const body = request.hasBody() ? redactDeep(request.body()) : {};
    logger.info(`-> ${request.method()}: ${request.url()}`, { body });
    await next();
  }
}
