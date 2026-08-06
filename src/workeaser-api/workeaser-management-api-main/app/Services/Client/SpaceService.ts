import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import CoworkUser from 'App/Models/CoworkUser';
import Desk from 'App/Models/Desk';
import Location from 'App/Models/Location';
import Room from 'App/Models/Room';
import SpaceReserveRequest from 'App/Models/SpaceReserveRequest';
import User from 'App/Models/User';
import VirtualOffice from 'App/Models/VirtualOffice';
import ContractService from 'App/Services/Cowork/ContractService';
import NotificationsService from 'App/Services/NotificationsService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import {
  ContractPaymentStyleEnum,
  ContractTermEnum,
  NotificationTypeEnum,
  ServicesEnum,
  SpaceReserveInquireTypesEnum
} from 'Contracts/enums';

import { DateTime } from 'luxon';

interface SpaceDataRequest {
  location_id: number;
  service_type: string;
  resource_id: number;
  term_size: string;
  auto_renewal: boolean;
  payment_recurring_style: string;
}

export default class SpaceService {
  static async reserveNow(user: User, data: SpaceDataRequest) {
    await user.load('clientAccount');
    let resource;
    let potentialEarnings: any;
    potentialEarnings = 0;
    let requestedService;
    let term;
    let autoRen;
    let contractRecurring;
    let initialPayment: any;
    initialPayment = 0;
    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    let sumFees = 0;
    let serviceName: string = '';

    switch (data.term_size) {
      case ContractTermEnum.MONTH_1:
        term = 'One Month';
        break;
      case ContractTermEnum.MONTH_3:
        term = 'Three Months';
        break;
      case ContractTermEnum.MONTH_6:
        term = 'Six Months';
        break;
      case ContractTermEnum.YEAR_1:
        term = 'One Year';
        break;
      case ContractTermEnum.YEAR_2:
        term = 'Two Years';
        break;
      case ContractTermEnum.YEAR_3:
        term = 'Three Years';
        break;
      default:
        term = 'One Month';
    }

    switch (data.service_type) {
      case ServicesEnum.VIRTUAL_OFFICE:
        const virtualOffice = await VirtualOffice.find(data.resource_id);
        requestedService = 'Virtual Office';

        if (!virtualOffice) {
          throw new AppError(AppError.VALIDATION_FAIL, 'Virtual Office not found');
        }

        serviceName = virtualOffice.name;

        await virtualOffice.load('prices', (b) => {
          b.where('duration', data.term_size);
        });

        await virtualOffice.load('fees', (f) => {
          f.select('amount');
        });

        sumFees = virtualOffice.fees.reduce((accumulator, object) => {
          return accumulator + object.amount;
        }, 0);

        if (!virtualOffice.prices[0]) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'There is no Virtual Office plan available for this contract term size.'
          );
        }

        if (
          data.payment_recurring_style === ContractPaymentStyleEnum.TOTAL &&
          virtualOffice.prices[0].fullPrice
        ) {
          potentialEarnings = virtualOffice.prices[0].fullPrice + sumFees;
          initialPayment = potentialEarnings;
        } else {
          potentialEarnings =
            virtualOffice.prices[0].monthlyPrice *
              ContractService.getTermsizeInMonths(data.term_size) +
            sumFees;
          initialPayment = virtualOffice.prices[0].monthlyPrice + sumFees;
        }

        resource = virtualOffice;
        break;
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.find(data.resource_id);
        requestedService = 'Open Desk';

        if (!desk) {
          throw new AppError(AppError.VALIDATION_FAIL, 'Desk not found');
        }

        serviceName = desk.name;

        await desk.load('prices', (b) => {
          b.where('duration', data.term_size);
        });

        await desk.load('fees', (f) => {
          f.select('amount');
        });

        sumFees = desk.fees.reduce((accumulator, object) => {
          return accumulator + object.amount;
        }, 0);

        if (!desk.prices[0]) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'There is no Desk plan available for this contract term size.'
          );
        }

        if (
          data.payment_recurring_style === ContractPaymentStyleEnum.TOTAL &&
          desk.prices[0].fullPrice
        ) {
          potentialEarnings = desk.prices[0].fullPrice + sumFees;
          initialPayment = potentialEarnings;
        } else {
          potentialEarnings =
            desk.prices[0].monthlyPrice * ContractService.getTermsizeInMonths(data.term_size) +
            sumFees;
          initialPayment = desk.prices[0].monthlyPrice + sumFees;
        }

        resource = desk;
        break;
      case ServicesEnum.PRIVATE_ROOM:
        const room = await Room.find(data.resource_id);
        requestedService = 'Private Room';
        if (!room) {
          throw new AppError(AppError.VALIDATION_FAIL, 'Room not found');
        }

        serviceName = room.name;

        await room.load('prices', (b) => {
          b.where('duration', data.term_size);
        });

        await room.load('fees', (f) => {
          f.select('amount');
        });

        sumFees = room.fees.reduce((accumulator, object) => {
          return accumulator + object.amount;
        }, 0);

        if (!room.prices[0]) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'There is no Room plan available for this contract term size.'
          );
        }

        if (
          data.payment_recurring_style === ContractPaymentStyleEnum.TOTAL &&
          room.prices[0].fullPrice
        ) {
          potentialEarnings = room.prices[0].fullPrice + sumFees;
          initialPayment = potentialEarnings;
        } else {
          potentialEarnings =
            room.prices[0].monthlyPrice * ContractService.getTermsizeInMonths(data.term_size) +
            sumFees;
          initialPayment = room.prices[0].monthlyPrice + sumFees;
        }

        resource = room;
        break;
    }

    const location = await Location.query().where('id', data.location_id).first();

    const requestDate = DateTime.now();

    console.log('Date: ' + requestDate);

    if (data.auto_renewal) {
      autoRen = 'Active';
    } else {
      autoRen = 'Inactive';
    }
    if (data.payment_recurring_style === 'TOTAL') {
      contractRecurring = 'Total';
    } else {
      contractRecurring = 'Monthly';
    }

    const reserveRequest = await SpaceReserveRequest.create({
      coworkAccountId: location.coworkAccountId,
      locationId: resource.locationId,
      clientAccountId: user.clientAccount.id,
      serviceType: data.service_type,
      resourceId: data.resource_id,
      inquireType: SpaceReserveInquireTypesEnum.NEW_OPPORTUNITY,
      potentialEarnings: potentialEarnings,
      requested_date: requestDate,
      initial_payment: initialPayment,
      term_size: data.term_size,
      contract_recurring: data.payment_recurring_style,
      auto_renew: autoRen,
      requested_service: requestedService,
      location_name: location.name
    });

    const userToSendId = await CoworkUser.query()
      .where('cowork_account_id', location.coworkAccountId)
      .first();

    await NotificationsService.create({
      title: 'Space Reserve',
      message: `${user.firstName} ${user.lastName} requested a space reservation.`,
      client_id: user.id,
      cowork_account_id: location.coworkAccountId,
      type: NotificationTypeEnum.COWORK
    });

    let iniPayment = initialPayment.toString();
    let resIniPStr =
      iniPayment.substring(0, iniPayment.length - 2) +
      '.' +
      iniPayment.substring(iniPayment.length - 2);

    initialPayment = dollarUSLocale.format(parseFloat(resIniPStr));

    let potEarn = potentialEarnings.toString();
    let resPotEarnStr =
      potEarn.substring(0, potEarn.length - 2) + '.' + potEarn.substring(potEarn.length - 2);

    potentialEarnings = dollarUSLocale.format(parseFloat(resPotEarnStr));

    this.sendServiceRequestEmailCoworker(
      user,
      location.name,
      requestedService,
      term,
      autoRen,
      contractRecurring,
      initialPayment,
      requestDate.toLocaleString(DateTime.DATE_FULL),
      serviceName
    );

    this.sendServiceRequestEmailCoworking(
      user,
      userToSendId.userId,
      location.name,
      requestedService,
      potentialEarnings,
      requestDate.toLocaleString(DateTime.DATE_FULL),
      serviceName,
      reserveRequest.id,
      term,
      autoRen,
      contractRecurring
    );

    return { id: reserveRequest.id };
  }

  private static async sendServiceRequestEmailCoworker(
    user: User,
    location_name: string,
    requested_service: string,
    term: string,
    auto_renew: string,
    contract_recurring: string,
    initial_payment: number,
    requestDate: string,
    service: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email)
        .subject(requested_service + ` Application`)
        .htmlView('emails/coworker/dealsAndOpportunities/service_application', {
          clientFirstName: user.firstName,
          requestDate: requestDate,
          serviceName: requested_service,
          locationName: location_name,
          termSize: term,
          service: service,
          activeInactive: auto_renew,
          monthlyContract: contract_recurring,
          initialValue: initial_payment
        });
    });
  }

  private static async sendServiceRequestEmailCoworking(
    user: User,
    id: number,
    location_name: string,
    requested_service: string,
    potential_gains: number,
    requestDate: string,
    service: string,
    dealId: number,
    termSize: string,
    activeInactive: string,
    monthlyContract: string
  ) {
    const coworkingUser = await User.findOrFail(id);

    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(coworkingUser.email)
        .subject(`Deal & Opportunity for ` + requested_service)
        .htmlView('emails/coworking/dealsAndOpportunities/receiving_deal', {
          coWorkingfirstName: coworkingUser.firstName,
          requestDate: requestDate,
          requestorName: user.firstName,
          locationName: location_name,
          serviceName: requested_service,
          service: service,
          termSize: termSize,
          activeInactive: activeInactive,
          monthlyContract: monthlyContract,
          potentialGains: potential_gains,
          token: `${ApplicationUrls.AUTH.DEAL}` + dealId
        });
    });
  }
}
