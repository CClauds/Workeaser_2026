import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class AdobeSignController {
  public async store({ response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      // const envelopeId = request.input('envelopeId');
      // const status = request.input('status');
      // await ContractService.contractEnvelopeUpdate(envelopeId, status, 'SIGNED');

      return responseWithSuccess(response, { message: 'ADOBESIGN IS DISABLED' });
    } catch (error) {
      return responseWithError(response, error);
    }
  }
}
