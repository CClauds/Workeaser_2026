import Env from '@ioc:Adonis/Core/Env';
import Pick from 'lodash/pick';
import Room from 'App/Models/Room';
import User from 'App/Models/User';
import Event from '@ioc:Adonis/Core/Event';
import RoomFee from 'App/Models/RoomFee';
import Invoice from 'App/Models/Invoice';
import Database from '@ioc:Adonis/Lucid/Database';
import Location from 'App/Models/Location';
import AppError from 'App/Utils/AppError';
import { safeRandomName } from 'App/Utils/SafeFilename';
import RoomPrice from 'App/Models/RoomPrice';
import TaxesService from 'App/Services/Cowork/TaxesService';
import ContractService from 'App/Services/Cowork/ContractService';
import { InvoiceStatusEnum, ServicesEnum } from 'Contracts/enums';
import Application from '@ioc:Adonis/Core/Application';
import jsonXlsx from 'json-as-xlsx';
import xlsx from 'node-xlsx';
import slug from 'limax';
// `randomUUID` removed in Lote 5b — filename now uses safeRandomName helper.

interface RoomList {
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
  photo: string[];
  is_available: boolean;
  available: number;
  busy: number;
  room_local_account_id: number;
}

export default class RoomService {
  static async list(user: User, filters: any, page = 1) {
    await user.load('coworkUser');
    const result: RoomList[] = [];

    const query = Room.query()
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

    if (filters.space_size) {
      query.where('space_size', filters.space_size);
    }

    if (filters.minimum_rental_period) {
      query.where('minimum_rental_period', filters.minimum_rental_period);
    }

    const rooms = (await query.paginate(page, Env.get('ITEMS_PER_PAGE'))).toJSON();

    for (const room of rooms.data) {
      const openBalance = await this.calcOpenBalance(room.locationId, room.id);
      const serviceAvailability = await ContractService.checkIfServiceIsAvailable(
        room.id,
        ServicesEnum.PRIVATE_ROOM
      );

      if (serviceAvailability.available !== 0) {
        result.push({
          id: room.id,
          name: room.name,
          location_id: room.location.id,
          location: room.location.name,
          address: room.location.address?.fulltext,
          city: room.location.address.city,
          state: room.location.address.state,
          country: room.location.address.country,
          latitude: room.location.address.latitude,
          longitude: room.location.address.longitude,
          shareability: room.shareable,
          open_balance: openBalance,
          visibility: room.searchable,
          photo: room.photos.map((p) => p.file),
          is_available: serviceAvailability.isAvailable,
          available: serviceAvailability.available,
          busy: serviceAvailability.busy,
          room_local_account_id: room.room_local_account_id
        });
      }
    }

    return {
      toJSON() {
        return {
          data: result,
          meta: rooms.meta
        };
      }
    };
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const room = await Room.find(id);
    await room?.load('location');
    await room?.load('prices');
    await room?.load('fees');
    await room?.load('photos');

    if (!room || user.coworkUser.coworkAccountId !== room.location.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Room not found');
    }

    const automaticTaxes = await TaxesService.getAutomaticTaxes(
      room.location.coworkAccountId,
      ServicesEnum.PRIVATE_ROOM
    );

    return { ...room.toJSON(), taxes: automaticTaxes };
  }

  static async store(user: User, data: any = {}) {
    const location = await Location.find(data.location_id);
    let slugUrl;

    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    await location?.load('address');

    if (user.coworkUser.coworkAccountId !== location.coworkAccountId) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const trx = await Database.transaction();

    try {
      const newRoom = await new Room()
        .merge({
          ...Pick(data, Room.fillable),
          locationId: data.location_id,
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
        slugUrl =
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
          newRoom.uuid;
        newRoom.slug = slugUrl;
        newRoom.save();
      }

      if (data.prices) {
        await newRoom.related('prices').createMany(data.prices);
      }

      if (data.fees) {
        await newRoom.related('fees').createMany(data.fees);
      }

      if (data.photos) {
        const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);
        await newRoom.related('photos').attach(photos);
      }

      await trx.commit();

      Event.emit('room:new', { id: newRoom.id });

      return newRoom;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const room = await Room.query().where('id', id).preload('location').firstOrFail();

    if (room.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const trx = await Database.transaction();

    try {
      const updatedRoom = await room.merge(Pick(data, Room.fillable)).useTransaction(trx).save();

      // Update Prices
      const actualPrices = await room.related('prices').query();
      const actualPricesIds = actualPrices.map((price) => price.id);

      const toUpdatePrices = data.prices.filter((price) => price.id);
      const toInsertPrices = data.prices.filter((price) => !price.id);
      const toDeletePrices = actualPricesIds.filter(
        (actual) => !toUpdatePrices.map((prices) => prices.id).includes(actual)
      );

      if (toDeletePrices.length) {
        await RoomPrice.query().useTransaction(trx).whereIn('id', toDeletePrices).softDelete();
      }

      if (toInsertPrices) {
        await room.related('prices').createMany(toInsertPrices);
      }

      if (toUpdatePrices) {
        for (const update of toUpdatePrices) {
          await RoomPrice.query().where('id', update.id).useTransaction(trx).update(update);
        }
      }

      // Update Fees
      const actualFees = await room.related('fees').query();
      const actualFeesIds = actualFees.map((fee) => fee.id);

      const toUpdateFees = data.fees.filter((fee) => fee.id);
      const toInsertFees = data.fees.filter((fee) => !fee.id);
      const toDeleteFees = actualFeesIds.filter(
        (actual) => !toUpdateFees.map((fee) => fee.id).includes(actual)
      );

      if (toDeleteFees.length) {
        await RoomFee.query().useTransaction(trx).whereIn('id', toDeleteFees).softDelete();
      }

      if (toInsertFees) {
        await room.related('fees').createMany(toInsertFees);
      }

      if (toUpdateFees) {
        for (const update of toUpdateFees) {
          await RoomFee.query().where('id', update.id).useTransaction(trx).update(update);
        }
      }

      if (data.photos) {
        const photos = data.photos.map((p) => p.id);
        await room.related('photos').sync(photos);
      }

      await trx.commit();

      Event.emit('room:update', { id: updatedRoom.id });
      return updatedRoom;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: number, user: User) {
    await user.load('coworkUser');

    const room = await Room.query().where('id', id).preload('location').first();

    if (!room || room.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Room not found');
    }

    await room.softDelete();
    Event.emit('room:delete', { id });
  }

  static async changeSearchAvailability(id: number, user: User, availability: boolean) {
    await user.load('coworkUser');

    const room = await Room.find(id);
    await room?.load('location');

    if (!room || room.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    try {
      room.searchable = availability;
      await room.save();

      return room;
    } catch (e) {
      throw e;
    }
  }

  private static async calcOpenBalance(locationId: number, roomId: number) {
    const invoices = await Invoice.query()
      .where('location_id', locationId)
      .whereHas('contracts', (i) => {
        i.where('service_type', ServicesEnum.PRIVATE_ROOM);
        i.where('resource_id', roomId);
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
          space_size_unit: item[3],
          space_size: item[4],
          room_capacity: item[5],
          shareable: item[6],
          searchable: item[7],
          renewal_tax: item[8],
          day_price: item[9],
          photos: [],
          prices: [
            {
              duration: 'MONTH_1',
              monthly_price: item[10],
              full_price: item[11]
            },
            {
              duration: 'MONTH_3',
              monthly_price: item[12],
              full_price: item[13]
            },
            {
              duration: 'MONTH_6',
              monthly_price: item[14],
              full_price: item[15]
            },
            {
              duration: 'YEAR_1',
              monthly_price: item[16],
              full_price: item[17]
            },
            {
              duration: 'YEAR_2',
              monthly_price: item[18],
              full_price: item[19]
            },
            {
              duration: 'YEAR_3',
              monthly_price: item[20],
              full_price: item[21]
            }
          ],
          fees: []
        };

        if( Number.isNaN(Number(item[0])) ) {
          return {
            message: 'Loncation id must be a number.'
          };
        }

        await this.store(user, data);
      });
      return 'Rooms importing successfully.';
    } catch (e) {
      return e;
    }
  }
  static async export(user: User) {
    //privateRoomId:[]

    let success = 'success';

    try {
      const rooms = await Room.query().where('cowork_account_id', user.coworkUser.coworkAccountId);
      if (rooms.length > 0) {
        let data: any[] = [
          {
            sheet: 'Private Room',
            columns: [
              { label: 'location_id', value: (row) => row.location_id },
              { label: 'name', value: (row) => row.name },
              { label: 'description', value: (row) => row.description },
              { label: 'space_size_unit', value: (row) => row.space_size_unit },
              { label: 'space_size', value: (row) => row.space_size },
              { label: 'room_capacity', value: (row) => row.room_capacity },
              { label: 'shareable', value: (row) => row.shareable },
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

        rooms.map(async (item) => {
          const prices = await RoomPrice.query().where('room_id', item.id);
          const ContentRooms = {
            location_id: item.locationId,
            name: item.name,
            description: item.description,
            space_size_unit: item.spaceSizeUnit,
            space_size: item.spaceSize,
            room_capacity: item.roomCapacity,
            shareable: item.shareable,
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
          data[0].content.push(ContentRooms);

          let settings = {
            fileName: 'privateRoom',
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
