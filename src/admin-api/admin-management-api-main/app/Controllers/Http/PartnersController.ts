import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreatePartnerValidator from 'App/Validators/CreatePartnerValidator'
import UpdatePartnerValidator from 'App/Validators/UpdatePartnerValidator'
import PartnerService from 'App/Services/PartnerService'
import AppError from 'App/Utils/Errors'
import { PartnerRoleEnum } from 'Contracts/enums'
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess,
} from 'App/Utils/ResponseApi'
// Polish Lote (HF-POLISH-03): audit log de eventos do admin
import AdminAuditService from 'App/Services/AdminAuditService'

function actorOf(auth: HttpContextContract['auth']) {
  const p = auth.user as any
  return {
    actorPartnerId: p?.id ? Number(p.id) : null,
    actorEmail: p?.email || null,
  }
}

export default class PartnersController {
  public async index({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const page = Number(request.input('page', 1))
      const perPage = Number(request.input('per_page', 20))
      const search = request.input('search') as string | undefined

      const partners = await PartnerService.list({ page, perPage, search })

      return responseWithPagination(response, partners)
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async show({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const partner = await PartnerService.show(params.id)
      return responseWithSuccess(response, partner.toJSON())
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async store(ctx: HttpContextContract) {
    const { request, response, auth } = ctx
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const payload = await request.validate(CreatePartnerValidator)
      const partner = await PartnerService.create(payload as any)

      void AdminAuditService.log({
        event: 'partner.create',
        ctx,
        ...actorOf(auth),
        targetType: 'partner',
        targetId: (partner as any)?.id ? Number((partner as any).id) : null,
        metadata: { role: payload.role, email: payload.email },
      })

      return response.status(201).json({
        status: 'OK',
        result: partner.toJSON(),
        error: null,
      })
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async update(ctx: HttpContextContract) {
    const { params, request, response, auth } = ctx
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const payload = await request.validate(UpdatePartnerValidator)
      const partner = await PartnerService.update(params.id, payload as any)

      const currentPartner = auth.user as any
      if (
        currentPartner?.id === params.id &&
        payload.role &&
        payload.role !== PartnerRoleEnum.SYSTEM_DIRECTOR
      ) {
        await PartnerService.ensureDirectorExists()
      }

      void AdminAuditService.log({
        event: 'partner.update',
        ctx,
        ...actorOf(auth),
        targetType: 'partner',
        targetId: params.id ? Number(params.id) : null,
        metadata: { fields: Object.keys(payload || {}) },
      })

      return responseWithSuccess(response, partner.toJSON())
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async destroy(ctx: HttpContextContract) {
    const { params, response, auth } = ctx
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const currentPartner = auth.user as any
      if (!currentPartner) {
        throw new AppError(AppError.UNAUTHORIZED, 'Not authenticated')
      }

      await PartnerService.softDelete(params.id, currentPartner.id)
      await PartnerService.ensureDirectorExists()

      void AdminAuditService.log({
        event: 'partner.delete',
        ctx,
        ...actorOf(auth),
        targetType: 'partner',
        targetId: params.id ? Number(params.id) : null,
      })

      return responseWithSuccess(response, { deleted: true })
    } catch (error) {
      return responseWithError(response, error)
    }
  }
}
