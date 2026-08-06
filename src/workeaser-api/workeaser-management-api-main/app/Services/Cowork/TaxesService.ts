import Env from '@ioc:Adonis/Core/Env';
import Tax from 'App/Models/Tax';
import User from 'App/Models/User';
import Event from '@ioc:Adonis/Core/Event';
import Service from 'App/Models/Service';
import AppError from 'App/Utils/AppError';
import Database from '@ioc:Adonis/Lucid/Database';
import TaxService from 'App/Models/TaxService';
import { ServicesEnum } from 'Contracts/enums';

export interface ServiceTax {
  name: string;
  value: number;
  type: string;
  method: string;
  recurring_type: string;
}

export default class DeskService {
  static async list(user: User, paginate = true, page = 1) {
    await user.load('coworkUser');

    const query = Tax.query()
      .preload('services')
      .where('cowork_account_id', user.coworkUser.coworkAccountId);

    return (await paginate) ? query.paginate(page, Env.get('ITEMS_PER_PAGE')) : query;
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const tax = await Tax.find(id);
    await tax?.load('services');

    if (!tax || user.coworkUser.coworkAccountId !== tax.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Tax not found');
    }

    return tax;
  }

  static async store(user: User, data: any = {}) {
    await user.load('coworkUser');
    const trx = await Database.transaction();

    try {
      const newTax = await new Tax()
        .merge({
          coworkAccountId: user.coworkUser.coworkAccountId,
          name: data.name,
          type: data.type,
          recurringType: data.recurring_type,
          method: data.method,
          value: data.value
        })
        .useTransaction(trx)
        .save();

      if (data.services) {
        const services = data.services.map((p) => p.id);
        await newTax.related('services').attach(services);
      }

      await trx.commit();

      Event.emit('tax:new', { id: newTax.id });

      return newTax;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const tax = await Tax.query().where('id', id).firstOrFail();

    if (tax.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Tax not found');
    }

    const trx = await Database.transaction();

    try {
      const updatedTax = await tax
        .merge({
          coworkAccountId: user.coworkUser.coworkAccountId,
          name: data.name,
          type: data.type,
          recurringType: data.recurring_type,
          method: data.method,
          value: data.value
        })
        .useTransaction(trx)
        .save();

      const services = data.services.map((p) => p.id);
      await updatedTax.related('services').sync(services || []);

      await trx.commit();

      Event.emit('tax:update', { id: updatedTax.id });
      return updatedTax;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: number, user: User) {
    await user.load('coworkUser');

    const tax = await Tax.query().where('id', id).first();

    if (!tax || tax.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Tax not found');
    }

    await tax.softDelete();
    Event.emit('tax:delete', { id });
  }

  static async getAutomaticTaxes(coworkAccountId: number, serviceType: ServicesEnum | string) {
    const service = await Service.findByOrFail('slug', serviceType);
    const taxesService = await TaxService.query()
      .whereHas('tax', (taxQuery) => {
        taxQuery.where('cowork_account_id', coworkAccountId);
        taxQuery.whereNull('deleted_at');
      })
      .where('service_id', service.id);

    const taxesIds = taxesService.map((s) => s.taxId);
    const autoTaxes: Tax[] = await Tax.query()
      .where('cowork_account_id', coworkAccountId)
      .whereIn('id', taxesIds);

    const serviceTaxes: ServiceTax[] = [];

    autoTaxes.forEach((tax) => {
      serviceTaxes.push({
        name: tax.name,
        value: tax.value,
        type: tax.type,
        method: tax.method,
        recurring_type: tax.recurringType
      });
    });

    return serviceTaxes;
  }
}
