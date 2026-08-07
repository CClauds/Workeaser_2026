import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

/**
 * 1B.2-httpOnly: Lee el token de sesión de la cookie httpOnly user-token
 * y lo inyecta como header Authorization: Bearer <token> antes del middleware
 * de autenticación. Esto permite que la cookie sea httpOnly (no legible desde
 * JS/XSS) y aún así el API guard de AdonisJS (oat) autentique con el token.
 *
 * Se registra como middleware global en start/kernel.ts ANTES de 'auth'.
 */
export default class CookieAuth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const token = ctx.request.cookie('user-token');

    if (token && !ctx.request.header('Authorization')) {
      ctx.request.request.headers['authorization'] = `Bearer ${token}`;
    }

    await next();
  }
}
