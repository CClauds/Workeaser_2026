import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithSuccess } from 'App/Utils/ResponseApi';

import ContractService from 'App/Services/Client/ContractService';

export default class ContractsController {
  async contractUrlClient({ request, response, auth }: HttpContextContract) {
    const contractId = request.param('id');
    const user = auth.user;
    const res = await ContractService.getContractUrl(user, contractId);
    return responseWithSuccess(response, res);
  }
}
