import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import ClientImportService, { ImportRow } from 'App/Services/Cowork/ClientImportService';
import ClientService from 'App/Services/Cowork/ClientService';
import LogService from 'App/Services/LogService';
import UserService from 'App/Services/UserService';
import AppError from 'App/Utils/AppError';
import { CheckFile, Sleep } from 'App/Utils/Generics';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import SearchUserByEmailValidator from 'App/Validators/Cowork/Clients/SearchUserByEmailValidator';
import StoreClientValidator from 'App/Validators/Cowork/Clients/StoreClientValidator';

export default class ClientsController {
  async index({ request, response, auth }: HttpContextContract) {
    const user = auth.user;
    const filters = request.all();

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await ClientService.list(user, filters);

    return responseWithSuccess(response, results);
  }

  async store({ request, response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await user.load('coworkUser');

    const payload = await request.validate(StoreClientValidator);
    const created = await ClientService.store(user, payload, user.coworkUser.coworkAccountId);

    await LogService.create(auth.user as any, 'CLIENTS', 'CREATE', created.id);

    return responseWithSuccess(response, created);
  }

  async show({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const client = await ClientService.show(user, params.id);

    return responseWithSuccess(response, client);
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreClientValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const updatedClient = await ClientService.update(params.id, user, payload);

    return responseWithSuccess(response, updatedClient);
  }

  async delete({ response, auth, params }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await ClientService.detachClientUserToCowork(user, params.id);

    return responseWithSuccess(response);
  }

  async searchClientByEmail({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payload = await request.validate(SearchUserByEmailValidator);
    const search = await ClientService.searchClientByEmail(user, payload.email);

    return responseWithSuccess(response, search);
  }

  async accountMembers({ request, response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const filters = request.all();

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const members = await ClientService.accountMembers(user, params.id, filters);

    return responseWithSuccess(response, members);
  }

  async overview({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const overview = await ClientService.overview(user, params.id);

    return responseWithSuccess(response, overview);
  }

  async productsAndServices({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const result = await ClientService.productsAndServices(user, params.id);

    return responseWithSuccess(response, result);
  }

  async benefits({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const result = await ClientService.benefits(user, params.id);

    return responseWithSuccess(response, result);
  }

  async bookings({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const bookings = await ClientService.bookings(user, params.id);

    return responseWithSuccess(response, bookings);
  }

  async invoices({ response, auth, params }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invoices = await ClientService.invoices(user, params.id);

    return responseWithSuccess(response, invoices);
  }

  async mailbox({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const mailboxes = await ClientService.mailbox(user, params.id);

    return responseWithSuccess(response, mailboxes);
  }

  public async export({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const res = await ClientService.export(user);

    if (res === 'success') {
      await Sleep(16000);
      await CheckFile(response, './ClientExport.xlsx');
    } else {
      return responseWithError(response, res);
    }
  }

  public async import({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const file = request.file('file', {
      extnames: ['csv', 'xls', 'xlsx']
    });

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await user.load('coworkUser');

    const res = await UserService.import(file);

    return responseWithSuccess(response, res);
  }

  /**
   * Sprint L (HF-SPRINT-L-01) — Simplified import via JSON.
   *
   * Recebe body: `{ rows: [{name, email, phone?, company?}, ...] }`
   * Frontend parseia o CSV no browser e envia JSON pra ca.
   *
   * Devolve: `{ total, created, skippedExisting: string[], errors: [{row, email, reason}] }`
   *
   * Reusa o endpoint group existente (auth + coworkAuthorization:RELATIONSHIP).
   */
  async importSimple({ request, response, auth }: HttpContextContract) {
    const user = auth.user;
    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await user.load('coworkUser');
    if (!user.coworkUser?.coworkAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'User not linked to a cowork account');
    }

    const body = request.only(['rows']);
    const rows = (body?.rows || []) as ImportRow[];

    if (!Array.isArray(rows)) {
      throw new AppError(AppError.VALIDATION_FAIL, 'Field "rows" must be an array');
    }

    const result = await ClientImportService.importBatch(
      rows,
      user.coworkUser.coworkAccountId
    );

    await LogService.create(
      auth.user as any,
      'CLIENTS',
      'IMPORT_BATCH',
      undefined,
      {
        total: result.total,
        created: result.created,
        skipped: result.skippedExisting.length,
        errors: result.errors.length,
      }
    );

    return responseWithSuccess(response, result);
  }
}
