import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

/**
 * HF-AUDIT-07: security headers HTTP (equivalente ao helmet do Express).
 *
 * Headers aplicados:
 *  - Strict-Transport-Security: força HTTPS por 1 ano (só em produção)
 *  - X-Content-Type-Options: bloqueia MIME sniffing
 *  - X-Frame-Options: bloqueia clickjacking (impede iframe externo)
 *  - X-XSS-Protection: legado mas inofensivo
 *  - Referrer-Policy: strict-origin-when-cross-origin (não vaza path em referer)
 *  - Permissions-Policy: bloqueia features sensíveis (camera, mic, geo) por default
 *  - X-Permitted-Cross-Domain-Policies: none
 *
 * NÃO aplica Content-Security-Policy pois CSP pra API REST é complexo
 * (cliente é o frontend Next, ele tem o próprio CSP).
 */
export default class SecurityHeaders {
  public async handle({ response, request }: HttpContextContract, next: () => Promise<void>) {
    response.header('X-Content-Type-Options', 'nosniff');
    response.header('X-Frame-Options', 'DENY');
    response.header('X-XSS-Protection', '1; mode=block');
    response.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.header('X-Permitted-Cross-Domain-Policies', 'none');

    // HSTS só em produção (em dev quebra setup local)
    if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
      response.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Cache control para endpoints sensíveis (auth, me, financeiro)
    const url = request.url();
    if (
      url.startsWith('/api/auth') ||
      url.startsWith('/api/me') ||
      url.includes('/finance') ||
      url.includes('/payment') ||
      url.includes('/invoice')
    ) {
      response.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      response.header('Pragma', 'no-cache');
      response.header('Expires', '0');
    }

    await next();
  }
}
