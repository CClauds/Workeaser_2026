import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import AuthService from 'App/Services/AuthService'
import AppError from 'App/Utils/Errors'
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi'
// Polish Lote (HF-POLISH-03): audit log de eventos do admin
import AdminAuditService from 'App/Services/AdminAuditService'

export default class AuthController {
  public async login(ctx: HttpContextContract) {
    const { request, response, auth } = ctx
    response.header('Cache-Control', 'no-cache, no-store')

    const { email, password } = request.only(['email', 'password'])

    try {
      if (!email || !password) {
        throw new AppError(AppError.VALIDATION_FAIL, 'Email and password are required')
      }

      const service = new AuthService(auth)
      const result = await service.login({ email, password })

      Logger.info({ email }, 'Admin partner logged in')
      // Audit log success (fire-and-forget — não bloqueia resposta se falhar)
      void AdminAuditService.log({
        event: 'admin.login',
        ctx,
        actorEmail: email,
        actorPartnerId: (result as any)?.partner?.id ?? null,
        outcome: 'success',
      })

      return responseWithSuccess(response, result)
    } catch (error) {
      Logger.warn({ err: error?.message, route: 'admin/auth/login' }, 'Admin login failed')
      // Audit log failure (sem expor a senha; só email tentado)
      void AdminAuditService.log({
        event: 'admin.login',
        ctx,
        actorEmail: email || null,
        outcome: 'failure',
        metadata: { reason: (error?.message || 'unknown').toString().slice(0, 200) },
      })
      return responseWithError(response, error)
    }
  }

  public async logout(ctx: HttpContextContract) {
    const { auth, response } = ctx
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const partnerId = auth.user?.id ? Number(auth.user.id) : null
      const email = auth.user?.email || null

      await auth.use('api').revoke()

      void AdminAuditService.log({
        event: 'admin.logout',
        ctx,
        actorPartnerId: partnerId,
        actorEmail: email,
        outcome: 'success',
      })

      return responseWithSuccess(response, { revoked: true })
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async me({ auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const partner = auth.user

      if (!partner) {
        throw new AppError(AppError.UNAUTHORIZED, 'Not authenticated')
      }

      return responseWithSuccess(response, partner.toJSON())
    } catch (error) {
      return responseWithError(response, error)
    }
  }
}
