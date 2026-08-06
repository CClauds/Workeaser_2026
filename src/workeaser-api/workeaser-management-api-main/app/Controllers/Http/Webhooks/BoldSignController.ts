import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { BoldsignEvent } from 'App/Integrations/BoldSign/interfaces/event.interface';
import ContractService from 'App/Services/Cowork/ContractService';

export default class BoldSignController {
  public async index({ request, response }: HttpContextContract) {
    const body = request.body() as BoldsignEvent;

    await ContractService.contractEnvelopeUpdate(body);

    return response.status(200);
  }
}
