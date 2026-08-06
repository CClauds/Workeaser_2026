import Mail from '@ioc:Adonis/Addons/Mail';
import Application from '@ioc:Adonis/Core/Application';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database';
import ContractUsage from 'App/Models/ContractUsage';
import Invoice from 'App/Models/Invoice';
import Location from 'App/Models/Location';
import Meeting from 'App/Models/Meeting';
import MeetingBilling from 'App/Models/MeetingBilling';
import MeetingTax from 'App/Models/MeetingTax';
import Meetroom from 'App/Models/Meetroom';
import MeetroomAnswer from 'App/Models/MeetroomAnswer';
import User from 'App/Models/User';
import ClientService from 'App/Services/Cowork/ClientService';
import TaxesService from 'App/Services/Cowork/TaxesService';
import AppError from 'App/Utils/AppError';
import { safeRandomName } from 'App/Utils/SafeFilename';
import jsonXlsx from 'json-as-xlsx';
import { DateTime } from 'luxon';
import xlsx from 'node-xlsx';
// `randomUUID` removed in Lote 5b — filename now uses safeRandomName helper.

import InvoiceService, {
  InvoiceItemFeeInterface,
  InvoiceItemRequestInterface,
  InvoiceRequestInterface
} from 'App/Services/Cowork/InvoiceService';
import {
  DayPassPaymentMethodEnum,
  EventBookingTypes,
  InvoiceStatusEnum,
  MeetingDiscountTypesEnum,
  MeetingPaymentMethodEnum,
  MeetingSolicitedByEnum,
  MeetingStatusEnum,
  ServicesEnum,
  TaxMethodsEnum
} from 'Contracts/enums';
import slug from 'limax';
import ApplicationFeeService from '../ApplicationFeeService';
import CalendarService from './CalendarService';
import CoworkSettingsService from './SettingsService';

export interface BookMeeting {
  client_uuid: string;
  location_id: number;
  meetroom_id: number;
  discount_type: string;
  discount_value?: number;
  additional_information?: string;
  taxes: BookMeetingTax[];
  date_start: DateTime;
  date_end: DateTime;
  payment_method: string;
}

export interface BookMeetingTax {
  name: string;
  value: number;
  type: string;
  recurring_type: string;
  method: string;
}

export interface BookMeetingMail {
  coworking: string;
  meetroom: string;
  from: string;
  to: string;
}

interface MeetingContent {
  location_id: number;
  name: string;
  description: string;
  type: string;
  measure_unit: string;
  measure_size: number;
  measure_occupancy: number;
  price: number;
  searchable: boolean;
  rental_timeframe: string;
  minimum_rental: string;
  cancelation_full: number;
  cancelation_half: number;
  cancelation_no: number;
  discount_three: number;
  discount_half: number;
  discount_full: number;
}

interface MeetingData {
  id: number;
  user: UserBooking;
  location: Location;
  location_id: number;
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

interface UserBooking {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
}

interface MeetroomList {
  id: number;
  name: string;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  category: string;
  open_balance: number;
  visibility: boolean;
  photos: string[];
  meetroom_local_account_id: number;
}

export default class MeetroomService {
  static async list(user: User, page: number = 1, filters: any = {}) {
    await user.load('coworkUser');

    const query = Meetroom.query()
      .preload('location', (l) => {
        l.preload('address');
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

    const result: MeetroomList[] = [];
    const meetrooms = (await query.paginate(page, Env.get('ITEMS_PER_PAGE'))).toJSON();

    for (const meetroom of meetrooms.data) {
      const openBalance = await this.calcOpenBalance(meetroom.locationId, meetroom.id);

      result.push({
        id: meetroom.id,
        name: meetroom.name,
        location: meetroom.location.name,
        address: meetroom.location.address?.fulltext || '',
        city: meetroom.location.address.city,
        state: meetroom.location.address.state,
        country: meetroom.location.address.country,
        latitude: meetroom.location.address.latitude,
        longitude: meetroom.location.address.longitude,
        category: meetroom.type,
        open_balance: openBalance,
        visibility: meetroom.searchable,
        photos: meetroom.photos.map((p) => p.file),
        meetroom_local_account_id: meetroom.meetroom_local_account_id
      });
    }

    return {
      toJSON() {
        return {
          data: result,
          meta: meetrooms.meta
        };
      }
    };
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');

    const resource = await Meetroom.query()
      .where('id', id)
      .preload('photos')
      .preload('location')
      .preload('spaceRules', (rules) => {
        rules.preload('meetroomQuestion');
      })
      .first();

    if (!resource || user.coworkUser.coworkAccountId !== resource.location.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Meeting Room not found');
    }

    const automaticTaxes = await TaxesService.getAutomaticTaxes(
      resource.location.coworkAccountId,
      ServicesEnum.MEETING_ROOM
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
      const resource = new Meetroom().merge({
        cowork_account_id: user.coworkUser.coworkAccountId
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
          resource.uuid;
        resource.slug = slugUrl;
      }

      const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);
      const answers = data.space_rules;

      delete data.space_rules;

      resource.useTransaction(trx);
      resource.merge(data, false);

      await resource.save();
      await resource.related('photos').attach(photos);

      await MeetroomAnswer.query().useTransaction(trx).where('meetroom_id', resource.id).delete();
      await resource.related('spaceRules').createMany(answers);

      await trx.commit();

      return resource;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  static async update(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const trx = await Database.transaction();
    const resource = await Meetroom.find(id);
    await resource?.load('location');

    if (!resource || resource.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    try {
      const photos = data.photos.filter((p) => !!p.id).map((p) => p.id);
      const answers = data.space_rules;

      delete data.space_rules;

      resource.useTransaction(trx);
      resource.merge(data, false);

      await resource.save();
      await resource.related('photos').sync(photos);

      await MeetroomAnswer.query().useTransaction(trx).where('meetroom_id', resource.id).delete();
      await resource.related('spaceRules').createMany(answers);

      await trx.commit();

      return resource;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  static async destroy(id: number, user: User) {
    await user.load('coworkUser');

    const resource = await Meetroom.find(id);
    await resource?.load('location');

    if (!resource || resource.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    await resource.softDelete();
  }

  static async changeSearchAvailability(id: number, user: User, availability: boolean) {
    await user.load('coworkUser');

    const meetroom = await Meetroom.find(id);
    await meetroom?.load('location');

    if (!meetroom || meetroom.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid resource');
    }

    try {
      meetroom.searchable = availability;
      await meetroom.save();

      return meetroom;
    } catch (e) {
      throw e;
    }
  }

  static async bookMeeting(data: BookMeeting, user: User) {
    await user.load('coworkUser');

    const location = await Location.find(data.location_id);
    const meetroom = await Meetroom.find(data.meetroom_id);
    const client = await User.findBy('uuid', data.client_uuid);

    if (!location || !meetroom || !client) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid request');
    }

    await location.load('coworkAccount');

    if (
      location.coworkAccountId !== user.coworkUser.coworkAccountId ||
      meetroom.locationId !== location.id
    ) {
      throw new AppError(AppError.BAD_REQUEST, 'Meetroom invalid');
    }

    const meetingDateIsAvailable = await this.checkIfDatesIsAvailable(
      data.location_id,
      data.meetroom_id,
      data.date_start,
      data.date_end
    );

    if (!meetingDateIsAvailable) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'There is already an approved meeting at this time.'
      );
    }

    const totalMinutes = this.calcTotalMinutes(data.date_start, data.date_end);
    const pricePerHour = meetroom.calcPricePerHour(totalMinutes);
    const costHours = Math.round((totalMinutes / 60) * (pricePerHour / 100) * 100);
    const discountAmount = this.calcDiscountValue(
      data.discount_type,
      data.discount_value,
      costHours
    );

    const trx = await Database.transaction();

    try {
      const meeting = await Meeting.create(
        {
          coworkAccountId: location.coworkAccountId,
          locationId: location.id,
          meetroomId: meetroom.id,
          userId: client.id,
          discountType: data.discount_type,
          discountValue: data.discount_value,
          quantityMinutes: totalMinutes,
          pricePerHour: pricePerHour,
          costHours: costHours,
          amountDiscount: discountAmount,
          dateStart: data.date_start,
          dateEnd: data.date_end,
          additionalInformation: data.additional_information,
          status: MeetingStatusEnum.APPROVED,
          paymentMethod: data.payment_method,
          solicitedBy: MeetingSolicitedByEnum.COWORK
        },
        { client: trx }
      );

      await meeting.useTransaction(trx).related('taxes').createMany(data.taxes);
      await this.payment(meeting, user, trx);
      await trx.commit();

      await this.sendBookMeetingEmail(client, {
        coworking: location.coworkAccount.name,
        meetroom: meetroom.name,
        from: data.date_start.toFormat('MM/dd/yyyy HH:mm'),
        to: data.date_end.toFormat('MM/dd/yyyy HH:mm')
      });

      if (meeting.status === MeetingStatusEnum.APPROVED) {
        await this.sendCalendarInvite(meeting);
      }

      return meeting;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  static async bookMeetingApprove(id: number, user: User) {
    await user.load('coworkUser');

    let meetingTime: string;

    const meeting: Meeting = await Meeting.query().where('id', id).preload('location').first();

    if (!meeting) {
      throw new AppError(AppError.NOT_FOUND, 'Meeting not found');
    }

    if (meeting.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    if (meeting.status === MeetingStatusEnum.APPROVED) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This meeting has already been approved.');
    }

    if (
      meeting.status === MeetingStatusEnum.REJECTED ||
      meeting.status === MeetingStatusEnum.CANCELED
    ) {
      throw new AppError(AppError.VALIDATION_FAIL, 'This meeting cannot be approved');
    }

    const meetingDateIsAvailable = await this.checkIfDatesIsAvailable(
      meeting.locationId,
      meeting.meetroomId,
      meeting.dateStart,
      meeting.dateEnd
    );

    if (!meetingDateIsAvailable) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'There is already an approved meeting at this time.'
      );
    }

    const trx = await Database.transaction();

    try {
      if (meeting.solicitedBy === MeetingSolicitedByEnum.CLIENT) {
        await this.payment(meeting, user, trx);
      }

      meeting.status = MeetingStatusEnum.APPROVED;
      await meeting.useTransaction(trx).save();

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }

    meetingTime =
      meeting.dateStart.toLocaleString(DateTime.TIME_WITH_SECONDS) +
      ' - ' +
      meeting.dateEnd.toLocaleString(DateTime.TIME_WITH_SECONDS);

    let paidAmount: any;
    paidAmount = 0.0;
    let residualAmount: any;
    residualAmount = 0;

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    residualAmount = meeting.costHours.toString();

    residualAmount =
      residualAmount.substring(0, residualAmount.length - 2) +
      '.' +
      residualAmount.substring(residualAmount.length - 2);

    residualAmount = dollarUSLocale.format(parseFloat(residualAmount));

    paidAmount = dollarUSLocale.format(paidAmount);

    let paymentMethod: string;

    switch (meeting.paymentMethod) {
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

    try {
      const client = await User.findByOrFail('id', meeting.userId);
      const meetroom = await Meetroom.findOrFail(meeting.meetroomId);
      await meeting.load('coworkAccount');

      await this.sendCalendarInvite(meeting);
      await this.sendBookMeetingApprovedEmail(
        client,
        meeting.location.name,
        'Meeting Room',
        meeting.dateStart.toLocaleString(DateTime.DATE_FULL),
        meetingTime,
        paymentMethod,
        paidAmount,
        residualAmount,
        meetroom.name
      );

      Event.emit('meeting:approve', { id: meeting.id });
    } catch (e) {
      // Ignore
    }

    return meeting;
  }

  static async bookMeetingReject(id: number, user: User) {
    await user.load('coworkUser');

    let meetingTime: string;

    const meeting: Meeting = await Meeting.query().where('id', id).preload('location').first();

    if (!meeting) {
      throw new AppError(AppError.NOT_FOUND, 'Meeting not found');
    }

    if (meeting.location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const trx = await Database.transaction();

    try {
      meeting.status = MeetingStatusEnum.REJECTED;
      await meeting.useTransaction(trx).save();

      // Return of credits
      switch (meeting.paymentMethod) {
        case MeetingPaymentMethodEnum.BENEFIT:
          await ContractUsage.query()
            .where('service_type', ServicesEnum.MEETING_ROOM)
            .where('resource_id', meeting.id)
            .useTransaction(trx)
            .delete();
          break;
        case MeetingPaymentMethodEnum.BILLING:
          await MeetingBilling.query().where('meeting_id', meeting.id).useTransaction(trx).delete();
          break;
      }

      await trx.commit();
      Event.emit('day_pass:delete', { id: meeting.id });
    } catch (e) {
      await trx.rollback();
      throw e;
    }

    const client = await User.findByOrFail('id', meeting.userId);
    const meetroom = await Meetroom.findOrFail(meeting.meetroomId);
    await meeting.load('coworkAccount');

    meetingTime =
      meeting.dateStart.toLocaleString(DateTime.TIME_WITH_SECONDS) +
      ' - ' +
      meeting.dateEnd.toLocaleString(DateTime.TIME_WITH_SECONDS);

    let paidAmount: any;
    paidAmount = 0.0;
    let residualAmount: any;
    residualAmount = 0;

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    residualAmount = meeting.costHours.toString();

    residualAmount =
      residualAmount.substring(0, residualAmount.length - 2) +
      '.' +
      residualAmount.substring(residualAmount.length - 2);

    residualAmount = dollarUSLocale.format(parseFloat(residualAmount));

    paidAmount = dollarUSLocale.format(paidAmount);

    let paymentMethod: string;

    switch (meeting.paymentMethod) {
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

    await this.cancelCalendarInvite(meeting.coworkAccountId, meeting.id);

    await this.sendBookMeetingRejectedEmail(
      client,
      meeting.location.name,
      'Meeting Room',
      meeting.dateStart.toLocaleString(DateTime.DATE_FULL),
      meetingTime,
      paymentMethod,
      paidAmount,
      residualAmount,
      meetroom.name
    );

    Event.emit('meeting:reject', { id: meeting.id });

    return meeting;
  }

  static async showMeeting(id: number, user: User) {
    await user.load('coworkUser');

    const meeting: Meeting = await Meeting.query()
      .preload('taxes')
      .preload('billings')
      .preload('location')
      .preload('meetroom')
      .preload('user', (userQuery) => {
        userQuery.preload('clientAccount');
      })
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', id)
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
      user: {
        id: meeting.user.id,
        first_name: meeting.user.firstName,
        last_name: meeting.user.lastName,
        email: meeting.user.email,
        phone: meeting.user.personalPhone,
        company_name: meeting.user.clientAccount.companyName
      },
      location: meeting.location,
      location_id: meeting.locationId,
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

  private static async payment(meeting: Meeting, user: User, trx: TransactionClientContract) {
    const client = await User.findByOrFail('id', meeting.userId);

    switch (meeting.paymentMethod) {
      case MeetingPaymentMethodEnum.BENEFIT:
        // Get list of contracts with meeting room minutes available

        const benefitsAvailableMinutes = await ClientService.getServiceAvailableCreditsMonth(
          user,
          client.id,
          meeting.locationId,
          ServicesEnum.MEETING_ROOM
        );

        // Sum of contracts benefits and utilization calc
        let quantityMinutesCount = meeting.quantityMinutes;
        let contractsToUpdate: any[] = [];
        for (const a of benefitsAvailableMinutes) {
          if (a.quantity >= quantityMinutesCount) {
            quantityMinutesCount = 0;
            contractsToUpdate.push({
              contractId: a.contractId,
              quantityUsed: meeting.quantityMinutes
            });
            break;
          }

          if (a.quantity < quantityMinutesCount) {
            quantityMinutesCount -= a.quantity;
            contractsToUpdate.push({
              contractId: a.contractId,
              quantityUsed: a.quantity
            });
          }
        }

        // Add excess minutes to invoice
        if (quantityMinutesCount) {
          await meeting
            .useTransaction(trx)
            .related('billings')
            .create({ quantityMinutes: quantityMinutesCount });
        }

        // Save contract usage historic
        const usages: any[] = [];
        for (const contract of contractsToUpdate) {
          usages.push({
            contractId: contract.contractId,
            userId: client.id,
            serviceType: ServicesEnum.MEETING_ROOM,
            quantityCredits: contract.quantityUsed,
            bookingDate: DateTime.now().toFormat('yyyy-MM-dd'),
            resourceId: meeting.id
          });
        }
        await ContractUsage.createMany(usages, { client: trx });
        break;
      case MeetingPaymentMethodEnum.BILLING:
        await meeting
          .useTransaction(trx)
          .related('billings')
          .create({ quantityMinutes: meeting.quantityMinutes });
        break;
      case MeetingPaymentMethodEnum.CAPTURE:
        await meeting.load('meetroom');
        await meeting.load('taxes');
        await meeting.load('location');

        const coworkSettings = await CoworkSettingsService.getSettings(
          meeting.location.coworkAccountId
        );
        const today = DateTime.local();
        let dueDate: DateTime = DateTime.local();

        // Calculate dueDate
        if (today.day > coworkSettings.recurringInvoiceDueDate) {
          dueDate = dueDate.plus({ month: 1 }).set({ day: coworkSettings.recurringInvoiceDueDate });
        } else {
          dueDate = dueDate.set({ day: coworkSettings.recurringInvoiceDueDate });
        }

        const total = this.calcTotal(meeting);
        const fees = this.convertMeetingTaxToInvoiceItemFee(meeting.taxes);
        const applicationFee = await ApplicationFeeService.calculate(
          client.id,
          meeting.coworkAccountId,
          ServicesEnum.MEETING_ROOM,
          meeting.locationId,
          meeting.meetroomId,
          total
        );

        const meetroomData: InvoiceItemRequestInterface = {
          name: `Meeting Room - ${meeting.meetroom.name}`,
          unit_price: total,
          service_type: ServicesEnum.MEETING_ROOM,
          resource_id: meeting.meetroomId,
          date: DateTime.local(),
          description: '',
          quantity: 1,
          fees: fees
        };

        const invoiceData: InvoiceRequestInterface = {
          location_id: meeting.locationId,
          client_uuid: client.uuid,
          date: DateTime.local(),
          due_date: dueDate,
          items: [meetroomData],
          application_fee: applicationFee
        };

        const invoice = await InvoiceService.store(user, invoiceData);
        meeting.invoiceId = invoice.id;
        meeting.status = MeetingStatusEnum.WAITING_PAYMENT;
        await meeting.useTransaction(trx).save();

        break;
    }
  }

  static async confirmMeetingFromPayment(invoiceId: number) {
    // Check if invoice is from meeting and update status
    const meeting = await Meeting.query().where('invoice_id', invoiceId).first();

    if (meeting) {
      meeting.status = MeetingStatusEnum.APPROVED;
      await this.sendCalendarInvite(meeting);
      await meeting.save();
    }
  }

  private static convertMeetingTaxToInvoiceItemFee(taxes: MeetingTax[]): InvoiceItemFeeInterface[] {
    return taxes.map((t) => ({
      name: t.name,
      value: t.value,
      type: t.type,
      method: t.method,
      recurring_type: t.recurringType,
      taxes: []
    }));
  }

  private static calcTotalMinutes(start: DateTime, end: DateTime): number {
    return end.diff(start).as('minutes');
  }

  private static calcDiscountValue(
    method: string,
    value: number | undefined,
    total: number
  ): number {
    if (!value) {
      return 0;
    }

    switch (method) {
      case MeetingDiscountTypesEnum.FIXED:
        return value;
      case MeetingDiscountTypesEnum.PERCENTAGE:
        return total * (value / 10000);
      default:
        return 0;
    }
  }

  private static calcTotal(meeting: Meeting): number {
    let total = meeting.costHours;

    if (meeting.amountDiscount) {
      total -= meeting.amountDiscount;
    }

    return total;
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
      .where('status', MeetingStatusEnum.APPROVED)
      .where((query) => {
        query.where('date_start', '<=', dateEnd.toSQL());
        query.andWhere('date_end', '>=', dateStart.toSQL());
      })
      .whereNull('deleted_at')
      .first();

    return check ? false : true;
  }

  private static async sendBookMeetingEmail(user: User, data: BookMeetingMail) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(user.email, user.firstName)
        .subject('Meeting Room Request')
        .htmlView('emails/book_meeting_solicited', data);
    });
  }

  private static async sendBookMeetingApprovedEmail(
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
        .subject('Meeting Room request approved')
        .htmlView('emails/coworker/meetingRoom/approved_meeting_booking', {
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
  }

  private static async sendBookMeetingRejectedEmail(
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
        .subject('Meeting Room request declined')
        .htmlView('emails/coworker/meetingRoom/declined_meeting_booking', {
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
  }

  private static async calcOpenBalance(locationId: number, meetroomId: number) {
    const invoices = await Invoice.query()
      .where('location_id', locationId)
      .whereHas('items', (i) => {
        i.where('service_type', ServicesEnum.MEETING_ROOM);
        i.where('resource_id', meetroomId);
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

  private static async sendCalendarInvite(meeting: Meeting) {
    await meeting.load('location');
    await meeting.load('user');

    if (meeting.location) {
      await meeting.location.load('address');
    }

    if (meeting.status === MeetingStatusEnum.APPROVED) {
      await CalendarService.createOrUpdate(meeting.coworkAccountId, {
        booking_type: EventBookingTypes.MEETING,
        resource_id: meeting.id,
        summary: `Meeting Room - ${meeting.location.name}`,
        description: this.generateCalendarMessage(
          meeting.location.name,
          meeting.dateStart,
          meeting.dateEnd
        ),
        location_name: meeting.location.name,
        location_address: meeting.location.address?.fulltext || '',
        end_datetime: meeting.dateEnd,
        start_datetime: meeting.dateStart,
        is_full_day: false,
        client_name: meeting.user.fullName,
        client_email: meeting.user.email
      });
    }
  }

  private static async cancelCalendarInvite(coworkAccountId: number, resourceId: number) {
    await CalendarService.destroy(coworkAccountId, EventBookingTypes.MEETING, resourceId);
  }

  private static generateCalendarMessage(
    locationName: string,
    dateStart: DateTime,
    dateEnd: DateTime
  ) {
    let dateStartFormatted = dateStart.toFormat('MM/dd/yyyy hh:mm:ss');
    let dateEndFormatted = dateEnd.toFormat('MM/dd/yyyy hh:mm:ss');

    return `You have a confirmed meeting in ${locationName} from ${dateStartFormatted} to ${dateEndFormatted}.`;
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
      let meetRoomJson = doc[0].data.filter((item: any) => item.length > 0);

      meetRoomJson.map(async (item: any) => {
        const data = {
          location_id: item[0],
          name: item[1],
          description: item[2],
          type: item[3],
          measure_unit: item[4],
          measure_size: item[5],
          measure_occupancy: item[6],
          rental_timeframe: item[9],
          minimum_rental: item[10],
          price: item[7],
          cancelation_full: item[11],
          cancelation_half: item[12],
          cancelation_no: item[13],
          discount_three: item[14],
          discount_half: item[15],
          discount_full: item[16],
          searchable: item[8],
          photos: [],
          space_rules: []
        };

        if( Number.isNaN(Number(item[0])) ) {
          return {
            message: 'Location id must be a number.'
          };
        }

        await this.store(data, user);
      });
      return 'Meet rooms importing successfully.';
    } catch (e) {
      return e;
    }
  }

  static async export(user: User) {
    //meetRoomId: []

    let success = 'success';

    try {
      const meetRoomList = await Meetroom.query().where(
        'cowork_account_id',
        user.coworkUser.coworkAccountId
      );

      if (meetRoomList.length > 0) {
        let data: any[] = [
          {
            sheet: 'Meetroom',
            columns: [
              { label: 'location_id', value: (row) => row.location_id },
              { label: 'name', value: (row) => row.name },
              { label: 'description', value: (row) => row.description },
              { label: 'type', value: (row) => row.type },
              { label: 'measure_unit', value: (row) => row.measure_unit },
              { label: 'measure_size', value: (row) => row.measure_size },
              { label: 'measure_occupancy', value: (row) => row.measure_occupancy },
              { label: 'price', value: (row) => row.price },
              { label: 'searchable', value: (row) => row.searchable },
              { label: 'rental_timeframe', value: (row) => row.rental_timeframe },
              { label: 'minimum_rental', value: (row) => row.minimum_rental },
              { label: 'cancelation_full', value: (row) => row.cancelation_full },
              { label: 'cancelation_half', value: (row) => row.cancelation_half },
              { label: 'cancelation_no', value: (row) => row.cancelation_no },
              { label: 'discount_three', value: (row) => row.discount_three },
              { label: 'discount_half', value: (row) => row.discount_half },
              { label: 'discount_full', value: (row) => row.discount_full }
            ],
            content: []
          }
        ];

        meetRoomList.map(async (item) => {
          const ContentMeeting: MeetingContent = {
            location_id: item.id,
            name: item.name,
            description: item.description,
            type: item.type,
            measure_unit: item.measureUnit,
            measure_size: item.measureSize,
            measure_occupancy: item.measureOccupancy,
            price: item.price,
            searchable: item.searchable,
            rental_timeframe: item.rentalTimeframe,
            minimum_rental: item.minimumRental,
            cancelation_full: item.cancelationFull,
            cancelation_half: item.cancelationHalf,
            cancelation_no: item.cancelationNo,
            discount_three: item.discountThree,
            discount_half: item.discountHalf,
            discount_full: item.discountFull
          };
          data[0].content.push(ContentMeeting);

          let settings = {
            fileName: 'Meetroom',
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

  // added to meetroom_local_account_id ids
  static async toIterateOverAccountId(user: User) {
    const meetRoomLocalId = await Meetroom.query()
      .select('meetroom_local_account_id')
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .orderBy('meetroom_local_account_id', 'desc')
      .first();

    return meetRoomLocalId;
  } // end iterateOnAccountId
}
