/**
 * RateLimit middleware — in-memory token bucket por IP+rota.
 *
 * Polish Lote (HF-POLISH-02). Sem dependência externa (Redis), só memória do processo.
 * Em multi-instância: cada réplica tem seu balde. Suficiente para mitigar brute-force
 * antes de migrar para Redis/Sentinel.
 *
 * Uso:
 *   Route.post('/login', 'AuthController.login').middleware('rateLimit:auth_login')
 *
 * Limites (env var override):
 *   RATE_LIMIT_AUTH_LOGIN=10/60          (10 req por 60s)
 *   RATE_LIMIT_AUTH_SIGNUP=5/300
 *   RATE_LIMIT_AUTH_RESEND=3/300
 *   RATE_LIMIT_AUTH_FORGOT=3/300
 *   RATE_LIMIT_AUTH_ADMIN_LOGIN=10/60
 *
 * Resposta quando excedido: 429 Too Many Requests + Retry-After header.
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Logger from '@ioc:Adonis/Core/Logger';

type Bucket = { count: number; resetAt: number };

const BUCKETS = new Map<string, Bucket>();

const DEFAULTS: Record<string, string> = {
  auth_login: '10/60',
  auth_signup: '5/300',
  auth_resend: '3/300',
  auth_forgot: '3/300',
  auth_admin_login: '10/60',
};

function parseConfig(key: string): { max: number; windowSec: number } {
  const envKey = `RATE_LIMIT_${key.toUpperCase()}`;
  const raw = (process.env[envKey] || DEFAULTS[key] || '60/60').trim();
  const [maxStr, winStr] = raw.split('/');
  const max = Math.max(1, parseInt(maxStr, 10) || 60);
  const windowSec = Math.max(1, parseInt(winStr, 10) || 60);
  return { max, windowSec };
}

function clientKey(ctx: HttpContextContract, slot: string): string {
  // Prefer X-Forwarded-For first hop (atrás de nginx/cloudflare); fallback ip do socket.
  const xff = ctx.request.header('x-forwarded-for');
  const ip = (typeof xff === 'string' ? xff.split(',')[0].trim() : '') || ctx.request.ip() || 'unknown';
  return `${slot}:${ip}`;
}

export default class RateLimit {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, args?: string[]) {
    const slot = (args && args[0]) || 'global';
    const { max, windowSec } = parseConfig(slot);
    const key = clientKey(ctx, slot);
    const now = Date.now();

    let bucket = BUCKETS.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowSec * 1000 };
      BUCKETS.set(key, bucket);
    }
    bucket.count += 1;

    // GC oportunista (a cada 1000 inserts): remove buckets vencidos para não vazar memória
    if (BUCKETS.size > 0 && BUCKETS.size % 1000 === 0) {
      for (const [k, b] of BUCKETS) {
        if (b.resetAt <= now) BUCKETS.delete(k);
      }
    }

    const remaining = Math.max(0, max - bucket.count);
    ctx.response.header('X-RateLimit-Limit', String(max));
    ctx.response.header('X-RateLimit-Remaining', String(remaining));
    ctx.response.header('X-RateLimit-Reset', String(Math.floor(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      ctx.response.header('Retry-After', String(retryAfter));
      Logger.warn({ slot, ip: key.split(':')[1] }, 'rate limit exceeded');
      return ctx.response.status(429).json({
        status: 'ERROR',
        result: null,
        error: {
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please slow down and try again later.',
          retryAfter,
        },
      });
    }

    await next();
  }
}
