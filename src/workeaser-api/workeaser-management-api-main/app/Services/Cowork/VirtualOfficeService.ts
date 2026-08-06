import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';
import Invoice from 'App/Models/Invoice';
import Database from '@ioc:Adonis/Lucid/Database';
import AppError from 'App/Utils/AppError';
import { safeRandomName } from 'App/Utils/SafeFilename';
import Location from 'App/Models/Location';
import TaxesService from 'App/Services/Cowork/TaxesService';
import VirtualOffice from 'App/Models/VirtualOffice';
import VirtualOfficeFee from 'App/Models/VirtualOfficeFee';
import VirtualOfficePrice from 'App/Models/VirtualOfficePrice';
import { InvoiceStatusEnum, ServicesEnum } from 'Contracts/enums';
import Application from '@ioc:Adonis/Core/Application';
import jsonXlsx from 'json-as-xlsx';
import xlsx from 'node-xlsx';
import slug from 'limax';
// `randomUUID` removed in Lote 5b — filename now uses safeRandomName helper.

interface VirtualOfficeContent {
  location_id: number;
  name: string;
  description: string;
  has_dir_listing: boolean;
  has_mailing: boolean;
  has_phone_answer: boolean;
  has_voip: boolean;
  coworking_usage_mo: number;
  meetroom_usage_mo: number;
  full_price: boolean;
  searchable: boolean;
  renewal_tax: number;
  Month_1_Monthly: number;
  Month_1_Full: number;
  Month_3_Monthly: number;
  Month_3_Full: number;
  Month_6_Monthly: number;
  Month_6_Full: number;
  Year_1_Monthly: number;
  Year_1_Full: number;
  Year_2_Monthly: number;
  Year_2_Full: number;
  Year_3_Monthly: number;
  Year_3_Full: number;
}

interface VirtualOfficeList {
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
  active_members: number;
  inactive_members: number;
  open_balance: number;
  photos: string[];
  visibility: boolean;
  virt_office_local_account_id: number;
}

export default class VirtualOfficeService {
  static async list(user: User, page: number = 1, filters: any = {}) {
    await user.load('coworkUser');
    const result: VirtualOfficeList[] = [];

    const query = VirtualOffice.query()
      .preload('location', (a) => {
        a.preload('address');
      })
      .preload('photos')
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
        locationQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      });

    if (filters.location) {
      query.where('location_id', filters.location);
    }

    if (filters && filters.q) {
      query.where((q) => {
        q.where('name', 'like', `%${filters.q}%`);
        q.orWhere('description', 'like', `%${filters.q}%`);
      });
    }

    const virtualOffices = (await query.paginate(page, Env.get('ITEMS_PER_PAGE'))).toJSON();

    for (const virtualOffice of virtualOffices.data) {
      const activeMembers = await this.calcActiveMembers(
        virtualOffice.locationId,
        virtualOffice.id
      );
      const inactiveMembers = await this.calcInactiveMembers(
        virtualOffice.locationId,
        virtualOffice.id
      );
      const openBalance = await this.calcOpenBalance(virtualOffice.locationId, virtualOffice.id);

      result.push({
        id: virtualOffice.id,
        name: virtualOffice.name,
        location: virtualOffice.location.name,
        location_id: virtualOffice.location.id,
        address: virtualOffice.address?.fulltext,
        city: virtualOffice.location.address.city,
        state: virtualOffice.location.address.state,
        country: virtualOffice.location.address.country,
        latitude: virtualOffice.location.address.latitude,
        longitude: virtualOffice.location.address.longitude,
        active_members: activeMembers,
        inactive_members: inactiveMembers,
        open_balance: openBalance,
        photos: virtualOffice.photos.map((p) => p.file),
        visibility: virtualOffice.searchable,
        virt_office_local_account_id: virtualOffice.virt_office_local_account_id
      });
    }

    return {
      toJSON() {
        return {
          data: result,
          meta: virtualOffices.meta
        };
      }
    };
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const resource = await VirtualOffice.find(id);
    await resource?.load('prices');
    await resource?.load('fees');
    await resource?.load('photos');
    await resource?.load('location');

    if (!resource || user.coworkUser.coworkAccountId !== resource.location.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Virtual Office not found');
    }

    const automaticTaxes = await TaxesService.getAutomaticTaxes(
      resource.location.coworkAccountId,
      ServicesEnum.VIRTUAL_OFFICE
    );

    return { ...resource.toJSON(), taxes: automaticTaxes };
  }

  static async store(data: any, user: User) {
    await user.load('coworkUser');

    const location = await Location.find(data.location_id);

    if (location?.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await location?.load('address');

    const trx = await Database.transaction();
    try {
      const virtualOffice = new VirtualOffice().merge({
        cowork_account_id: user.coworkUser.coworkAccountId
      });

      virtualOffice.useTransaction(trx);
      virtualOffice.merge(data, false);

      const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);
      const prices = data.prices.map((p) => {
        const price = new VirtualOfficePrice();

        price.merge({
          duration: p.duration,
          monthlyPrice: p.monthly_price,
          fullPrice: p.full_price
        });

        return price;
      });

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
          virtualOffice.uuid;
        virtualOffice.slug = slugUrl;
      }

      await virtualOffice.save();
      await virtualOffice.related('photos').attach(photos);
      await virtualOffice.related('prices').saveMany(prices);

      if (data.fees) {
        await virtualOffice.related('fees').createMany(data.fees);
      }

      await trx.commit();

      return virtualOffice;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  static async update(id: number, user: User, data: any) {
    await user.load('coworkUser');

    const trx = await Database.transaction();
    const virtualOffice = await VirtualOffice.find(id);
    await virtualOffice?.load('location');

    if (
      !virtualOffice ||
      virtualOffice.location.coworkAccountId !== user.coworkUser.coworkAccountId
    ) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    try {
      virtualOffice.useTransaction(trx);
      virtualOffice.merge(data, false);

      const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);

      // Update Prices
      const actualPrices = await virtualOffice.related('prices').query();
      const actualPricesIds = actualPrices.map((price) => price.id);

      const toUpdatePrices = data.prices.filter((price) => price.id);
      const toInsertPrices = data.prices.filter((price) => !price.id);
      const toDeletePrices = actualPricesIds.filter(
        (actual) => !toUpdatePrices.map((prices) => prices.id).includes(actual)
      );

      if (toDeletePrices.length) {
        await VirtualOfficePrice.query()
          .useTransaction(trx)
          .whereIn('id', toDeletePrices)
          .softDelete();
      }

      if (toInsertPrices) {
        await virtualOffice.related('prices').createMany(toInsertPrices);
      }

      if (toUpdatePrices) {
        for (const update of toUpdatePrices) {
          await VirtualOfficePrice.query()
            .where('id', update.id)
            .useTransaction(trx)
            .update(update);
        }
      }

      // Update Fees
      const actualFees = await virtualOffice.related('fees').query();
      const actualFeesIds = actualFees.map((fee) => fee.id);

      const toUpdateFees = data.fees.filter((fee) => fee.id);
      const toInsertFees = data.fees.filter((fee) => !fee.id);
      const toDeleteFees = actualFeesIds.filter(
        (actual) => !toUpdateFees.map((fee) => fee.id).includes(actual)
      );

      if (toDeleteFees.length) {
        await VirtualOfficeFee.query().useTransaction(trx).whereIn('id', toDeleteFees).softDelete();
      }

      if (toInsertFees) {
        await virtualOffice.related('fees').createMany(toInsertFees);
      }

      if (toUpdateFees) {
        for (const update of toUpdateFees) {
          await VirtualOfficeFee.query().where('id', update.id).useTransaction(trx).update(update);
        }
      }

      await virtualOffice.save();
      await virtualOffice.related('photos').sync(photos);

      await trx.commit();

      return virtualOffice;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  static async destroy(id: number, user: User) {
    await user.load('coworkUser');
    const virtualOffice = await VirtualOffice.find(id);
    await virtualOffice?.load('location');

    if (
      !virtualOffice ||
      virtualOffice.location.coworkAccountId !== user.coworkUser.coworkAccountId
    ) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    await virtualOffice.softDelete();
  }

  static async changeSearchAvailability(id: number, user: User, availability: boolean) {
    await user.load('coworkUser');

    const virtualOffice = await VirtualOffice.find(id);
    await virtualOffice?.load('location');

    if (
      !virtualOffice ||
      virtualOffice.location.coworkAccountId !== user.coworkUser.coworkAccountId
    ) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    try {
      virtualOffice.searchable = availability;
      await virtualOffice.save();

      return virtualOffice;
    } catch (e) {
      throw e;
    }
  }

  private static async calcActiveMembers(locationId: number, virtualOfficeId: number) {
    const invoices = await Invoice.query()
      .select('user_id')
      .where('location_id', locationId)
      .whereHas('contracts', (i) => {
        i.where('service_type', ServicesEnum.VIRTUAL_OFFICE);
        i.where('resource_id', virtualOfficeId);
      })
      .where((q) => {
        q.whereRaw('date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()');
        q.orWhereIn('status', [
          InvoiceStatusEnum.PARTLY_PAID,
          InvoiceStatusEnum.SENT,
          InvoiceStatusEnum.VIEWED
        ]);
      });

    let usersIds: number[] = [];

    invoices.forEach((c) => {
      if (usersIds.indexOf(c.userId) === -1) usersIds.push(c.userId);
    });

    return usersIds.length;
  }

  private static async calcInactiveMembers(locationId: number, virtualOfficeId: number) {
    const invoices = await Invoice.query()
      .select('user_id')
      .where('location_id', locationId)
      .whereHas('contracts', (i) => {
        i.where('service_type', ServicesEnum.VIRTUAL_OFFICE);
        i.where('resource_id', virtualOfficeId);
      })
      .whereRaw('date NOT BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()');

    let usersIds: number[] = [];

    invoices.forEach((c) => {
      if (usersIds.indexOf(c.userId) === -1) usersIds.push(c.userId);
    });

    return usersIds.length;
  }

  private static async calcOpenBalance(locationId: number, virtualOfficeId: number) {
    const invoices = await Invoice.query()
      .where('location_id', locationId)
      .whereHas('contracts', (i) => {
        i.where('service_type', ServicesEnum.VIRTUAL_OFFICE);
        i.where('resource_id', virtualOfficeId);
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
      let VirtualOfficeJson = doc[0].data.filter((item: any) => item.length > 0);

      VirtualOfficeJson.map(async (item: any) => {
        const data = {
          location_id: item[0],
          name: item[1],
          description: item[2],
          has_dir_listing: item[3],
          has_mailing: item[4],
          has_phone_answer: item[5],
          has_voip: item[6],
          coworking_usage_mo: item[7],
          meetroom_usage_mo: item[8],
          renewal_tax: item[11],
          photos: [],
          prices: [
            {
              duration: 'MONTH_1',
              monthly_price: item[12],
              full_price: item[13]
            },
            {
              duration: 'MONTH_3',
              monthly_price: item[14],
              full_price: item[15]
            },
            {
              duration: 'MONTH_6',
              monthly_price: item[16],
              full_price: item[17]
            },
            {
              duration: 'YEAR_1',
              monthly_price: item[18],
              full_price: item[19]
            },
            {
              duration: 'YEAR_2',
              monthly_price: item[20],
              full_price: item[21]
            },
            {
              duration: 'YEAR_3',
              monthly_price: item[22],
              full_price: item[23]
            }
          ],
          fees: [],
          searchable: item[10]
        };

        if( Number.isNaN(Number(item[0])) ) {
          return {
            message: 'Location must be a number.'
          };
        }

        await this.store(data, user);
      });
      return 'Virtual Office importing successfully.';
    } catch (e) {
      return e;
    }
  }

  static async export(user) {
    let success = 'success';

    try {
      const virtualOffice = await VirtualOffice.query().where(
        'cowork_account_id',
        user.coworkUser.coworkAccountId
      );

      if (virtualOffice.length > 0) {
        let data: any[] = [
          {
            sheet: 'Meetroom',
            columns: [
              { label: 'location_id', value: (row) => row.location_id },
              { label: 'name', value: (row) => row.name },
              { label: 'description', value: (row) => row.description },
              { label: 'has_dir_listing', value: (row) => row.has_dir_listing },
              { label: 'has_mailing', value: (row) => row.has_mailing },
              { label: 'has_phone_answer', value: (row) => row.has_phone_answer },
              { label: 'has_voip', value: (row) => row.has_voip },
              { label: 'coworking_usage_mo', value: (row) => row.coworking_usage_mo },
              { label: 'meetroom_usage_mo', value: (row) => row.meetroom_usage_mo },
              { label: 'full_price', value: (row) => row.full_price },
              { label: 'searchable', value: (row) => row.searchable },
              { label: 'renewal_tax', value: (row) => row.renewal_tax },
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

        virtualOffice.map(async (item) => {
          const prices = await VirtualOfficePrice.query().where({
            virtual_office_id: item.id
          });

          const ContentVirtualOffice: VirtualOfficeContent = {
            location_id: item.id,
            name: item.name,
            description: item.description,
            has_dir_listing: item.hasDirListing,
            has_mailing: item.hasMailing,
            has_phone_answer: item.hasPhoneAnswer,
            has_voip: item.hasVoip,
            coworking_usage_mo: item.coworkingUsageMo,
            meetroom_usage_mo: item.meetroomUsageMo,
            full_price: true,
            searchable: item.searchable,
            renewal_tax: item.renewalTax,
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
            fileName: 'VirtualOffice',
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

  // to refactor
  static async toIterateOverId() {
    const roomId = await VirtualOffice.query().select('id').orderBy('id', 'desc').first();

    return roomId;
  } // end iterateOnAccountId
}
