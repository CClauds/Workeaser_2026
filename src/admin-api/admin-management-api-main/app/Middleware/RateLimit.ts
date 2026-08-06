/**
 * RateLimit — in-memory por IP+slot. Polish Lote (HF-POLISH-02 admin).
 *
 * Default: admin_login = 10/60s.
 * Configurável via RATE_LIMIT_AUTH_ADMIN_LOGIN.
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'

type Bucket = { count: number; resetAt: number }
const BUCKETS = new Map<string, Bucket>()

const DEFAULTS: Record<string, string> = {
  auth_admin_login: '10/60',
}

function parseConfig(key: string): { max: number; windowSec: number } {
  const envKey = `RATE_LIMIT_${key.toUpperCase()}`
  const raw = (process.env[envKey] || DEFAULTS[key] || '60/60').trim()
  const [maxStr, winStr] = raw.split('/')
  const max = Math.max(1, parseInt(maxStr, 10) || 60)
  const windowSec = Math.max(1, parseInt(winStr, 10) || 60)
  return { max, windowSec }
}

function clientKey(ctx: HttpContextContract, slot: string): string {
  const xff = ctx.request.header('x-forwarded-for')
  const ip = (typeof xff === 'string' ? xff.split(',')[0].trim() : '') || ctx.request.ip() || 'unknown'
  return `${slot}:${ip}`
}

export default class RateLimit {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, args?: string[]) {
    const slot = (args && args[0]) || 'global'
    const { max, windowSec } = parseConfig(slot)
    const key = clientKey(ctx, slot)
    const now = Date.now()

    let bucket = BUCKETS.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowSec * 1000 }
      BUCKETS.set(key, bucket)
    }
    bucket.count += 1

    if (BUCKETS.size > 0 && BUCKETS.size % 1000 === 0) {
      for (const [k, b] of BUCKETS) {
        if (b.resetAt <= now) BUCKETS.delete(k)
      }
    }

    const remaining = Math.max(0, max - bucket.count)
    ctx.response.header('X-RateLimit-Limit', String(max))
    ctx.response.header('X-RateLimit-Remaining', String(remaining))
    ctx.response.header('X-RateLimit-Reset', String(Math.floor(bucket.resetAt / 1000)))

    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
      ctx.response.header('Retry-After', String(retryAfter))
      Logger.warn({ slot, ip: key.split(':')[1] }, 'rate limit exceeded')
      return ctx.response.status(429).json({
        status: 'ERROR',
        result: null,
        error: {
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please slow down and try again later.',
          retryAfter,
        },
      })
    }

    await next()
  }
}
