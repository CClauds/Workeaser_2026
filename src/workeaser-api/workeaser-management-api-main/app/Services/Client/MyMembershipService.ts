import Database from '@ioc:Adonis/Lucid/Database';
import Contract from 'App/Models/Contract';
import Invoice from 'App/Models/Invoice';
import Location from 'App/Models/Location';
import Mailbox from 'App/Models/Mailbox';
import Meeting from 'App/Models/Meeting';
import Photo from 'App/Models/Photo';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import {
  ContractStatusEnum,
  InvoiceStatusEnum,
  MembershipStatus,
  ServicesEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';
import { LightInvoice } from '../Cowork/ClientService';

interface LocationsList {
  id: number;
  location_name: string;
  coworking_name: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  photos: string[];
  services: string[];
  logo: string | null;
}

export interface ProductsAndServicesClient {
  id: number;
  type: string;
  name: string;
  status: string;
  date_start: DateTime;
  date_end: DateTime;
  auto_renewal: boolean;
  document_file: string | null;
  documents: any[];
}

export interface Bookings {
  id: number;
  type: string;
  status: string;
  name: string;
  date: DateTime;
}

export interface Mailboxes {
  id: number;
  name: string;
  location: string;
  photo: string | null;
  action: string;
  status: string;
  received: DateTime;
}

export interface Invoices {
  id: number;
  date: DateTime;
  status: string;
  amount: number;
  open_amount: number;
}

export default class MyMembershipService {
  static async list(user: User) {
    const contracts: Contract[] = await Contract.query().where('user_id', user.id);

    const locationsServices: { id: number; services: string[] }[] = [];

    for (const contract of contracts) {
      const idx = locationsServices.findIndex((x) => x.id === contract.locationId);
      if (idx !== -1) {
        const exist = locationsServices[idx].services.includes(contract.serviceType);

        if (!exist) {
          locationsServices[idx].services.push(contract.serviceType);
        }
      } else {
        locationsServices.push({
          id: contract.locationId,
          services: [contract.serviceType]
        });
      }
    }

    const locationsIds = locationsServices.map((x) => x.id);
    const locations: Location[] = await Location.query()
      .preload('coworkAccount')
      .preload('photos')
      .preload('address')
      .whereIn('id', locationsIds);

    const result: LocationsList[] = [];

    for (const location of locations) {
      const locationData = locationsServices.find((x) => x.id === location.id);
      let logoPhoto = await Photo.query().where('id', location.coworkAccount.photoId);

      result.push({
        id: location.id,
        coworking_name: location.coworkAccount.name,
        location_name: location.name,
        address: location.address?.fulltext || '',
        city: location.address.city,
        state: location.address.state,
        country: location.address.country,
        photos: location.photos.map((x) => x.file),
        services: locationData?.services || [],
        logo: logoPhoto[0]?.file || null
      });
    }

    return result;
  }

  static async show(user: User, locationId: number) {
    const hasPermission = await this.userHasLocationMembership(user.id, locationId);

    if (!hasPermission) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const location = await Location.query()
      .preload('photos')
      .preload('coworkAccount')
      .preload('address')
      .where('id', locationId)
      .first();

    const locationJson = location.toJSON();
    locationJson.logo = null;
    if (location?.coworkAccount?.photoId) {
      let logoPhoto = await Photo.find(location.coworkAccount.photoId);
      locationJson.logo = logoPhoto?.file;
    }

    const status = await this.getMembershipStatus(user.id, locationId);
    locationJson.status = status;

    return locationJson;
  }

  static async productsAndServices(user: User, locationId: number) {
    const services: ProductsAndServicesClient[] = [];

    const contracts = await this.getProductsByUserAndLocation(user.id, locationId);

    for (const contract of contracts) {
      const service: ProductsAndServicesClient = {
        id: contract.id,
        type: contract.serviceType,
        status: contract.status,
        name: await this.getServiceName(contract),
        date_start: contract.dateStart,
        date_end: contract.dateEnd,
        auto_renewal: contract.autoRenewal,
        document_file: contract.contractDocument ? contract.contractDocument.file : null,
        documents: contract.documents || []
      };

      services.push(service);
    }

    return services;
  }

  static async bookings(user: User, locationId: number) {
    const bookings: Bookings[] = [];

    const meetings: Meeting[] = await Meeting.query()
      .where('location_id', locationId)
      .where('user_id', user.id)
      .preload('meetroom');

    for (const meeting of meetings) {
      bookings.push({
        id: meeting.id,
        type: ServicesEnum.MEETING_ROOM,
        status: meeting.status,
        name: meeting.meetroom.name,
        date: meeting.createdAt
      });
    }

    return bookings;
  }

  static async mailbox(user: User, locationId: number) {
    const mailboxes: Mailboxes[] = [];

    const result: Mailbox[] = await Mailbox.query()
      .preload('location')
      .preload('user')
      .preload('photos')
      .where('user_id', user.id)
      .where('location_id', locationId);

    for (const mailbox of result) {
      mailboxes.push({
        id: mailbox.id,
        name: mailbox.user.fullName,
        photo: mailbox.photos[0] ? mailbox.photos[0].file : null,
        location: mailbox.location.name,
        action: mailbox.requestedAction,
        status: mailbox.status,
        received: mailbox.deliveryDate
      });
    }

    return mailboxes;
  }

  static async invoices(user: User, locationId: number) {
    const invoices: LightInvoice[] = [];

    const result: Invoice[] = await Invoice.query()
      .where('location_id', locationId)
      .where('user_id', user.id);

    for (const invoice of result) {
      const detailed = await invoice.getDetailed();
      if (!detailed.user.uuid) {
        throw new AppError(AppError.BAD_REQUEST, 'Invoice user id not found');
      }
      invoices.push({
        id: invoice.id,
        uuid: invoice.uuid,
        user: {
          uuid: detailed.user.uuid
        },
        due_date: detailed.due_date,
        date: invoice.date,
        status: invoice.status,
        amount: detailed.total,
        open_amount: detailed.open_amount
      });
    }

    return invoices;
  }

  private static async userHasLocationMembership(userId: number, locationId: number) {
    const contract = await Contract.query()
      .where('user_id', userId)
      .where('location_id', locationId)
      .first();

    if (!contract) {
      return false;
    }

    return true;
  }

  private static async getProductsByUserAndLocation(userId: number, locationId: number) {
    const contracts: Contract[] = await Contract.query()
      .preload('contractDocument')
      .preload('documents')
      .where('location_id', locationId)
      .where('user_id', userId)
      .orderBy('status');

    return contracts;
  }

  private static async getServiceName(contract: Contract): Promise<string> {
    switch (contract.serviceType) {
      case ServicesEnum.OPEN_DESK:
        const desk = await Database.from('desks').where('id', contract.resourceId).first();
        return desk.name;
      case ServicesEnum.PRIVATE_ROOM:
        const privateRoom = await Database.from('rooms')
          .where('id', contract.resourceId)
          .firstOrFail();
        return privateRoom.name;
      case ServicesEnum.VIRTUAL_OFFICE:
        const virtualOffice = await Database.from('virtual_offices')
          .where('id', contract.resourceId)
          .firstOrFail();
        return virtualOffice.name;
      default:
        return '';
    }
  }

  private static async getMembershipStatus(userId: number, locationId: number) {
    const contracts = await Contract.query()
      .where('location_id', locationId)
      .where('user_id', userId)
      .whereNotIn('status', [ContractStatusEnum.CANCELED, ContractStatusEnum.INACTIVE])
      .count('*', 'total');

    const invoices = await Invoice.query()
      .where('location_id', locationId)
      .where('user_id', userId)
      .where((q) => {
        q.whereRaw('date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()');
        q.orWhereIn('status', [
          InvoiceStatusEnum.PARTLY_PAID,
          InvoiceStatusEnum.SENT,
          InvoiceStatusEnum.VIEWED
        ]);
      })
      .count('*', 'total');

    const bookings = await Meeting.query()
      .where('location_id', locationId)
      .where('user_id', userId)
      .where((q) => {
        q.whereRaw('date_start BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()');
      })
      .count('*', 'total');

    const countContracts = contracts[0].$extras.total;
    const countInvoices = invoices[0].$extras.total;
    const countBookings = bookings[0].$extras.total;

    if (countContracts || countInvoices || countBookings) {
      return MembershipStatus.ACTIVE;
    }

    return MembershipStatus.INACTIVE;
  }
}
