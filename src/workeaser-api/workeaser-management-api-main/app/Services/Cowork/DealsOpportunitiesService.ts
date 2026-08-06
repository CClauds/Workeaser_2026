import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Desk from 'App/Models/Desk';
import Room from 'App/Models/Room';
import SpaceReserveRequest from 'App/Models/SpaceReserveRequest';
import User from 'App/Models/User';
import VirtualOffice from 'App/Models/VirtualOffice';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import { ServicesEnum, SpaceReserveInquireTypesEnum } from 'Contracts/enums';
import { DateTime } from 'luxon';

interface DealsOpportunitiesResponse {
  id: number;
  service_name: string;
  service_type: string;
  location_name: string;
  user_name: string;
  request_date: DateTime;
  inquire_type: string;
  potential_earning: number;
}

export default class DealsOpportunitiesService {
  static async show(user: User, spaceRequestId: number) {
    await user.load('coworkUser');
    const space = await SpaceReserveRequest.query()
      .where('id', spaceRequestId)
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .preload('location', (l) => {
        l.preload('photos');
        l.preload('address');
      })
      .preload('clientAccount', (ca) => {
        ca.preload('user', (u) => {
          u.preload('photo');
        });
        ca.preload('companyAddress');
      })
      .first();

    const serviceName = await this.getServiceName(space.serviceType, space.resourceId);

    return {
      ...space.toJSON(),
      service_name: serviceName
    };
  }

  static async list(user: User, page = 1) {
    await user.load('coworkUser');

    const result: DealsOpportunitiesResponse[] = [];
    const query = await SpaceReserveRequest.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .preload('location')
      .preload('clientAccount', (b) => {
        b.preload('user');
      })
      .whereHas('location', (q) => {
        q.whereNull('deleted_at');
      })
      .whereHas('clientAccount', (q) => {
        q.whereNull('deleted_at');
        q.whereHas('user', (u) => {
          u.whereNull('deleted_at');
        });
      })
      .paginate(page, Env.get('ITEMS_PER_PAGE'));

    const queryJson = query.toJSON();

    for (const request of queryJson.data) {
      const serviceName = await this.getServiceName(request.serviceType, request.resourceId);

      result.push({
        id: request.id,
        service_name: serviceName,
        service_type: request.serviceType,
        location_name: request.location.name,
        user_name: request.clientAccount.user.fullName,
        request_date: request.createdAt,
        inquire_type: request.inquireType,
        potential_earning: request.potentialEarnings
      });
    }

    return {
      toJSON() {
        return {
          data: result,
          meta: queryJson.meta
        };
      }
    };
  }

  static async approve(user: User, requestId: number) {
    await user.load('coworkUser');
    let initialPayment: any;
    initialPayment = 0;
    let serviceName: string;
    let resource: any;

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    try {
      const request: SpaceReserveRequest = await SpaceReserveRequest.query()
        .where('id', requestId)
        .where('cowork_account_id', user.coworkUser.coworkAccountId)
        .preload('clientAccount', (b) => {
          b.preload('user');
        })
        .first();

      if (!request) {
        throw new AppError(AppError.NOT_FOUND, 'Request not found');
      }

      switch (request.serviceType) {
        case ServicesEnum.MEETING_ROOM:
          resource = await Room.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        case ServicesEnum.OPEN_DESK:
          resource = await Desk.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        case ServicesEnum.PRIVATE_ROOM:
          resource = await Room.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        case ServicesEnum.VIRTUAL_OFFICE:
          resource = await VirtualOffice.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        default:
          serviceName = '';
      } // end switch case

      request.inquireType = SpaceReserveInquireTypesEnum.CLOSED_DEAL;
      await request.save();

      let iniPayment = request.initial_payment.toString();
      let resIniPStr =
        iniPayment.substring(0, iniPayment.length - 2) +
        '.' +
        iniPayment.substring(iniPayment.length - 2);

      initialPayment = dollarUSLocale.format(parseFloat(resIniPStr));

      this.sendServiceRequestConfEmailCoworker(
        request.clientAccount.user.firstName,
        request.requested_date.toLocaleString(DateTime.DATE_FULL),
        request.location_name,
        request.requested_service,
        request.term_size,
        request.auto_renew,
        request.contract_recurring,
        initialPayment,
        request.clientAccount.user.email,
        serviceName
      );

      return request;
    } catch (error) {
      throw error;
    } // end try catch
  }

  static async reject(user: User, requestId: number) {
    await user.load('coworkUser');

    let initialPayment: any;
    initialPayment = 0;

    let serviceName: string;
    let resource: any;

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    try {
      const request: SpaceReserveRequest = await SpaceReserveRequest.query()
        .where('id', requestId)
        .where('cowork_account_id', user.coworkUser.coworkAccountId)
        .preload('clientAccount', (b) => {
          b.preload('user');
        })
        .first();

      if (!request) {
        throw new AppError(AppError.NOT_FOUND, 'Request not found');
      }

      switch (request.serviceType) {
        case ServicesEnum.MEETING_ROOM:
          resource = await Room.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        case ServicesEnum.OPEN_DESK:
          resource = await Desk.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        case ServicesEnum.PRIVATE_ROOM:
          resource = await Room.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        case ServicesEnum.VIRTUAL_OFFICE:
          resource = await VirtualOffice.query().where('id', request.resourceId).first();
          serviceName = resource.name;
          break;
        default:
          serviceName = '';
      } // end switch case

      request.inquireType = SpaceReserveInquireTypesEnum.REJECTED_DEAL;
      await request.save();

      let iniPayment = request.initial_payment.toString();
      let resIniPStr =
        iniPayment.substring(0, iniPayment.length - 2) +
        '.' +
        iniPayment.substring(iniPayment.length - 2);

      initialPayment = dollarUSLocale.format(parseFloat(resIniPStr));

      this.sendServiceRequestRegeqEmailCoworker(
        request.clientAccount.user.firstName,
        request.requested_date.toLocaleString(DateTime.DATE_FULL),
        request.location_name,
        request.requested_service,
        request.term_size,
        request.auto_renew,
        request.contract_recurring,
        initialPayment,
        request.clientAccount.user.email,
        serviceName
      );

      return request;
    } catch (error) {
      throw error;
    } // end try catch
  }

  private static async getServiceName(serviceType: string, resourceId: number): Promise<string> {
    switch (serviceType) {
      case ServicesEnum.VIRTUAL_OFFICE:
        const virtualOffice = await VirtualOffice.find(resourceId);

        if (!virtualOffice) {
          return '';
        }

        return virtualOffice.name;
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.find(resourceId);

        if (!desk) {
          return '';
        }

        return desk.name;
      case ServicesEnum.PRIVATE_ROOM:
        const room = await Room.find(resourceId);

        if (!room) {
          return '';
        }

        return room.name;
    }

    return '';
  }

  private static async sendServiceRequestConfEmailCoworker(
    client_first_name: string,
    requested_date: string,
    location_name: string,
    service_name: string,
    term_size: string,
    auto_renew: string,
    monthly_contract: string,
    initial_value: number,
    client_email: string,
    service: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client_email)
        .subject(`${service_name} Request Approved.`)
        .htmlView('emails/coworker/dealsAndOpportunities/approved_service_application', {
          clientFirstName: client_first_name,
          requestDate: requested_date,
          serviceName: service_name,
          locationName: location_name,
          service: service,
          termSize: term_size,
          activeInactive: auto_renew,
          monthlyContract: monthly_contract,
          initialValue: initial_value,
          token: `${ApplicationUrls.AUTH.COWORKER_MEMBERSHIPS}`
        });
    });
  }

  private static async sendServiceRequestRegeqEmailCoworker(
    client_first_name: string,
    requested_date: string,
    location_name: string,
    service_name: string,
    term_size: string,
    auto_renew: string,
    monthly_contract: string,
    initial_value: number,
    client_email: string,
    service: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client_email)
        .subject(`${service_name} Request Declined.`)
        .htmlView('emails/coworker/dealsAndOpportunities/declined_service_application', {
          clientFirstName: client_first_name,
          requestDate: requested_date,
          serviceName: service_name,
          locationName: location_name,
          service: service,
          termSize: term_size,
          activeInactive: auto_renew,
          monthlyContract: monthly_contract,
          initialValue: initial_value,
          token: `${ApplicationUrls.AUTH.COWORKER_MEMBERSHIPS}`
        });
    });
  }
}
