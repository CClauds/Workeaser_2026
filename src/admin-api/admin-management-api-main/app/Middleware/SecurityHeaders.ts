import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * HF-AUDIT-07: security headers HTTP no admin-api.
 * Mesma lógica do workeaser-api (X-Content-Type-Options, X-Frame-Options,
 * Referrer-Policy, HSTS em prod). Admin API é mais sensível ainda — todos
 * endpoints atrás de auth, manipulam partners/coworks.
 */
export default class SecurityHeaders {
  public async handle({ response, request }: HttpContextContract, next: () => Promise<void>) {
    response.header('X-Content-Type-Options', 'nosniff')
    response.header('X-Frame-Options', 'DENY')
    response.header('X-XSS-Protection', '1; mode=block')
    response.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    response.header('X-Permitted-Cross-Domain-Policies', 'none')

    if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
      response.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }

    // Admin API: TUDO sem cache (operação administrativa)
    response.header('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    response.header('Pragma', 'no-cache')
    response.header('Expires', '0')

    // (request usado pra evitar warning de unused, e pra log futuro se necessário)
    void request
    await next()
  }
}
