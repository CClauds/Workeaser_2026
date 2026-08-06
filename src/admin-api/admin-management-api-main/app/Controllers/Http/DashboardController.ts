import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DashboardService from 'App/Services/DashboardService'
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi'

export default class DashboardController {
  public async metrics({ response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store')

    try {
      const result = await DashboardService.metrics()
      return responseWithSuccess(response, result)
    } catch (error) {
      return responseWithError(response, error)
    }
  }
}
