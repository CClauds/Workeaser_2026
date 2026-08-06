import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database';
import ContractUsage from 'App/Models/ContractUsage';
import CoworkUser from 'App/Models/CoworkUser';
import Invoice from 'App/Models/Invoice';
import Location from 'App/Models/Location';
import Meeting from 'App/Models/Meeting';
import MeetingBilling from 'App/Models/MeetingBilling';
import MeetingTax from 'App/Models/MeetingTax';
import Meetroom from 'App/Models/Meetroom';
import User from 'App/Models/User';
import InvoiceService from 'App/Services/Client/InvoiceService';
import TaxesService from 'App/Services/Cowork/TaxesService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import {
  DayPassPaymentMethodEnum,
  MeetingPaymentMethodEnum,
  MeetingSolicitedByEnum,
  MeetingStatusEnum,
  RefundType,
  ServicesEnum,
  TaxMethodsEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';

export interface MeetroomRequest {
  payment_method: string;
  location_id: number;
  meetroom_id: number;
  date_start: DateTime;
  date_end: DateTime;
  additional_information?: string;
}

interface MeetingData {
  id: number;
  location: Location;
  meetroom: Meetroom;
  date_start: DateTime;
  date_end: DateTime;
  quantity_minutes: number;
  price_per_hour: number;
  amount_hours: number;
  fees: MeetingTax[];
  total_minutes_billing: number;
  amount_discount: number;
  total: number;
  payment_method: string;
  additional_information?: string;
  status: string;
  invoice_id?: number;
  discount_type?: string;
  discount_value?: number;
}

export default class MeetingService {
  static async list(user: User, page = 1) {
    const query = Meeting.query()
      .preload('meetroom')
      .preload('taxes')
      .preload('location')
      .where('user_id', user.id)
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      });

    return await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
  }

  static async show(user: User, id: number) {
    const meeting = await Meeting.query()
      .preload('taxes')
      .preload('billings')
      .preload('meetroom')
      .preload('location')
      .where('id', id)
      .where('user_id', user.id)
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!meeting) {
      throw new AppError(AppError.NOT_FOUND, 'Meeting not found');
    }

    let totalMinToBePaid = 0;

    switch (meeting.paymentMethod) {
      case MeetingPaymentMethodEnum.BENEFIT:
        totalMinToBePaid = meeting.billings.reduce((p, c) => p + c.quantityMinutes, 0);
        break;
      case MeetingPaymentMethodEnum.BILLING:
        totalMinToBePaid = meeting.billings.reduce((p, c) => p + c.quantityMinutes, 0);
        break;
      case MeetingPaymentMethodEnum.CAPTURE:
        totalMinToBePaid = meeting.quantityMinutes;
        break;
      case MeetingPaymentMethodEnum.COURTESY:
        totalMinToBePaid = 0;
        break;
      case MeetingPaymentMethodEnum.PAY_SPACE:
        totalMinToBePaid = meeting.quantityMinutes;
        break;
    }

    const costBilling = Math.round((totalMinToBePaid / 60) * (meeting.pricePerHour / 100) * 100);

    const unitPrice = Math.max(0, costBilling - meeting.amountDiscount);
    let totalTaxes = 0;

    meeting.taxes.forEach((tax) => {
      let price = 0;

      if (tax.method === TaxMethodsEnum.FIXED) {
        price = tax.value;
      }

      if (tax.method === TaxMethodsEnum.PERCENTAGE) {
        price = Math.round(unitPrice * (tax.value / 10000));
      }

      totalTaxes += price;
    });

    const total = Math.round(unitPrice + totalTaxes);

    const data: MeetingData = {
      id: meeting.id,
      location: meeting.location,
      meetroom: meeting.meetroom,
      date_start: meeting.dateStart,
      date_end: meeting.dateEnd,
      quantity_minutes: meeting.quantityMinutes,
      price_per_hour: meeting.pricePerHour,
      amount_hours: costBilling,
      fees: meeting.taxes,
      total_minutes_billing: totalMinToBePaid,
      amount_discount: meeting.amountDiscount,
      total: total,
      payment_method: meeting.paymentMethod,
      status: meeting.status,
      invoice_id: meeting.invoiceId,
      additional_information: meeting.additionalInformation,
      discount_type: meeting.discountType,
      discount_value: meeting.discountValue
    };

    return data;
  }

  static async bookMeeting(data: MeetroomRequest, user: User) {
    const location = await Location.find(data.location_id);
    const meetroom = await Meetroom.find(data.meetroom_id);
    const client = await User.find(user.id);
    await client?.load('clientAccount');
    const coworkUser = await CoworkUser.findByOrFail(
      'cowork_account_id',
      location?.coworkAccountId
    );
    const coworking = await User.find(coworkUser?.userId);

    let meetingTime: string;

    let requestOrigin = 'Member';

    if (!location || !meetroom || !client || !coworking) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid request');
    }

    if (meetroom.locationId !== location.id) {
      throw new AppError(AppError.BAD_REQUEST, 'Meetroom invalid');
    }

    if (user.clientAccount.cowork_account_id !== location.coworkAccountId) {
      requestOrigin = 'Workeaser';
    }

    const meetingDateIsAvailable = await this.checkIfDatesIsAvailable(
      data.location_id,
      data.meetroom_id,
      data.date_start,
      data.date_end
    );

    if (!meetingDateIsAvailable) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This date and time is not available.');
    }

    const totalMinutes = this.calcTotalMinutes(data.date_start, data.date_end);
    const pricePerHour = meetroom.calcPricePerHour(totalMinutes);
    const costHours = Math.round((totalMinutes / 60) * (pricePerHour / 100) * 100);

    const trx = await Database.transaction();

    try {
      const meeting = await Meeting.create(
        {
          coworkAccountId: location.coworkAccountId,
          locationId: location.id,
          meetroomId: meetroom.id,
          userId: user.id,
          quantityMinutes: totalMinutes,
          pricePerHour: pricePerHour,
          costHours: costHours,
          dateStart: data.date_start,
          dateEnd: data.date_end,
          additionalInformation: data.additional_information,
          status: MeetingStatusEnum.SOLICITED,
          paymentMethod: data.payment_method,
          solicitedBy: MeetingSolicitedByEnum.CLIENT,
          discountValue: 0,
          amountDiscount: 0
        },
        { client: trx }
      );

      const automaticTaxes = await TaxesService.getAutomaticTaxes(
        location.coworkAccountId,
        ServicesEnum.MEETING_ROOM
      );

      await meeting.useTransaction(trx).related('taxes').createMany(automaticTaxes);
      await trx.commit();

      meetingTime =
        data.date_start.toLocaleString(DateTime.TIME_WITH_SECONDS) +
        ' - ' +
        data.date_end.toLocaleString(DateTime.TIME_WITH_SECONDS);

      let paidAmount: any;
      paidAmount = 0.0;
      let residualAmount: any;
      residualAmount = 0;

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      residualAmount = costHours.toString();

      residualAmount =
        residualAmount.substring(0, residualAmount.length - 2) +
        '.' +
        residualAmount.substring(residualAmount.length - 2);

      residualAmount = dollarUSLocale.format(parseFloat(residualAmount));

      paidAmount = dollarUSLocale.format(paidAmount);

      let paymentMethod: string;

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
      } // end switch case

      this.sendMeetingEmailClient(
        client,
        location.name,
        'Meeting Room',
        data.date_start.toLocaleString(DateTime.DATE_FULL),
        meetingTime,
        paymentMethod,
        paidAmount,
        residualAmount,
        meetroom.name
      );

      this.sendMeetingEmailCoworking(
        coworking,
        client,
        requestOrigin,
        location.name,
        'Meeting Room',
        data.date_start.toLocaleString(DateTime.DATE_FULL),
        meetingTime,
        paymentMethod,
        paidAmount,
        residualAmount,
        meetroom.name
      );

      return meeting;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  static async cancelMeeting(meetingId: number, user: User) {
    const meeting: Meeting = await Meeting.query()
      .where('id', meetingId)
      .where('user_id', user.id)
      .first();

    if (!meeting) {
      throw new AppError(AppError.NOT_FOUND, 'Meeting not found');
    }

    if (meeting.status === MeetingStatusEnum.REJECTED) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This meeting cannot be approved');
    }

    if (meeting.dateStart < DateTime.local()) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'It is not possible to cancel a meetroom appointment that has already started or ended.'
      );
    }

    const trx = await Database.transaction();

    try {
      await this.cancelPayment(meeting, trx);
      meeting.status = MeetingStatusEnum.CANCELED;
      await meeting.useTransaction(trx).save();

      await trx.commit();
      return meeting;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  private static async cancelPayment(meeting: Meeting, trx: TransactionClientContract) {
    const meetroom = await Meetroom.findBy('id', meeting.meetroomId);

    if (!meetroom) {
      return true;
    }

    const refundType = meetroom.calcRefund(meeting.dateStart);
    await this.doRefund(meeting, refundType, trx);
  }

  private static async doRefund(
    meeting: Meeting,
    type: RefundType,
    trx: TransactionClientContract
  ) {
    switch (meeting.paymentMethod) {
      case MeetingPaymentMethodEnum.BENEFIT:
        await ContractUsage.query()
          .where('service_type', ServicesEnum.MEETING_ROOM)
          .where('resource_id', meeting.id)
          .useTransaction(trx)
          .delete();
        await MeetingBilling.query().where('meeting_id', meeting.id).useTransaction(trx).delete();
        break;
      case MeetingPaymentMethodEnum.BILLING:
        await MeetingBilling.query().where('meeting_id', meeting.id).useTransaction(trx).delete();
        break;
      case MeetingPaymentMethodEnum.CAPTURE:
        if (meeting.invoiceId) {
          let amount = 0;
          const invoice = await Invoice.findOrFail(meeting.invoiceId);
          const invoiceDetails = await invoice.getDetailed();

          switch (type) {
            case RefundType.FULL_REFUND:
              amount = invoiceDetails.total_invoice_paid;
              break;
            case RefundType.PARTIAL_REFUND:
              amount = Math.round(invoiceDetails.total_invoice_paid / 2);
              break;
            case RefundType.NO_REFUND:
              break;
          }

          if (amount) {
            const paymentsToRefund = await InvoiceService.calcPaymentsToRefund(
              meeting.invoiceId,
              amount
            );

            for (const payment of paymentsToRefund) {
              await InvoiceService.refundPayment(payment.paymentId, payment.amount);
            }
          }
        }
        break;
    }
  }

  private static calcTotalMinutes(start: DateTime, end: DateTime): number {
    return end.diff(start).as('minutes');
  }

  private static async checkIfDatesIsAvailable(
    locationId: number,
    meetroomId: number,
    dateStart: DateTime,
    dateEnd: DateTime
  ): Promise<boolean> {
    const check = await Meeting.query()
      .where('location_id', locationId)
      .where('meetroom_id', meetroomId)
      .andWhere('status', MeetingStatusEnum.APPROVED)
      .where((query) => {
        query.where('date_start', '<=', dateEnd.toSQL());
        query.andWhere('date_end', '>=', dateStart.toSQL());
      })
      .whereNull('deleted_at')
      .first();

    return check ? false : true;
  }

  static async sendMeetingEmailClient(
    user: User,
    locationName: string,
    assetName: string,
    meetingDate: string,
    meetingTime: string,
    paymentMethod: string,
    paidAmount: number,
    residualAmount: number,
    service: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Meeting Room booking')
        .htmlView('emails/coworker/meetingRoom/meeting_booking', {
          userFirstName: user.firstName,
          locationName: locationName,
          service: service,
          assetName: assetName,
          meetingDate: meetingDate,
          meetingTime: meetingTime,
          paymentMethod: paymentMethod,
          paidAmount: paidAmount,
          residualAmount: residualAmount
        });
    });
  } // end sendMeetingEmailClient

  static async sendMeetingEmailCoworking(
    user: User,
    client: User,
    requestOrigin: string,
    locationName: string,
    assetName: string,
    meetingDate: string,
    meetingTime: string,
    paymentMethod: string,
    paidAmount: number,
    residualAmount: number,
    service: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Meeting Room booking request')
        .htmlView('emails/coworking/meetingRoom/receiving_meeting_booking', {
          userFirstName: user.firstName,
          locationName: locationName,
          service: service,
          assetName: assetName,
          requestOrigin: requestOrigin,
          meetingDate: meetingDate,
          meetingTime: meetingTime,
          requestorName: client.firstName,
          paymentMethod: paymentMethod,
          paidAmount: paidAmount,
          residualAmount: residualAmount,
          token: `${ApplicationUrls.AUTH.MEETING_ROOM_REQUEST}`
        });
    });
  } // end sendMeetingEmailCoworking
}
