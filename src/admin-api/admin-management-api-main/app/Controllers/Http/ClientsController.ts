import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ClientsService from 'App/Services/ClientsService'
import ListClientsValidator from 'App/Validators/ListClientsValidator'
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

export default class ClientsController {
  public async listCoworkings({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const payload = await request.validate(ListClientsValidator)
      const result = await ClientsService.listCoworkings({
        page: payload.page,
        perPage: payload.per_page,
        search: payload.search,
        sort: payload.sort,
        order: payload.order,
      })

      return responseWithPagination(response, result)
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async listClients({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const payload = await request.validate(ListClientsValidator)
      const result = await ClientsService.listClients({
        page: payload.page,
        perPage: payload.per_page,
        search: payload.search,
        sort: payload.sort,
        order: payload.order,
      })

      return responseWithPagination(response, result)
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async showCoworking({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const result = await ClientsService.showCoworking(Number(params.id))
      return responseWithSuccess(response, result.toJSON())
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async showClient({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const result = await ClientsService.showClient(Number(params.id))
      return responseWithSuccess(response, result.toJSON())
    } catch (error) {
      return responseWithError(response, error)
    }
  }

  public async suspendUser(ctx: HttpContextContract) {
    const { params, response, auth } = ctx
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const result = await ClientsService.suspendUser(Number(params.userId))

      void AdminAuditService.log({
        event: 'user.suspend',
        ctx,
        ...actorOf(auth),
        targetType: 'user',
        targetId: Number(params.userId),
      })

      return responseWithSuccess(response, result)
    } catch (error) {
      void AdminAuditService.log({
        event: 'user.suspend',
        ctx,
        ...actorOf(auth),
        targetType: 'user',
        targetId: params.userId ? Number(params.userId) : null,
        outcome: 'failure',
      })
      return responseWithError(response, error)
    }
  }

  public async unsuspendUser(ctx: HttpContextContract) {
    const { params, response, auth } = ctx
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const result = await ClientsService.unsuspendUser(Number(params.userId))

      void AdminAuditService.log({
        event: 'user.reactivate',
        ctx,
        ...actorOf(auth),
        targetType: 'user',
        targetId: Number(params.userId),
      })

      return responseWithSuccess(response, result)
    } catch (error) {
      void AdminAuditService.log({
        event: 'user.reactivate',
        ctx,
        ...actorOf(auth),
        targetType: 'user',
        targetId: params.userId ? Number(params.userId) : null,
        outcome: 'failure',
      })
      return responseWithError(response, error)
    }
  }
}
