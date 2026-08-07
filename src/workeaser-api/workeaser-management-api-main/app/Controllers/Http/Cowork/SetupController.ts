/**
 * B3-C: Setup CRUD controller — rooms_units, resellers, service_types, locations.
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import RoomsUnit from 'App/Models/RoomsUnit';
import Reseller from 'App/Models/Reseller';
import ServiceType from 'App/Models/ServiceType';
import Location from 'App/Models/Location';

export default class SetupController {
  /* ── LOCATIONS (read existing) ── */
  public async locations({ response }: HttpContextContract) {
    const list = await Location.query().where('tenant_id', 1).preload('address');
    return response.json(list);
  }

  /* ── ROOMS UNITS ── */
  public async roomsIndex({ request, response }: HttpContextContract) {
    const { location_id, service_type_id } = request.qs();
    const query = RoomsUnit.query().where('tenant_id', 1)
      .preload('location').preload('serviceType').orderBy('display_name');
    if (location_id) query.where('location_id', location_id);
    if (service_type_id) query.where('service_type_id', service_type_id);
    return response.json(await query);
  }

  public async roomsStore({ request, response }: HttpContextContract) {
    const data = request.body();
    const room = await RoomsUnit.create({ ...data, tenantId: 1 });
    await room.load('location'); await room.load('serviceType');
    return response.status(201).json(room);
  }

  public async roomsUpdate({ params, request, response }: HttpContextContract) {
    const room = await RoomsUnit.query().where('id', params.id).where('tenant_id', 1).firstOrFail();
    room.merge(request.body());
    await room.save();
    await room.load('location'); await room.load('serviceType');
    return response.json(room);
  }

  public async roomsDestroy({ params, response }: HttpContextContract) {
    const room = await RoomsUnit.query().where('id', params.id).where('tenant_id', 1).firstOrFail();
    await room.softDelete();
    return response.json({ deleted: true });
  }

  /* ── RESELLERS ── */
  public async resellersIndex({ response }: HttpContextContract) {
    const list = await Reseller.query().where('tenant_id', 1)
      .withCount('serviceContracts').orderBy('name');
    return response.json(list);
  }

  public async resellersStore({ request, response }: HttpContextContract) {
    const data = request.body();
    const r = await Reseller.create({ ...data, tenantId: 1 });
    return response.status(201).json(r);
  }

  public async resellersUpdate({ params, request, response }: HttpContextContract) {
    const r = await Reseller.query().where('id', params.id).where('tenant_id', 1).firstOrFail();
    r.merge(request.body());
    await r.save();
    return response.json(r);
  }

  public async resellersDestroy({ params, response }: HttpContextContract) {
    const r = await Reseller.query().where('id', params.id).where('tenant_id', 1).firstOrFail();
    await r.softDelete();
    return response.json({ deleted: true });
  }

  /* ── SERVICE TYPES (read-only) ── */
  public async serviceTypes({ response }: HttpContextContract) {
    const list = await ServiceType.query().where('tenant_id', 1).where('is_active', true);
    return response.json(list);
  }

  /* ── USERS (read existing + create with role) ── */
  public async usersIndex({ response }: HttpContextContract) {
    const User = (await import('App/Models/User')).default;
    const users = await User.query()
      .where('role', '!=', 'CLIENT')
      .preload('coworkUser', (q) => q.preload('coworkModules'));
    return response.json(users.map((u: any) => ({
      id: u.id, first_name: u.firstName, last_name: u.lastName, email: u.email,
      role: u.role, modules: u.coworkUser?.coworkModules?.map((m: any) => m.slug) ?? [],
    })));
  }
}
