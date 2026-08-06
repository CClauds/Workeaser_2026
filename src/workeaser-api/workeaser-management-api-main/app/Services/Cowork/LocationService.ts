import Application from '@ioc:Adonis/Core/Application';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import Invoice from 'App/Models/Invoice';
import Location from 'App/Models/Location';
import User from 'App/Models/User';
import TaxesService from 'App/Services/Cowork/TaxesService';
import AppError from 'App/Utils/AppError';
import { safeRandomName } from 'App/Utils/SafeFilename';
import { InvoiceStatusEnum, ServicesEnum } from 'Contracts/enums';
import jsonXlsx from 'json-as-xlsx';
import Pick from 'lodash/pick';
import xlsx from 'node-xlsx';

interface LocationListInterface {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  short_address: string;
  latitude: string;
  longitude: string;
  contracted_services: string[];
  active_members: number;
  open_balance: number;
  overdue_payments: number;
  photos: string[];
  location_account_id: number;
}

export default class LocationService {
  static async list(user: User, filters: any, page = 1) {
    await user.load('coworkUser');
    const result: LocationListInterface[] = [];

    const query = Location.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .whereNull('deleted_at')
      .preload('address')
      .preload('photos')
      .preload('services');

    if (filters.name) {
      query.where('name', 'like', `%${filters.name}%`);
    }

    const resultJson = (await query.paginate(page, Env.get('ITEMS_PER_PAGE'))).toJSON();

    for (let location of resultJson.data) {
      const activeMembers = await this.calcActiveMembers(location.id);
      const balance = await this.calcBalance(location.id);

      result.push({
        id: location.id,
        name: location.name,
        email: location.email,
        phone: location.phone,
        address: location.address.fulltext,
        city: location.address.city,
        state: location.address.state,
        country: location.address.country,
        short_address:
          location.address.city + ', ' + location.address.state + ', ' + location.address.country,
        latitude: location.address.latitude,
        longitude: location.address.longitude,
        contracted_services: location.services.map((s) => s.slug),
        active_members: activeMembers,
        open_balance: balance.openBalance,
        overdue_payments: balance.overdue,
        photos: location.photos.map((p) => p.file),
        location_account_id: location.location_account_id
      });
    }

    return {
      toJSON() {
        return {
          data: result,
          meta: resultJson.meta
        };
      }
    };
  }

  static async show(id: number, user: User) {
    const location = await Location.find(id);
    await user.load('coworkUser');

    if (!location || location?.coworkAccountId !== user?.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    await location.load('address');
    await location.load('amenities');
    await location.load('photos');
    await location.load('services');
    await location.load('desks', (deskQuery) => {
      deskQuery.preload('prices');
      deskQuery.preload('fees');
    });
    await location.load('rooms', (roomsQuery) => {
      roomsQuery.preload('prices');
      roomsQuery.preload('fees');
    });
    await location.load('meetrooms');
    await location.load('virtualOffices', (virtualOfficeQuery) => {
      virtualOfficeQuery.preload('prices');
      virtualOfficeQuery.preload('fees');
    });

    const automaticTaxesOpenDesk = await TaxesService.getAutomaticTaxes(
      location.coworkAccountId,
      ServicesEnum.OPEN_DESK
    );

    const automaticTaxesRooms = await TaxesService.getAutomaticTaxes(
      location.coworkAccountId,
      ServicesEnum.PRIVATE_ROOM
    );

    const automaticTaxesMeetingRoom = await TaxesService.getAutomaticTaxes(
      location.coworkAccountId,
      ServicesEnum.MEETING_ROOM
    );

    const automaticTaxesVirtualOffice = await TaxesService.getAutomaticTaxes(
      location.coworkAccountId,
      ServicesEnum.VIRTUAL_OFFICE
    );

    return {
      location,
      taxes_open_desk: automaticTaxesOpenDesk,
      taxes_rooms: automaticTaxesRooms,
      taxes_meeting_room: automaticTaxesMeetingRoom,
      taxes_virtual_office: automaticTaxesVirtualOffice
    };
  }

  static async store(user: User, data: any = {}) {
    await user.load('coworkUser');

    const newLocationData = {
      ...Pick(data, Location.fillable),
      coworkAccountId: user.coworkUser.coworkAccountId // user.id
    };

    const trx = await Database.transaction();

    try {
      const newLocation = await new Location().merge(newLocationData).useTransaction(trx).save();

      const locationAddress = await new Address().merge(data.address).useTransaction(trx).save();

      await newLocation.related('address').associate(locationAddress);

      if (data.amenities) {
        const amenities = data.amenities.map((p) => p.id);
        await newLocation.related('amenities').attach(amenities);
      }

      if (data.services) {
        const services = data.services.map((p) => p.id);
        await newLocation.related('services').attach(services);
      }

      if (data.photos) {
        const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);
        await newLocation.related('photos').attach(photos);
      }

      await trx.commit();

      Event.emit('location:new', { id: newLocation.id });

      return newLocation;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const location = await Location.findOrFail(id);

    if (!location || location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const locationAddress = await Address.findOrFail(location.addressId);

    const updatedLocationData = {
      ...Pick(data, Location.fillable),
      coworkAccountId: user.coworkUser.coworkAccountId
    };

    const trx = await Database.transaction();

    try {
      const updatedLocation = await location.merge(updatedLocationData).useTransaction(trx).save();

      await locationAddress.merge(data.address).save();

      const photos = data.photos.map((p) => p.id);
      const services = data.services.map((p) => p.id);
      const amenities = data.amenities.map((p) => p.id);

      await updatedLocation.related('amenities').sync(amenities || []);
      await updatedLocation.related('services').sync(services || []);
      await updatedLocation.related('photos').sync(photos || []);

      await trx.commit();

      Event.emit('location:update', { id: updatedLocation.id });
      return updatedLocation;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id: number, user: User) {
    await user.load('coworkUser');

    const location = await Location.find(id);

    if (!location || location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    await location.softDelete();
    Event.emit('location:delete', { id });
  }

  private static async calcActiveMembers(locationId: number) {
    const invoices: Invoice[] = await Invoice.query()
      .select('user_id')
      .where('location_id', locationId)
      .where((q) => {
        q.whereRaw('date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()');
        q.orWhereIn('status', [
          InvoiceStatusEnum.PARTLY_PAID,
          InvoiceStatusEnum.SENT,
          InvoiceStatusEnum.VIEWED
        ]);
      });

    const usersIds: number[] = [];

    invoices.forEach((c) => {
      if (usersIds.indexOf(c.userId) === -1) usersIds.push(c.userId);
    });

    return usersIds.length;
  }

  private static async calcBalance(locationId: number) {
    const invoices: Invoice[] = await Invoice.query()
      .where('location_id', locationId)
      .whereIn('status', [
        InvoiceStatusEnum.VIEWED,
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.PARTLY_PAID
      ]);

    let openBalance = 0;
    let overdue = 0;

    for (const invoice of invoices) {
      const detailed = await invoice.getDetailed();

      if (detailed.open_amount) {
        if (detailed.is_invoice_overdue) {
          overdue += detailed.open_amount;
        }

        openBalance += detailed.open_amount;
      }
    }

    return { openBalance, overdue };
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
      let Location = doc[0].data.filter((item: any) => item.length > 0);

      Location.map(async (item: any) => {
        interface ServicesIds {
          id: number;
        }
        let services: ServicesIds[] = [];

        item[10] === true ? services.push({ id: 1 }) : null;
        item[11] === true ? services.push({ id: 2 }) : null;
        item[12] === true ? services.push({ id: 3 }) : null;
        item[13] === true ? services.push({ id: 4 }) : null;

        const data = {
          name: item[0],
          description: item[1],
          phone: item[3],
          email: item[2],
          address: {
            fulltext: item[4],
            latitude: item[8],
            longitude: item[9],
            country: item[7],
            city: item[5],
            state: item[6]
          },
          amenities: [],
          photos: [],
          services
        };

        if( Number.isNaN(Number(item[8])) || Number.isNaN(Number(item[9])) ) {
          return {
            message: 'Longitude and latitude must me at least 0.'
          };
        }

        await this.store(user, data);
      });
      return 'Locations importing successfully.';
    } catch (e) {
      return e;
    }
  }
  static async export(user: User) {
    let success = 'success';

    try {
      const location = await Location.query()
        .where('cowork_account_id', user?.coworkUser.coworkAccountId)
        .preload('services');
      if (location.length > 0) {
        let data: any[] = [
          {
            sheet: 'Location',
            columns: [
              { label: 'name', value: (row) => row.name },
              { label: 'description', value: (row) => row.description },
              { label: 'email', value: (row) => row.email },
              { label: 'phone', value: (row) => row.phone },
              { label: 'street_address', value: (row) => row.street_address },
              { label: 'city', value: (row) => row.city },
              { label: 'state', value: (row) => row.state },
              { label: 'country', value: (row) => row.country },
              { label: 'latitude', value: (row) => row.latitude },
              { label: 'longitude', value: (row) => row.longitude },
              { label: 'Virtual Office', value: (row) => row.VirtualOffice },
              { label: 'Meeting Room', value: (row) => row.MeetingRoom },
              { label: 'Open Desk', value: (row) => row.OpenDesk },
              { label: 'Private Room', value: (row) => row.PrivateRoom },
              { label: 'cowork_account_id', value: (row) => row.cowork_account_id }
            ],
            content: []
          }
        ];

        location.map(async (item: any) => {
          const address = await Address.find(item.addressId);

          const VirtualOffice = await item.services.find((item) => item.id === 1);
          const MeetingRoom = await item.services.find((item) => item.id === 2);
          const OpenDesk = await item.services.find((item) => item.id === 3);
          const PrivateRoom = await item.services.find((item) => item.id === 4);

          const ContentLocation = {
            name: item.name,
            description: item.description,
            email: item.email,
            phone: item.phone,
            street_address: address?.fulltext,
            city: address?.city,
            state: address?.state,
            country: address?.country,
            latitude: address?.latitude,
            longitude: address?.longitude,
            VirtualOffice: VirtualOffice ? true : false,
            MeetingRoom: MeetingRoom ? true : false,
            OpenDesk: OpenDesk ? true : false,
            PrivateRoom: PrivateRoom ? true : false,
            cowork_account_id: item.coworkAccountId
          };
          data[0].content.push(ContentLocation);
          let settings = {
            fileName: 'Location',
            extraLength: 3,
            writeOptions: {}
          };
          jsonXlsx(data, settings);
        });

        return success;
      } else {
        return 'No records found.';
      }
    } catch (e) {
      throw new AppError(AppError.BAD_REQUEST, e);
    }
  }
}
