import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database';
import ContractUsage from 'App/Models/ContractUsage';
import DayPass from 'App/Models/DayPass';
import DayPassTax from 'App/Models/DayPassTax';
import Desk from 'App/Models/Desk';
import Lead from 'App/Models/Lead';
import Location from 'App/Models/Location';
import Room from 'App/Models/Room';
import Service from 'App/Models/Service';
import User from 'App/Models/User';
import ApplicationFeeService from 'App/Services/ApplicationFeeService';
import CalendarService from 'App/Services/Cowork/CalendarService';
import ClientService from 'App/Services/Cowork/ClientService';
import InvoiceService, {
  InvoiceItemFeeInterface,
  InvoiceItemRequestInterface,
  InvoiceRequestInterface
} from 'App/Services/Cowork/InvoiceService';
import CoworkSettingsService from 'App/Services/Cowork/SettingsService';
import TaxesService from 'App/Services/Cowork/TaxesService';
import AppError from 'App/Utils/AppError';

import {
  DayPassPaymentMethodEnum,
  DayPassSolicitedByEnum,
  DayPassStatusEnum,
  DayPassUserTypeEnum,
  EventBookingTypes,
  ServicesEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';

export interface DayPassRequest {
  client_uuid: string;
  user_type: string;
  lead_id?: number;
  client_id?: number;
  location_id: number;
  date: DateTime;
  space: string;
  payment_method?: string;
  resource_id?: number;
}

export interface DayPassMail {
  coworking: string;
  serviceType: string;
  date: string;
}

export default class DayPassService {
  static async list(user: User, filters: any, paginate = true, page = 1) {
    await user.load('coworkUser');

    const query = DayPass.query()
      .preload('location')
      .preload('lead', (leadQuery) => {
        leadQuery.preload('clientAccount', (accountQuery) => {
          accountQuery.preload('user');
        });
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      })
      .where('deleted_at', null);

    if (filters.name) {
      query.whereHas('lead', (leadQuery) => {
        leadQuery.whereHas('clientAccount', (accountQuery) => {
          accountQuery.whereHas('user', (userQuery) => {
            userQuery
              .where('first_name', 'like', `%${filters.name}%`)
              .orWhere('last_name', 'like', `%${filters.name}%`);
          });
        });
      });
    }

    if (filters.email) {
      query.whereHas('lead', (leadQuery) => {
        leadQuery.whereHas('clientAccount', (accountQuery) => {
          accountQuery.whereHas('user', (userQuery) => {
            userQuery.where('email', filters.email);
          });
        });
      });
    }

    if (filters.date) {
      query.whereRaw('DATE(date) = ?', [filters.date]);
    }

    return (await paginate) ? query.paginate(page, Env.get('ITEMS_PER_PAGE')) : query;
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const dayPass = await DayPass.query()
      .preload('location')
      .preload('client')
      .where('id', id)
      .first();

    if (!dayPass || user.coworkUser.coworkAccountId !== dayPass.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Day Pass not found');
    }

    return dayPass;
  }

  static async store(user: User, data: DayPassRequest) {
    await user.load('coworkUser');
    const location = await Location.find(data.location_id);

    if (!location) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid request');
    }

    await location.load('coworkAccount');
    await location.load('address');

    if (location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.BAD_REQUEST, 'Location invalid');
    }

    // Check if desk or room is valid
    switch (data.space) {
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.find(data.resource_id);
        await desk?.load('location');

        if (
          !desk ||
          desk.location.coworkAccountId !== user.coworkUser.coworkAccountId ||
          desk.locationId !== data.location_id
        ) {
          throw new AppError(AppError.BAD_REQUEST, 'Invalid resource');
        }

        if (desk && !desk.dayPrice && data.payment_method === DayPassPaymentMethodEnum.CAPTURE) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'This desk does not accept capture as a payment method'
          );
        }

        break;
      case ServicesEnum.PRIVATE_ROOM:
        const room = await Room.find(data.resource_id);
        await room?.load('location');

        if (
          !room ||
          room.location.coworkAccountId !== user.coworkUser.coworkAccountId ||
          room.locationId !== data.location_id
        ) {
          throw new AppError(AppError.BAD_REQUEST, 'Invalid resource');
        }

        if (room && !room.dayPrice && data.payment_method === DayPassPaymentMethodEnum.CAPTURE) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'This room does not accept capture as a payment method'
          );
        }

        break;
    }

    const trx = await Database.transaction();

    const clientUuid = await User.query()
      .where('uuid', data.client_uuid)
      .andWhere('role', DayPassUserTypeEnum.CLIENT)
      .first();

    try {
      const daypass = await DayPass.create(
        {
          coworkAccountId: user.coworkUser.coworkAccountId,
          userType: data.user_type,
          locationId: location.id,
          clientId: clientUuid.id,
          leadId: data.lead_id,
          paymentMethod: data.payment_method,
          date: data.date,
          space: data.space,
          status: DayPassStatusEnum.APPROVED,
          resourceId: data.resource_id,
          solicitedBy: DayPassSolicitedByEnum.COWORK
        },
        { client: trx }
      );

      if (daypass.userType === DayPassUserTypeEnum.CLIENT) {
        await this.payment(daypass, user, trx);
      }

      await trx.commit();

      const client = await User.findOrFail(clientUuid.id);

      await this.sendBookDayPassEmail(client, {
        coworking: location.coworkAccount.name,
        serviceType: data.space,
        date: data.date.toFormat('MM/dd/yyyy')
      });

      if (daypass.status === DayPassStatusEnum.APPROVED) {
        await this.sendCalendarInvite(daypass);
      }

      return daypass;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  static async delete(id: number, user: User) {
    await user.load('coworkUser');

    const dayPass = await DayPass.query().where('id', id).preload('location').first();

    if (!dayPass || dayPass.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Day Pass not found');
    }

    const trx = await Database.transaction();

    try {
      dayPass.status = DayPassStatusEnum.CANCELED;
      await dayPass.useTransaction(trx).save();

      // Return of credits
      if (dayPass.userType === DayPassUserTypeEnum.CLIENT) {
        switch (dayPass.paymentMethod) {
          case DayPassPaymentMethodEnum.BENEFIT:
            await ContractUsage.query()
              .where('service_type', dayPass.space)
              .where('resource_id', dayPass.resourceId)
              .useTransaction(trx)
              .delete();
            break;
        }
      }

      await dayPass.softDelete();

      await trx.commit();
      Event.emit('day_pass:delete', { id: dayPass.id });
    } catch (e) {
      await trx.rollback();
      throw e;
    }

    try {
      const client = await User.findOrFail(dayPass.clientId);

      await this.cancelCalendarInvite(user.coworkUser.coworkAccountId, dayPass.resourceId);
      await this.sendBookDayPassCanceledEmail(client, {
        coworking: dayPass.coworkAccount.name,
        serviceType: dayPass.space,
        date: dayPass.date.toFormat('MM/dd/yyyy')
      });

      Event.emit('day_pass:reject', { id: dayPass.id });
    } catch (e) {
      // Ignore
    }

    return dayPass;
  }

  static async approve(id: number, user: User) {
    await user.load('coworkUser');

    const dayPass: DayPass = await DayPass.query()
      .where('id', id)
      .preload('location')
      .preload('coworkAccount')
      .firstOrFail();

    if (dayPass.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    if (dayPass.status === DayPassStatusEnum.APPROVED) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This Day Pass has already been approved.');
    }

    if (
      dayPass.status === DayPassStatusEnum.CANCELED ||
      dayPass.status === DayPassStatusEnum.REJECTED
    ) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This Day Pass cannot be approved.');
    }

    const trx = await Database.transaction();

    try {
      dayPass.status = DayPassStatusEnum.APPROVED;

      if (dayPass.solicitedBy === DayPassSolicitedByEnum.CLIENT) {
        await this.payment(dayPass, user, trx);
      }

      await dayPass.useTransaction(trx).save();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    try {
      const client = await User.findOrFail(dayPass.clientId);

      let paidAmount: any;
      paidAmount = 0.0;

      let assetName;
      let residualAmount: any;
      residualAmount = 0;

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      if (dayPass.space === 'OPEN_DESK') {
        assetName = 'Open Desk';
      } else {
        assetName = 'Private Room';
      }

      residualAmount = dayPass.residual_amount.toString();

      residualAmount =
        residualAmount.substring(0, residualAmount.length - 2) +
        '.' +
        residualAmount.substring(residualAmount.length - 2);

      residualAmount = dollarUSLocale.format(parseFloat(residualAmount));

      paidAmount = dollarUSLocale.format(dayPass.paid_amount);

      let paymentMethod: string;

      switch (dayPass.paymentMethod) {
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
      } // end switch case

      await this.sendDayPassApprovedEmailClient(
        client,
        dayPass.date.toLocaleString(DateTime.DATE_FULL),
        dayPass.location.name,
        assetName,
        paymentMethod,
        paidAmount,
        residualAmount
      );

      await this.sendCalendarInvite(dayPass);

      Event.emit('day_pass:approve', { id: dayPass.id });
    } catch (e) {
      // Ignore
    }

    return dayPass;
  }

  static async reject(id: number, user: User) {
    await user.load('coworkUser');

    const dayPass: DayPass = await DayPass.query()
      .where('id', id)
      .preload('location')
      .preload('coworkAccount')
      .firstOrFail();

    if (dayPass.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    if (dayPass.status === DayPassStatusEnum.REJECTED) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This Day Pass has already been rejected.');
    }

    if (dayPass.status === DayPassStatusEnum.CANCELED) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This Day Pass cannot be rejected.');
    }

    const trx = await Database.transaction();

    let assetName;
    let paidAmount: any;
    paidAmount = 0.0;
    let residualAmount: any;
    residualAmount = 0;

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    if (dayPass.space === 'OPEN_DESK') {
      assetName = 'Open Desk';
    } else {
      assetName = 'Private Room';
    }

    try {
      dayPass.status = DayPassStatusEnum.REJECTED;
      await dayPass.useTransaction(trx).save();

      // Return of credits
      if (dayPass.userType === DayPassUserTypeEnum.CLIENT) {
        switch (dayPass.paymentMethod) {
          case DayPassPaymentMethodEnum.BENEFIT:
            await ContractUsage.query()
              .where('service_type', dayPass.space)
              .where('resource_id', dayPass.id)
              .useTransaction(trx)
              .delete();
            break;
        }
      }

      await trx.commit();
      Event.emit('day_pass:rejected', { id: dayPass.id });
    } catch (e) {
      await trx.rollback();
      throw e;
    }

    try {
      let clientId;
      switch (dayPass.userType) {
        case DayPassUserTypeEnum.LEAD:
          const lead = await Lead.findOrFail(dayPass.leadId);
          await lead.load('clientAccount');
          clientId = lead.clientAccount.userId;
          break;

        case DayPassUserTypeEnum.CLIENT:
          clientId = dayPass.clientId;
          break;
      }

      residualAmount = dayPass.residual_amount.toString();

      residualAmount =
        residualAmount.substring(0, residualAmount.length - 2) +
        '.' +
        residualAmount.substring(residualAmount.length - 2);

      residualAmount = dollarUSLocale.format(parseFloat(residualAmount));

      paidAmount = dollarUSLocale.format(dayPass.paid_amount);

      const client = await User.findOrFail(clientId);

      let paymentMethod: string;

      switch (dayPass.paymentMethod) {
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
      } // end switch case

      await this.sendBookDayPassRejectedEmail(
        client,
        dayPass.date.toLocaleString(DateTime.DATE_FULL),
        dayPass.location.name,
        assetName,
        paymentMethod,
        paidAmount,
        residualAmount
      );

      await this.cancelCalendarInvite(user.coworkUser.coworkAccountId, dayPass.resourceId);

      Event.emit('day_pass:reject', { id: dayPass.id });
    } catch (e) {
      // Ignore
    }

    return dayPass;
  }

  private static async payment(daypass: DayPass, user: User, trx: TransactionClientContract) {
    const taxes = await TaxesService.getAutomaticTaxes(daypass.coworkAccountId, daypass.space);
    await daypass.useTransaction(trx).related('taxes').createMany(taxes);

    switch (daypass.paymentMethod) {
      case DayPassPaymentMethodEnum.BENEFIT:
        // Get list of contracts with credits available
        const benefitsAvailableMinutes = await ClientService.getServiceAvailableCreditsMonth(
          user,
          daypass.clientId,
          daypass.locationId,
          daypass.space,
          daypass.resourceId
        );

        // Sum of contracts benefits and utilization calc
        let contractsToUpdate: any[] = [];
        let hasCreditAvailable = false;
        for (const a of benefitsAvailableMinutes) {
          if (a.quantity >= 1) {
            hasCreditAvailable = true;
            contractsToUpdate.push({
              contractId: a.contractId,
              quantityUsed: 1
            });
            break;
          }
        }

        if (!hasCreditAvailable) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'The customer has no credits available. Try using another payment method.'
          );
        }

        // Save contract usage historic
        const usages: any[] = [];
        for (const contract of contractsToUpdate) {
          usages.push({
            contractId: contract.contractId,
            userId: daypass.clientId,
            serviceType: daypass.space,
            quantityCredits: 1,
            bookingDate: DateTime.now().toFormat('yyyy-MM-dd'),
            resourceId: daypass.id
          });
        }
        await ContractUsage.createMany(usages, { client: trx });
        break;
      case DayPassPaymentMethodEnum.CAPTURE:
        const serviceInfo = await this.getServiceInfo(daypass.resourceId, daypass.space);
        await daypass.load('taxes');
        await daypass.load('location');

        const coworkSettings = await CoworkSettingsService.getSettings(
          daypass.location.coworkAccountId
        );
        const today = DateTime.local();
        let dueDate: DateTime = DateTime.local();

        // Calculate dueDate
        if (today.day > coworkSettings.recurringInvoiceDueDate) {
          dueDate = dueDate.plus({ month: 1 }).set({ day: coworkSettings.recurringInvoiceDueDate });
        } else {
          dueDate = dueDate.set({ day: coworkSettings.recurringInvoiceDueDate });
        }

        const total = serviceInfo.price;
        const userId = daypass.clientId;

        const fees = this.convertDaypassTaxToInvoiceItemFee(daypass.taxes);
        const applicationFee = await ApplicationFeeService.calculate(
          userId,
          daypass.coworkAccountId,
          daypass.space,
          daypass.locationId,
          daypass.resourceId,
          total
        );

        const daypassData: InvoiceItemRequestInterface = {
          name: `Day Pass - ${serviceInfo.name}`,
          unit_price: total,
          service_type: daypass.space,
          resource_id: daypass.resourceId,
          date: DateTime.local(),
          description: '',
          quantity: 1,
          fees: fees
        };

        const clientUser = await User.query().where('id', userId).first();

        const invoiceData: InvoiceRequestInterface = {
          location_id: daypass.locationId,
          client_uuid: clientUser.uuid,
          date: DateTime.local(),
          due_date: dueDate,
          items: [daypassData],
          application_fee: applicationFee
        };

        const invoice = await InvoiceService.store(user, invoiceData);
        daypass.invoiceId = invoice.id;
        daypass.priceCharged = total;
        daypass.status = DayPassStatusEnum.WAITING_PAYMENT;
        await daypass.useTransaction(trx).save();
        break;
    }
  }

  private static convertDaypassTaxToInvoiceItemFee(taxes: DayPassTax[]): InvoiceItemFeeInterface[] {
    return taxes.map((t) => ({
      name: t.name,
      value: t.value,
      type: t.type,
      method: t.method,
      recurring_type: t.recurringType,
      taxes: []
    }));
  }

  private static async getServiceInfo(id: number, space: ServicesEnum | string) {
    let result = { name: '', price: 0 };

    switch (space) {
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.find(id);
        if (desk) {
          result.name = desk.name;
          result.price = desk.dayPrice;
        }
        break;
      case ServicesEnum.PRIVATE_ROOM:
        const room = await Room.find(id);
        if (room) {
          result.name = room.name;
          result.price = room.dayPrice;
        }
        break;
    }

    return result;
  }

  private static async sendBookDayPassEmail(user: User, data: DayPassMail) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Booking Request')
        .htmlView('emails/book_daypass_solicited', data);
    });
  }

  static async sendDayPassApprovedEmailClient(
    user: User,
    passDate: string,
    locationName: string,
    assetName: string,
    paymentMethod: string,
    paidAmount: number,
    residualAmount: number
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Your Day Pass request has been approved')
        .htmlView('emails/coworker/dayPasses/approved_day_pass', {
          userFirstName: user.firstName,
          passDate: passDate,
          locationName: locationName,
          assetName: assetName,
          paymentMethod: paymentMethod,
          paidAmount: paidAmount,
          residualAmount: residualAmount
        });
    });
  }

  private static async sendBookDayPassRejectedEmail(
    user: User,
    passDate: string,
    locationName: string,
    assetName: string,
    paymentMethod: string,
    paidAmount: number,
    residualAmount: number
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Your Day Pass request was declined')
        .htmlView('emails/coworker/dayPasses/declined_day_pass', {
          userFirstName: user.firstName,
          passDate: passDate,
          locationName: locationName,
          assetName: assetName,
          paymentMethod: paymentMethod,
          paidAmount: paidAmount,
          residualAmount: residualAmount
        });
    });
  }

  private static async sendBookDayPassCanceledEmail(user: User, data: DayPassMail) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Your booking request was canceled')
        .htmlView('emails/book_daypass_canceled', data);
    });
  }

  private static async sendCalendarInvite(daypass: DayPass) {
    let user;
    await daypass.load('location');

    if (daypass.userType === DayPassUserTypeEnum.CLIENT) {
      await daypass.load('client');
      user = daypass.client;
    } else {
      await daypass.load('lead');
      user = daypass.lead;
    }

    if (daypass.status === DayPassStatusEnum.APPROVED) {
      await CalendarService.createOrUpdate(daypass.location.coworkAccountId, {
        booking_type: EventBookingTypes.DAY_PASS,
        resource_id: daypass.id,
        summary: `Day Pass - ${daypass.location.name}`,
        description: this.generateCalendarMessage(
          daypass.location.name,
          daypass.date,
          daypass.space
        ),
        location_name: daypass.location.name,
        location_address: daypass.location.address?.fulltext || '',
        end_datetime: daypass.date,
        start_datetime: daypass.date,
        is_full_day: true,
        client_name: user.fullName,
        client_email: user.email
      });
    }
  }

  private static async cancelCalendarInvite(coworkAccountId: number, resourceId: number) {
    await CalendarService.destroy(coworkAccountId, EventBookingTypes.DAY_PASS, resourceId);
  }

  private static generateCalendarMessage(locationName: string, date: DateTime, service: string) {
    let serviceFormatted = Service.formatServiceName(service);
    let dateFormatted = date.toFormat('MM/dd/yyyy');

    return `You have a confirmed day pass in ${locationName} on date ${dateFormatted} for service ${serviceFormatted}.`;
  }

  static async confirmDayPassFromPayment(invoiceId: number) {
    // Check if invoice is from DayPass and update status
    const daypass = await DayPass.query().where('invoice_id', invoiceId).first();

    if (daypass) {
      daypass.status = DayPassStatusEnum.APPROVED;
      await this.sendCalendarInvite(daypass);

      await daypass.save();
    }
  }
}
