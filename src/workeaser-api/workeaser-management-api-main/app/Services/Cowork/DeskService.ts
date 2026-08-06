import Application from '@ioc:Adonis/Core/Application';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database from '@ioc:Adonis/Lucid/Database';
import Desk from 'App/Models/Desk';
import DeskFee from 'App/Models/DeskFee';
import DeskPrice from 'App/Models/DeskPrice';
import Invoice from 'App/Models/Invoice';
import Location from 'App/Models/Location';
import User from 'App/Models/User';
import ContractService from 'App/Services/Cowork/ContractService';
import TaxesService from 'App/Services/Cowork/TaxesService';
import AppError from 'App/Utils/AppError';
import { safeRandomName } from 'App/Utils/SafeFilename';
import { InvoiceStatusEnum, ServicesEnum } from 'Contracts/enums';
import jsonXlsx from 'json-as-xlsx';
import slug from 'limax';
import Pick from 'lodash/pick';
import xlsx from 'node-xlsx';
// `randomUUID` removed in Lote 5b — filename now uses safeRandomName helper.

interface DeskList {
  id: number;
  name: string;
  location_id: number;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  shareability: boolean;
  open_balance: number;
  visibility: boolean;
  photos: string[];
  is_available: boolean;
  available: number;
  busy: number;
  desk_local_account_id: number;
}

export default class DeskService {
  static async list(user: User, filters: any, page = 1) {
    await user.load('coworkUser');
    const result: DeskList[] = [];

    const query = Desk.query()
      .preload('location', (l) => {
        l.preload('address');
      })
      .preload('photos')
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
        locationQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      });

    if (filters.name) {
      query.where('name', 'like', `%${filters.name}%`);
    }

    if (filters.location) {
      query.where('location_id', filters.location);
    }

    if (filters.shareable) {
      query.where('shareable', filters.shareable);
    }

    if (filters.quantity) {
      query.where('quantity', filters.quantity);
    }

    if (filters.minimum_rental_period) {
      query.where('minimum_rental_period', filters.minimum_rental_period);
    }

    const desks = (await query.paginate(page, Env.get('ITEMS_PER_PAGE'))).toJSON();

    for (const desk of desks.data) {
      const openBalance = await this.calcOpenBalance(desk.location.id, desk.id);
      const serviceAvailability = await ContractService.checkIfServiceIsAvailable(
        desk.id,
        ServicesEnum.OPEN_DESK
      );

      if (serviceAvailability.available !== 0) {
        result.push({
          id: desk.id,
          name: desk.name,
          location_id: desk.location.id,
          location: desk.location.name,
          address: desk.location.address?.fulltext,
          city: desk.location.address.city,
          state: desk.location.address.state,
          country: desk.location.address.country,
          latitude: desk.location.address.latitude,
          longitude: desk.location.address.longitude,
          shareability: desk.shareable,
          open_balance: openBalance,
          visibility: desk.searchable,
          photos: desk.photos.map((p) => p.file),
          is_available: serviceAvailability.isAvailable,
          available: serviceAvailability.available,
          busy: serviceAvailability.busy,
          desk_local_account_id: desk.desk_local_account_id
        });
      }
    }

    return {
      toJSON() {
        return {
          data: result,
          meta: desks.meta
        };
      }
    };
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const desk = await Desk.find(id);
    await desk?.load('location');
    await desk?.load('fees');
    await desk?.load('prices');
    await desk?.load('photos');

    if (!desk || user.coworkUser.coworkAccountId !== desk.location.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Desk not found');
    }

    const automaticTaxes = await TaxesService.getAutomaticTaxes(
      desk.location.coworkAccountId,
      ServicesEnum.OPEN_DESK
    );

    return { ...desk.toJSON(), taxes: automaticTaxes };
  }

  static async store(user: User, data: any = {}) {
    const location = await Location.find(data.location_id);

    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    await location?.load('address');

    if (user.coworkUser.coworkAccountId !== location.coworkAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const trx = await Database.transaction();

    try {
      const newDesk = await new Desk()
        .merge({
          ...Pick(data, Desk.fillable),
          cowork_account_id: user.coworkUser.coworkAccountId
        })
        .useTransaction(trx)
        .save();

      if (
        location.address.state !== null &&
        location.address.state !== undefined &&
        location.address.country !== null &&
        location.address.country !== undefined &&
        location.address.city !== null &&
        location.address.city !== undefined
      ) {
        const slugUrl =
          slug(location.address.country) +
          '-' +
          slug(location.address.state) +
          '-' +
          slug(location.address.city) +
          '-' +
          slug(location.name) +
          '-' +
          'od-open-desk' +
          '-' +
          'id' +
          '-' +
          newDesk.uuid;
        newDesk.slug = slugUrl;
        newDesk.save();
      }

      if (data.prices) {
        await newDesk.related('prices').createMany(data.prices);
      }

      if (data.fees) {
        await newDesk.related('fees').createMany(data.fees);
      }

      if (data.photos) {
        const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);
        await newDesk.related('photos').attach(photos);
      }

      await trx.commit();

      Event.emit('desk:new', { id: newDesk.id });

      return newDesk;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const desk = await Desk.query().where('id', id).preload('location').firstOrFail();

    if (desk.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const trx = await Database.transaction();

    try {
      const updatedDesk = await desk.merge(Pick(data, Desk.fillable)).useTransaction(trx).save();

      // Update Prices
      const actualPrices = await desk.related('prices').query();
      const actualPricesIds = actualPrices.map((price) => price.id);

      const toUpdatePrices = data.prices.filter((price) => price.id);
      const toInsertPrices = data.prices.filter((price) => !price.id);
      const toDeletePrices = actualPricesIds.filter(
        (actual) => !toUpdatePrices.map((prices) => prices.id).includes(actual)
      );

      if (toDeletePrices.length) {
        await DeskPrice.query().useTransaction(trx).whereIn('id', toDeletePrices).softDelete();
      }

      if (toInsertPrices) {
        await desk.related('prices').createMany(toInsertPrices);
      }

      if (toUpdatePrices) {
        for (const update of toUpdatePrices) {
          await DeskPrice.query().where('id', update.id).useTransaction(trx).update(update);
        }
      }

      // Update Fees
      const actualFees = await desk.related('fees').query();
      const actualFeesIds = actualFees.map((fee) => fee.id);

      const toUpdateFees = data.fees.filter((fee) => fee.id);
      const toInsertFees = data.fees.filter((fee) => !fee.id);
      const toDeleteFees = actualFeesIds.filter(
        (actual) => !toUpdateFees.map((fee) => fee.id).includes(actual)
      );

      if (toDeleteFees.length) {
        await DeskFee.query().useTransaction(trx).whereIn('id', toDeleteFees).softDelete();
      }

      if (toInsertFees) {
        await desk.related('fees').createMany(toInsertFees);
      }

      if (toUpdateFees) {
        for (const update of toUpdateFees) {
          await DeskFee.query().where('id', update.id).useTransaction(trx).update(update);
        }
      }

      const photos = data.photos.map((p) => p.id);
      await updatedDesk.related('photos').sync(photos || []);

      await trx.commit();

      Event.emit('desk:update', { id: updatedDesk.id });
      return updatedDesk;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: number, user: User) {
    await user.load('coworkUser');

    const desk = await Desk.query().where('id', id).preload('location').first();

    if (!desk || desk.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Desk not found');
    }

    await desk.softDelete();
    Event.emit('desk:delete', { id });
  }

  static async changeSearchAvailability(id: number, user: User, availability: boolean) {
    await user.load('coworkUser');

    const desk = await Desk.find(id);
    await desk?.load('location');

    if (!desk || desk.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    try {
      desk.searchable = availability;
      await desk.save();

      return desk;
    } catch (e) {
      throw e;
    }
  }

  private static async calcOpenBalance(locationId: number, deskId: number) {
    const invoices = await Invoice.query()
      .where('location_id', locationId)
      .whereHas('contracts', (i) => {
        i.where('service_type', ServicesEnum.OPEN_DESK);
        i.where('resource_id', deskId);
      })
      .whereIn('status', [
        InvoiceStatusEnum.VIEWED,
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.PARTLY_PAID
      ]);

    let result: number = 0;

    for (const invoice of invoices) {
      const detailed = await invoice.getDetailed();

      if (detailed.open_amount) {
        result += detailed.open_amount;
      }
    }

    return result;
  }
  static async import(file: any, user: User) {
    try {
      if (!file) {
        throw new AppError(AppError.NOT_FOUND, 'File not found.');
      }

      // Lote 5b: nome 100% backend-controlled — file.extname pode ser arbitrario.
      const safeName = safeRandomName(file.extname, ['xlsx', 'xls', 'csv']);
      await file.move(Application.tmpPath('uploads'), { name: safeName, overwrite: true });
      let doc = xlsx.parse(`${__dirname}/../../../tmp/uploads/${safeName}`);
      delete doc[0].data[0];
      let DesksJson = doc[0].data.filter((item: any) => item.length > 0);

      DesksJson.map(async (item: any) => {
        const data = {
          location_id: item[0],
          name: item[1],
          description: item[2],
          shareable: item[3],
          quantity: item[4],
          minimum_rental_period: item[5],
          searchable: item[6],
          renewal_tax: item[7],
          day_price: item[8],
          prices: [
            {
              duration: 'MONTH_1',
              monthly_price: item[9],
              full_price: item[10]
            },
            {
              duration: 'MONTH_3',
              monthly_price: item[11],
              full_price: item[12]
            },
            {
              duration: 'MONTH_6',
              monthly_price: item[13],
              full_price: item[14]
            },
            {
              duration: 'YEAR_1',
              monthly_price: item[15],
              full_price: item[16]
            },
            {
              duration: 'YEAR_2',
              monthly_price: item[17],
              full_price: item[18]
            },
            {
              duration: 'YEAR_3',
              monthly_price: item[19],
              full_price: item[20]
            }
          ],
          fees: []
        };

        if (Number.isNaN(Number(item[0]))) {
          return {
            message: 'Location id must be a number.'
          };
        }
        
        await this.store(user, data);
      });
      return 'Virtual Office importing successfully.';
    } catch (e) {
      return e;
    }
  }

  static async export(user: User) {
    let success = 'success';

    try {
      const desks = await Desk.query().where('cowork_account_id', user.coworkUser.coworkAccountId);
      if (desks.length > 0) {
        let data: any[] = [
          {
            sheet: 'Meetroom',
            columns: [
              { label: 'location_id', value: (row) => row.location_id },
              { label: 'name', value: (row) => row.name },
              { label: 'description', value: (row) => row.description },
              { label: 'shareable', value: (row) => row.shareable },
              { label: 'quantity', value: (row) => row.quantity },
              { label: 'minimum', value: (row) => row.minimum },
              { label: 'searchable', value: (row) => row.searchable },
              { label: 'renewal_tax', value: (row) => row.renewal_tax },
              { label: 'day_price', value: (row) => row.day_price },
              { label: 'Month_1_Monthly', value: (row) => row.Month_1_Monthly },
              { label: 'Month_1_Full', value: (row) => row.Month_1_Full },
              { label: 'Month_3_Monthly', value: (row) => row.Month_3_Monthly },
              { label: 'Month_3_Full', value: (row) => row.Month_3_Full },
              { label: 'Month_6_Monthly', value: (row) => row.Month_6_Monthly },
              { label: 'Month_6_Full', value: (row) => row.Month_6_Full },
              { label: 'Year_1_Monthly', value: (row) => row.Year_1_Monthly },
              { label: 'Year_1_Full', value: (row) => row.Year_1_Full },
              { label: 'Year_2_Monthly', value: (row) => row.Year_2_Monthly },
              { label: 'Year_2_Full', value: (row) => row.Year_2_Full },
              { label: 'Year_3_Monthly', value: (row) => row.Year_3_Monthly },
              { label: 'Year_3_Full', value: (row) => row.Year_3_Full }
            ],
            content: []
          }
        ];

        desks.map(async (item) => {
          const prices = await DeskPrice.query().where({
            desk_id: item.id
          });
          const ContentVirtualOffice = {
            location_id: item.id,
            name: item.name,
            description: item.description,
            shareable: item.shareable,
            quantity: item.quantity,
            minimum: item.minimum_rental_period,
            searchable: item.searchable,
            renewal_tax: item.renewalTax,
            day_price: item.dayPrice,
            Month_1_Monthly: prices[0]?.monthlyPrice,
            Month_1_Full: prices[0]?.fullPrice,
            Month_3_Monthly: prices[1]?.monthlyPrice,
            Month_3_Full: prices[1]?.fullPrice,
            Month_6_Monthly: prices[2]?.monthlyPrice,
            Month_6_Full: prices[2]?.fullPrice,
            Year_1_Monthly: prices[3]?.monthlyPrice,
            Year_1_Full: prices[3]?.fullPrice,
            Year_2_Monthly: prices[4]?.monthlyPrice,
            Year_2_Full: prices[4]?.fullPrice,
            Year_3_Monthly: prices[5]?.monthlyPrice,
            Year_3_Full: prices[5]?.fullPrice
          };
          data[0].content.push(ContentVirtualOffice);

          let settings = {
            fileName: 'Desks',
            extraLength: 3,
            writeOptions: {}
          };

          await jsonXlsx(data, settings);
        });

        return success;
      } else {
        return 'No records found.';
      }
    } catch (e) {
      return e;
    }
  }
}
