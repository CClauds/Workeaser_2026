import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AppError from 'App/Utils/Errors'
import { PartnerRoleEnum } from 'Contracts/enums'

/**
 * Restricts access to routes based on Partner role.
 * Usage: `.middleware(['auth', 'adminRole:SYSTEM_DIRECTOR'])`
 *
 * If no role argument is passed, simply requires an authenticated partner.
 */
export default class AdminRoleMiddleware {
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    requiredRoles: string[]
  ) {
    const partner = auth.user as any

    if (!partner) {
      throw new AppError(AppError.UNAUTHORIZED, 'Authentication required')
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return next()
    }

    const allowed = requiredRoles
      .map((r) => r.toUpperCase())
      .includes((partner.role as PartnerRoleEnum) ?? '')

    if (!allowed) {
      throw new AppError(
        AppError.FORBIDDEN,
        `This action requires one of these roles: ${requiredRoles.join(', ')}`
      )
    }

    await next()
  }
}
