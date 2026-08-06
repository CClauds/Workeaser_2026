import Env from '@ioc:Adonis/Core/Env';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError } from 'App/Utils/ResponseApi';

export default class DocusignController {
  public async validation({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const clientid = request.header('X-ADOBESIGN-CLIENTID') || '';
      if (clientid === Env.get('CLIENTID_ADOBE_SIGN')) {
        response.header('xAdobeSignClientId', clientid);
        return response.status(200).send({
          xAdobeSignClientId: clientid
        });
      }
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async store({ request, response }) {
    response.header('Cache-Control', 'no-cache, no-store');
    // const { requestBody } = request;
    const clientid = request.header('X-ADOBESIGN-CLIENTID') || '';
    // const envelopeId = requestBody.agreement.id;

    // const verification = await AdobeSignApi.get(`/agreements/${envelopeId}`);
    // const { status } = verification.data;

    if (clientid === Env.get('CLIENTID_ADOBE_SIGN')) {
      // await ContractService.contractEnvelopeUpdate(envelopeId, status, 'SIGNED');
      response.header('xAdobeSignClientId', clientid);

      return response.status(200).send({
        xAdobeSignClientId: clientid
      });
    }

    return responseWithError(response, 'Forbidden');
  }
}
