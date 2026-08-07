/**
 * B3-B: Clients CRUD controller — uses client_accounts + service_contracts (B2 tables).
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';
import ClientAccount from 'App/Models/ClientAccount';
import ServiceContract from 'App/Models/ServiceContract';

export default class ClientsV2Controller {
  /** GET /api/cowork/v2/clients — list with filters, search, pagination */
  public async index({ request, response }: HttpContextContract) {
    const { search, company, service, room, page = 1, perPage = 25 } = request.qs();

    const query = ClientAccount.query()
      .where('tenant_id', 1)
      .preload('serviceContracts', (sc) => {
        sc.preload('serviceType').preload('roomsUnit').preload('reseller');
      })
      .orderBy('company_name', 'asc');

    if (search) {
      const s = `%${search}%`;
      query.where((q) => {
        q.where('company_name', 'like', s)
          .orWhere('company_email', 'like', s)
          .orWhere('contact_first_name', 'like', s)
          .orWhere('contact_last_name', 'like', s);
      });
    }

    const result = await query.paginate(Number(page), Number(perPage));
    return response.json(result);
  }

  /** GET /api/cowork/v2/clients/:id — single client with contracts */
  public async show({ params, response }: HttpContextContract) {
    const client = await ClientAccount.query()
      .where('id', params.id)
      .where('tenant_id', 1)
      .preload('serviceContracts', (sc) => {
        sc.preload('serviceType').preload('roomsUnit').preload('reseller');
      })
      .firstOrFail();

    return response.json(client);
  }

  /** POST /api/cowork/v2/clients — create client + service_contracts */
  public async store({ request, response }: HttpContextContract) {
    const trx = await Database.transaction();
    try {
      const { contracts, ...clientData } = request.body();

      const client = await ClientAccount.create(
        { ...clientData, tenantId: 1 },
        { client: trx }
      );

      if (Array.isArray(contracts)) {
        for (const c of contracts) {
          await ServiceContract.create(
            { ...c, clientAccountId: client.id, tenantId: 1, startedAt: c.started_at || new Date() },
            { client: trx }
          );
        }
      }

      await trx.commit();
      await client.load('serviceContracts', (sc) => {
        sc.preload('serviceType').preload('roomsUnit').preload('reseller');
      });

      return response.status(201).json(client);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /** PUT /api/cowork/v2/clients/:id — update client */
  public async update({ params, request, response }: HttpContextContract) {
    const client = await ClientAccount.query()
      .where('id', params.id).where('tenant_id', 1).firstOrFail();

    const data = request.only([
      'company_name', 'company_email', 'company_phone',
      'contact_first_name', 'contact_last_name', 'contact_email', 'contact_phone',
      'pmb_number', 'address', 'ein', 'notes',
    ]);

    client.merge(data);
    await client.save();
    return response.json(client);
  }

  /** DELETE /api/cowork/v2/clients/:id — soft delete */
  public async destroy({ params, response }: HttpContextContract) {
    const client = await ClientAccount.query()
      .where('id', params.id).where('tenant_id', 1).firstOrFail();
    await client.softDelete();
    return response.json({ deleted: true });
  }

  /** POST /api/cowork/v2/clients/:id/contracts — add contract to client */
  public async addContract({ params, request, response }: HttpContextContract) {
    const client = await ClientAccount.query()
      .where('id', params.id).where('tenant_id', 1).firstOrFail();

    const data = request.body();
    const contract = await ServiceContract.create({
      ...data,
      clientAccountId: client.id,
      tenantId: 1,
      startedAt: data.started_at || new Date(),
    });

    await contract.load('serviceType');
    await contract.load('roomsUnit');
    await contract.load('reseller');

    return response.status(201).json(contract);
  }
}
