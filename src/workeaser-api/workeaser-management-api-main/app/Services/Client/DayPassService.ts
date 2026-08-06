import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database from '@ioc:Adonis/Lucid/Database';
import CoworkUser from 'App/Models/CoworkUser';
import DayPass from 'App/Models/DayPass';
import Desk from 'App/Models/Desk';
import Lead from 'App/Models/Lead';
import Location from 'App/Models/Location';
import Room from 'App/Models/Room';
import Service from 'App/Models/Service';
import User from 'App/Models/User';
import NotificationsService from 'App/Services/NotificationsService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import {
  DayPassSolicitedByEnum,
  DayPassUserTypeEnum,
  NotificationTypeEnum,
  DayPassPaymentMethodEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';

export interface DayPassLead {
  location_id: number;
  date: DateTime;
  space: string;
  resource_id: number;
}

export interface DayPassClient {
  payment_method: string;
  location_id: number;
  date: DateTime;
  space: string;
  resource_id: number;
}

export default class DayPassService {
  static async lead(user: User, data: DayPassLead) {
    await user.load('clientAccount');

    const location = await Location.find(data.location_id);
    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const trx = await Database.transaction();

    try {
      const lead = await Lead.firstOrCreate(
        {
          clientAccountId: user.clientAccount.id,
          coworkAccountId: location.coworkAccountId
        },
        undefined,
        { client: trx }
      );

      const service = await Service.findBy('slug', data.space);
      if (service) {
        await lead.useTransaction(trx).related('opportunities').create({
          serviceId: service.id
        });
      }

      const newDayPass = await new DayPass()
        .merge({
          coworkAccountId: location.coworkAccountId,
          userType: DayPassUserTypeEnum.LEAD,
          locationId: location.id,
          leadId: lead.id,
          date: data.date,
          space: data.space,
          resourceId: data.resource_id,
          solicitedBy: DayPassSolicitedByEnum.CLIENT
        })
        .useTransaction(trx)
        .save();

      await trx.commit();

      Event.emit('day_pass:requested_lead', { id: newDayPass.id });

      return newDayPass;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async clientRequestDayPass(user: User, data: DayPassClient) {
    await user.load('clientAccount');

    let requestOrigin = 'Member';

    let paidAmount: any;
    paidAmount = 0.0;

    let residualAmount: any;
    residualAmount = 0;

    let resdAmount = 0;

    let paymentMethod: string;

    let serviceName: string = '';

    switch (data.payment_method) {
      case DayPassPaymentMethodEnum.BENEFIT:
        paymentMethod = 'Workspace Benefit';
        break;
      case DayPassPaymentMethodEnum.CAPTURE:
        paymentMethod = 'Captured Payment';
        break;
      case DayPassPaymentMethodEnum.PAY_SPACE:
        paymentMethod = 'Pay at the Space';
        break;
      case DayPassPaymentMethodEnum.WORKEASER_CREDIT:
        paymentMethod = 'Membership Credit';
        break;
      default:
        paymentMethod = '';
    }

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    const location = await Location.find(data.location_id);
    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    if (user.clientAccount.cowork_account_id !== location.coworkAccountId) {
      requestOrigin = 'Workeaser';
    }

    let assetName;
    let resource: any;

    if (data.space === 'OPEN_DESK') {
      assetName = 'Open Desk';

      resource = await Desk.query().where('id', data.resource_id).first();

      if (!resource) {
        throw new AppError(AppError.BAD_REQUEST, 'Open Desk not found');
      }

      serviceName = resource.name;

      resdAmount = resource.dayPrice;

      residualAmount = resource.dayPrice.toString();

      residualAmount =
        residualAmount.substring(0, residualAmount.length - 2) +
        '.' +
        residualAmount.substring(residualAmount.length - 2);

      residualAmount = dollarUSLocale.format(parseFloat(residualAmount));
    } else {
      assetName = 'Private Room';

      resource = await Room.query().where('id', data.resource_id).first();

      if (!resource) {
        throw new AppError(AppError.BAD_REQUEST, 'Private Room not found');
      }

      serviceName = resource.name;

      resdAmount = resource.dayPrice;

      residualAmount = resource.dayPrice.toString();

      residualAmount =
        residualAmount.substring(0, residualAmount.length - 2) +
        '.' +
        residualAmount.substring(residualAmount.length - 2);

      residualAmount = dollarUSLocale.format(parseFloat(residualAmount));
    }

    const trx = await Database.transaction();

    try {
      const newDayPass = await new DayPass()
        .merge({
          coworkAccountId: location.coworkAccountId,
          userType: DayPassUserTypeEnum.CLIENT,
          locationId: location.id,
          clientId: user.id,
          resourceId: data.resource_id,
          paymentMethod: data.payment_method,
          date: data.date,
          space: data.space,
          solicitedBy: DayPassSolicitedByEnum.CLIENT,
          paid_amount: paidAmount,
          residual_amount: resdAmount
        })
        .useTransaction(trx)
        .save();

      await trx.commit();

      Event.emit('day_pass:requested', { id: newDayPass.id });

      await NotificationsService.create({
        title: 'Day Pass',
        message: `${user.firstName} ${user.lastName} requested a day pass`,
        type: NotificationTypeEnum.COWORK,
        client_id: user.id,
        cowork_account_id: location.coworkAccountId
      });

      paidAmount = dollarUSLocale.format(paidAmount);

      this.sendDayPassEmailClient(
        user,
        data.date.toLocaleString(DateTime.DATE_FULL),
        location.name,
        assetName,
        paymentMethod,
        paidAmount,
        residualAmount,
        serviceName
      );

     this.sendDayPassEmailCoworking(
        requestOrigin,
        user.firstName,
        location.coworkAccountId,
        data.date.toLocaleString(DateTime.DATE_FULL),
        location.name,
        assetName,
        residualAmount,
        serviceName
      );

      return newDayPass;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async sendDayPassEmailClient(
    user: User,
    passDate: string,
    locationName: string,
    assetName: string,
    paymentMethod: string,
    paidAmount: number,
    residualAmount: number,
    service: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Day Pass Application')
        .htmlView('emails/coworker/dayPasses/day_pass_application', {
          userFirstName: user.firstName,
          passDate: passDate,
          locationName: locationName,
          assetName: assetName,
          service: service,
          paymentMethod: paymentMethod,
          paidAmount: paidAmount,
          residualAmount: residualAmount
        });
    });
  }

  static async sendDayPassEmailCoworking(
    requestOrigin: string,
    requestorName: string,
    coworkAccountId: number,
    passDate: string,
    locationName: string,
    assetName: string,
    potentialGains: number,
    service: string
  ) {
    const coworkUser = await CoworkUser.findByOrFail('cowork_account_id', coworkAccountId);

    const user = await User.findOrFail(coworkUser.userId);

    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Day Pass Application')
        .htmlView('emails/coworking/dayPasses/receiving_day_pass', {
          requestOrigin: requestOrigin,
          userFirstName: user.firstName,
          passDate: passDate,
          requestorName: requestorName,
          locationName: locationName,
          assetName: assetName,
          service: service,
          potentialGains: potentialGains,
          token: `${ApplicationUrls.AUTH.DAY_PASS_REQUEST}`
        });
    });
  }
}
