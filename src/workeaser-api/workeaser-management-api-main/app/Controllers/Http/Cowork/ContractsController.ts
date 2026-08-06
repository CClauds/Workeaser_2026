import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import ContractService from 'App/Services/Cowork/ContractService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import AttachDocumentContractValidator from 'App/Validators/Cowork/Contracts/AttachDocumentContractValidator';
import CalculateServiceValidator from 'App/Validators/Cowork/Contracts/CalculateServiceValidator';
import StoreContractValidator from 'App/Validators/Cowork/Contracts/StoreContractValidator';

export default class ContractsController {
  async index({ request, response, auth }: HttpContextContract) {
    const user = auth.user;
    const filters = request.all();
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await ContractService.list(user, filters, page);

    return responseWithPagination(response, results);
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const location = await ContractService.show(id, user);

      return responseWithSuccess(response, location);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreContractValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newContract = await ContractService.store(user, payload);
    await LogService.create(auth.user as any, 'CONTRACTS', 'CREATE', newContract.id);

    return responseWithSuccess(response, newContract);
  }

  async getContractPdf({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const contract = await ContractService.getContractPdf(user, id);
      return response.attachment(contract, 'contract.pdf');
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async attachNewDocuments({ request, response, params, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(AttachDocumentContractValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const contract = await ContractService.attachDocuments(params.id, user, payload);
      await LogService.create(auth.user as any, 'CONTRACTS', 'ATTACH_DOCUMENTS', contract.id);

      return responseWithSuccess(response, contract);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async detach({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const contract = await ContractService.detach(params.id, user);
      await LogService.create(auth.user as any, 'CONTRACTS', 'DETACH', contract.id);

      return responseWithSuccess(response, contract);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async getContracts({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const userId = params.userId;
      const user = auth.user;

      if (!user || !userId) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const contracts = await ContractService.getOpenContractsByUserUUID(user, userId);

      return responseWithSuccess(response, contracts);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async getContractCancelInfo({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const contractId = params.contractId;
      const user = auth.user;

      if (!user || !contractId) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const infos = await ContractService.getCancelInfos(user, contractId);

      return responseWithSuccess(response, infos);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async sendContract({ params, response, auth }: HttpContextContract) {
    const contractId = params.id;
    const user = auth.user;

    if (!user || !contractId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const res = await ContractService.sendContract(user, contractId);

    return responseWithSuccess(response, res);
  }

  async calculateService({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const payload = await request.validate(CalculateServiceValidator);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const res = await ContractService.getServiceInfos(
        payload.id,
        payload.service_type,
        payload.term_size,
        payload.payment_recurring_style
      );

      return responseWithSuccess(response, res);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async contractUrlCowork({ request, response, auth }: HttpContextContract) {
    const contractId = request.param('id');
    const user = auth.user;
    const res = await ContractService.getContractUrl(user, contractId);
    return responseWithSuccess(response, res);
  }

  async getContractStatus({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const contractId = request.param('id');
      const user = auth.user;
      const res = await ContractService.ContractStatus(user, contractId);
      return responseWithSuccess(response, res);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
