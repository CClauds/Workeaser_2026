import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database';
import PaymentService from '@ioc:Workeaser/Integrations/Payments';
import Contract from 'App/Models/Contract';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkClient from 'App/Models/CoworkClient';
import Desk from 'App/Models/Desk';
import InitialFees from 'App/Models/InitialFees';
import Invoice, { DetailedInvoice } from 'App/Models/Invoice';
import InvoiceActivity from 'App/Models/InvoiceActivity';
import InvoiceItem from 'App/Models/InvoiceItem';
import InvoicePaymentHistory from 'App/Models/InvoicePaymentHistory';
import Location from 'App/Models/Location';
import Meeting from 'App/Models/Meeting';
import Payment from 'App/Models/Payment';
import PaymentHistory from 'App/Models/PaymentHistory';
import PaymentHistoryInitialFees from 'App/Models/PaymentHistoryInitialFees';
import Room from 'App/Models/Room';
import User from 'App/Models/User';
import VirtualOffice from 'App/Models/VirtualOffice';
import DayPassService from 'App/Services/Cowork/DayPassService';
import MeetroomService from 'App/Services/Cowork/MeetroomService';
import StripeConnectService from 'App/Services/Cowork/StripeConnectService';
import NotificationsService from 'App/Services/NotificationsService';
import WalletService from 'App/Services/WalletService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import { ParseUUIDToSmall } from 'App/Utils/Generics';
import {
  IntegrationServiceEnum,
  InvoiceStatusEnum,
  NotificationTypeEnum,
  PaymentStatusEnum,
  PaymentTypesEnum,
  RecurringTypeTaxEnum,
  ServicesEnum,
  TaxMethodsEnum,
  WalletTypesEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';

interface FilterSearch {
  general_query?: any;
  creation_date_start?: string;
  creation_date_end?: string;
  due_date_start?: string;
  due_date_end?: string;

  invoice_status?: string;
  partial_paid_or_fully?: boolean;
  viwed_by_customer?: boolean;
  payment_deposited?: boolean;

  contr_virtual_office?: boolean;
  contr_shared_desk?: boolean;
  contr_shared_office?: boolean;
  contr_meeting_room?: boolean;
  contr_exclusive_desk?: boolean;
  contr_private_office?: boolean;

  bl_status_open?: boolean;
  bl_status_fully_paid?: boolean;
  bl_status_partially_paid?: boolean;
  bl_status_overdue?: boolean;
}

export interface ItemInterface {
  invoice_item_id?: number;
  invoice_ini_fee_id?: number;
  amount: number;
}
export interface CapturePaymentInterface {
  payment_method: PaymentTypesEnum;
  bank_account_id?: number;
  card_id?: number;
  card?: {
    nickname: string;
    token: string;
  };
  items: ItemInterface[];
}

export interface ReceivePaymentInterface {
  items: ItemInterface[];
}

export interface RefundPaymentInterface {
  payment_id: number;
  amount?: number;
}

export interface InvoiceRequestInterface {
  client_uuid: string;
  location_id?: number;
  items: InvoiceItemRequestInterface[];
  subtotal?: number;
  total?: number;
  date: DateTime;
  due_date: DateTime;
  additional_notes?: string;
  application_fee?: number;
  contracts?: number[];
  meetings?: number[];
  first_invoice_amount?: number;
}

export interface InvoiceItemRequestInterface {
  name: string;
  unit_price: number;
  service_type?: ServicesEnum | string;
  date: DateTime;
  description?: string;
  quantity: number;
  fees: InvoiceItemFeeInterface[];
  resource_id?: number;
  unit_taxes?: number;
  unit_taxes_overdue?: number;
  total_taxes?: number;
  total_taxes_overdue?: number;
  total_amount?: number;
  total_without_taxes?: number;
}

export interface InvoiceItemFeeInterface {
  name: string;
  value: number;
  type: string;
  method: string;
  recurring_type: string;
  description?: string;
  taxes: InvoiceItemTaxInterface[];
}

export interface InvoiceItemTaxInterface {
  name: string;
  value: number;
  type: string;
  method: string;
}

export default class InvoiceService {
  static async list(user: User, filters: FilterSearch, page = 1) {
    await user.load('coworkUser');

    // main query
    const query = Invoice.query()
      .preload('items')
      .preload('coworkAccount')
      .preload('user', (userQuery) => {
        userQuery.preload('clientAccount');
      })
      .preload('activities')
      .preload('contracts')
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .whereNull('deleted_at');

    const queryUsersClients = await Invoice.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .whereNull('deleted_at');

    const userInvoiceIds = queryUsersClients.map((userInv) => userInv.userId);

    // to search users related with coworking with invoices
    const queryUsersInv = User.query().whereIn('id', userInvoiceIds);

    if (filters.general_query) {
      const usersInvIds = await queryUsersInv.where((userQuery) => {
        userQuery.where('first_name', 'like', `%${filters.general_query}%`);
        userQuery.orWhere('last_name', 'like', `%${filters.general_query}%`);
        userQuery.orWhere('email', 'like', `%${filters.general_query}%`);
        userQuery.orWhere('personal_phone', 'like', `%${filters.general_query}%`);
        userQuery.orWhereHas('clientAccount', (clientQuery) => {
          clientQuery.where('company_name', 'like', `%${filters.general_query}%`);
        });
      });

      const usersClientsInvIds = usersInvIds.map((client) => client.id);

      query.whereIn('user_id', usersClientsInvIds);
    }

    // Filter creation date
    if (filters.creation_date_start && filters.creation_date_end) {
      query.whereBetween('date', [filters.creation_date_start, filters.creation_date_end]);
    } else if (filters.creation_date_start) {
      query.where('date', filters.creation_date_start);
    } else if (filters.creation_date_end) {
      query.where('date', filters.creation_date_end);
    }

    // Filter due date
    if (filters.due_date_start && filters.due_date_end) {
      query.whereBetween('due_date', [filters.due_date_start, filters.due_date_end]);
    } else if (filters.due_date_start) {
      query.where('due_date', filters.due_date_start);
    } else if (filters.due_date_end) {
      query.where('due_date', filters.due_date_end);
    }

    // filter status
    if (filters.invoice_status) {
      query.where('status', filters.invoice_status);
    }

    // partially paid or fully
    if (filters.partial_paid_or_fully) {
      query.where('status', 'FULLY_PAID').orWhere('status', 'PARTLY_PAID');
    }

    if (filters.viwed_by_customer) {
      query.where('status', 'VIEWED');
    }

    if (filters.payment_deposited) {
      query.where('status', 'DEPOSITED');
    }

    if (filters.contr_virtual_office) {
      query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'VIRTUAL_OFFICE');
      });
    }

    if (filters.contr_shared_desk) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'OPEN_DESK');
      });

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'OPEN_DESK');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const desks = await Desk.query().whereIn('id', resourceIds).andWhere('shareable', 1);

      const deskIds = desks.map((desk) => desk.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', deskIds);
      });
    }

    if (filters.contr_shared_office) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'PRIVATE_ROOM');
      });

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'PRIVATE_ROOM');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const rooms = await Room.query().whereIn('id', resourceIds).andWhere('shareable', 1);

      const roomIds = rooms.map((rom) => rom.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', roomIds);
      });
    }

    if (filters.contr_meeting_room) {
      query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'MEETING_ROOM');
      }); // to review
    }

    if (filters.contr_exclusive_desk) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'OPEN_DESK');
      }); // to review

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'OPEN_DESK');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const desks = await Desk.query().whereIn('id', resourceIds).andWhere('shareable', 0);

      const deskIds = desks.map((desk) => desk.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', deskIds);
      });
    }

    if (filters.contr_private_office) {
      const usersWithContract = await query.whereHas('contracts', (contractQuery) => {
        contractQuery.where('service_type', '=', 'PRIVATE_ROOM');
      });

      const usersIds = usersWithContract.map((users) => users.id);

      const resources = await Contract.query()
        .whereIn('user_id', usersIds)
        .andWhere('service_type', '=', 'PRIVATE_ROOM');

      const resourceIds = resources.map((resource) => resource.resourceId);

      const rooms = await Room.query().whereIn('id', resourceIds).andWhere('shareable', 0);

      const roomIds = rooms.map((rom) => rom.id);

      query.whereHas('contracts', (contractQuery) => {
        contractQuery.whereIn('resource_id', roomIds);
      });
    }

    if (filters.bl_status_open) {
      query.where('status', 'SENT').orWhere('status', 'VIEWED');
    }

    if (filters.bl_status_fully_paid) {
      query.where('status', 'FULLY_PAID');
    }

    if (filters.bl_status_partially_paid) {
      query.where('status', 'PARTLY_PAID');
    }

    if (filters.bl_status_overdue) {
      query.where('status', 'OVERDUE');
    } // to review

    const invoices = await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
    const invoicesJson = invoices.toJSON();
    const result: any[] = [];

    for (const invoice of invoices.rows) {
      //const status = invoice.getStatus();
      const invoiceJson = invoice.toJSON();
      //invoiceJson.status = status;
      const details = await invoice.getDetailed();
      invoiceJson.open_amount = details.open_amount;

      result.push(invoiceJson);
    }

    return {
      toJSON() {
        return {
          data: result,
          meta: invoicesJson.meta
        };
      }
    };
  }

  static async show(uuid: string, user: User) {
    await user.load('coworkUser');

    const invoice = await Invoice.query()
      .where('uuid', uuid)
      .preload('location')
      .preload('user', (userQuery) => {
        userQuery.preload('clientAccount');
        userQuery.preload('personalAddress');
      })
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('fees', (feesQuery) => {
          feesQuery.preload('taxes');
        });
      })
      .preload('iniFees')
      .first();

    if (!invoice || user.coworkUser.coworkAccountId !== invoice.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invoice not found');
    }

    invoice.status = invoice.getStatus();
    const isOverdue = await invoice.isOverdue();

    if (isOverdue) {
      invoice.total += invoice.totalTaxesOverdue;
    }

    const details = await invoice.getDetailed();
    const openAmount = details.open_amount;

    return { invoice, open_amount: openAmount };
  }

  static async resend(uuid: string, user: User) {
    await user.load('coworkUser');

    const invoice = await Invoice.findBy('uuid', uuid);

    if (!invoice || user.coworkUser.coworkAccountId !== invoice.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invoice not found');
    }
    const client = await User.findOrFail(invoice.userId);

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    let totalOpenAmount: any = 0;

    totalOpenAmount = invoice.total.toString();

    totalOpenAmount =
      totalOpenAmount.substring(0, totalOpenAmount.length - 2) +
      '.' +
      totalOpenAmount.substring(totalOpenAmount.length - 2);

    totalOpenAmount = dollarUSLocale.format(parseFloat(totalOpenAmount));

    await this.sendPaymentReminderEmailClient(
      client,
      invoice.dueDate.toLocaleString(DateTime.DATE_FULL),
      totalOpenAmount,
      invoice.uuid
    );
  }

  static async store(user: User, data: InvoiceRequestInterface, isCalculateFees: boolean = false) {
    await user.load('coworkUser');

    const coworkAccount = await CoworkAccount.find(user.coworkUser.coworkAccountId);
    const userClientAccount = await User.findByOrFail('uuid', data.client_uuid);
    let location;
    let taxes = 0;

    if (data.location_id) {
      location = await Location.find(data.location_id);

      if (!location || user.coworkUser.coworkAccountId !== location.coworkAccountId) {
        throw new AppError(AppError.NOT_FOUND, 'Location not found');
      }
    }

    if (!userClientAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Client not found');
    }

    if (!coworkAccount) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    let taxAmount = 0;

    // Calculate item taxes and item total
    data.items.forEach((item) => {
      let unitTaxAmount = 0;
      let unitTaxOverdueAmount = 0;

      // Calc unit fees and taxes
      if (item.fees && item.unit_price) {
        item.fees.forEach((fee) => {
          let feeCreatedAmount = 0;
          let feeOverdueAmount = 0;

          switch (fee.recurring_type) {
            case RecurringTypeTaxEnum.CREATED:
              feeCreatedAmount = this.calculateTaxValue(fee.method, fee.value, item.unit_price);
              break;
            case RecurringTypeTaxEnum.OVERDUE:
              feeOverdueAmount = this.calculateTaxValue(fee.method, fee.value, item.unit_price);
              break;
          }

          taxAmount += this.calculateTaxValue(fee.method, fee.value, item.unit_price);

          if (fee.recurring_type === RecurringTypeTaxEnum.CREATED) {
            feeCreatedAmount += taxAmount;
          } else if (fee.recurring_type === RecurringTypeTaxEnum.OVERDUE) {
            feeOverdueAmount += taxAmount;
          }

          unitTaxAmount += feeCreatedAmount;
          unitTaxOverdueAmount += feeOverdueAmount;
        });
      }

      item.unit_taxes = unitTaxAmount;
      item.unit_taxes_overdue = unitTaxOverdueAmount;
      item.total_taxes = item.quantity * item.unit_taxes;
      item.total_taxes_overdue = item.quantity * item.unit_taxes_overdue;
      item.total_amount = item.quantity * (item.unit_price + item.unit_taxes);
      item.total_without_taxes = item.quantity * item.unit_price;
    });

    //taxes = data.items.reduce((a, c) => a + (c.total_taxes || 0), 0);

    const taxesOverdue = data.items.reduce((a, c) => a + (c.total_taxes_overdue || 0), 0);
    await data.items.map((fee) => fee.fees.map((item) => (taxes += item.value)));

    const trx = await Database.transaction();

    try {
      const newInvoice = await new Invoice()
        .merge({
          date: data.date,
          dueDate: data.due_date,
          additionalNotes: data.additional_notes,
          totalTaxesOverdue: taxesOverdue,
          status: InvoiceStatusEnum.SENT,
          locationId: data.location_id,
          coworkAccountId: user.coworkUser.coworkAccountId,
          userId: userClientAccount.id,
          applicationFeePaid: false,
          applicationFee: data.application_fee
        })
        .useTransaction(trx)
        .save();

      if (data.contracts) {
        await newInvoice.related('contracts').attach(data.contracts);
      }

      if (data.meetings) {
        await Meeting.query().whereIn('id', data.meetings).update({ invoice_id: newInvoice.id });
      }

      let initialFee: number = 0;
      let totalInitialFee: number = 0;
      let fees: number[];

      for (const item of data.items) {
        if (isCalculateFees) {
          switch (item.service_type) {
            case ServicesEnum.VIRTUAL_OFFICE:
              const virtualOffice = await VirtualOffice.query()
                .preload('fees')
                .where('id', item.resource_id)
                .first();
              await virtualOffice.fees.map(async (fee) => {
                let data = {
                  name: fee.name,
                  value: fee.amount
                };
                await newInvoice.related('iniFees').create(data);
              });
              fees = virtualOffice.fees.map((fee) => fee.amount);
              initialFee = fees.reduce((partialSum, a) => partialSum + a, 0);
              break;
            case ServicesEnum.OPEN_DESK:
              const openDesk = await Desk.query()
                .preload('fees')
                .where('id', item.resource_id)
                .first();
              await openDesk.fees.map(async (fee) => {
                let data = {
                  name: fee.name,
                  value: fee.amount
                };
                await newInvoice.related('iniFees').create(data);
              });
              fees = openDesk.fees.map((fee) => fee.amount);
              initialFee = fees.reduce((partialSum, a) => partialSum + a, 0);
              break;
            case ServicesEnum.PRIVATE_ROOM:
              const room = await Room.query().preload('fees').where('id', item.resource_id).first();
              await room.fees.map(async (fee) => {
                let data = {
                  name: fee.name,
                  value: fee.amount
                };
                await newInvoice.related('iniFees').create(data);
              });
              fees = room.fees.map((fee) => fee.amount);
              initialFee = fees.reduce((partialSum, a) => partialSum + a, 0);
              break;
            default:
              initialFee = 0;
          }
        }

        const newItem = await new InvoiceItem()
          .merge({
            invoiceId: newInvoice.id,
            serviceType: item.service_type,
            name: item.name,
            date: item.date,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalTaxes: item.total_taxes,
            unitTaxes: item.unit_taxes,
            unitTaxesOverdue: item.unit_taxes_overdue,
            totalTaxesOverdue: item.total_taxes_overdue,
            totalAmount: item.total_amount,
            resourceId: item.resource_id
          })
          .useTransaction(trx)
          .save();

        totalInitialFee += initialFee;

        for (const fee of item.fees) {
          const newFee = await newItem.related('fees').create(fee);
          await newFee.related('taxes').createMany(fee.taxes);
        }
      }

      let subtotal = data.subtotal
        ? data.subtotal
        : data.items.reduce((acc, curr) => acc + (curr.total_without_taxes || 0), 0);
      subtotal += totalInitialFee;

      taxes = taxAmount;
      let total = subtotal + taxes;

      await newInvoice.merge({ subtotal: subtotal, totalTaxes: taxes, total: total }).save();

      await newInvoice.related('activities').create({ type: InvoiceStatusEnum.SENT });
      await trx.commit();

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      let openAmount: any = 0.0;

      openAmount = total.toString();

      openAmount =
        openAmount.substring(0, openAmount.length - 2) +
        '.' +
        openAmount.substring(openAmount.length - 2);

      openAmount = dollarUSLocale.format(parseFloat(openAmount));

      Event.emit('invoice:new', { id: newInvoice.id });
      await this.sendInvoiceEmailClient(
        userClientAccount,
        user,
        location.name,
        openAmount,
        newInvoice.uuid
      );

      return newInvoice;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(uuid: string, user: User, data: InvoiceRequestInterface) {
    await user.load('coworkUser');
    const userByData = await User.findByOrFail('uuid', data.client_uuid);
    const invoice = await Invoice.query().where('uuid', uuid).first();

    if (!invoice || invoice.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.BAD_REQUEST, 'Invoice not found');
    }

    if (![InvoiceStatusEnum.SENT, InvoiceStatusEnum.VIEWED].includes(invoice.status)) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'It is not possible to edit an invoice that has already been paid or reversed.'
      );
    }

    if (data.location_id) {
      const location = await Location.find(data.location_id);

      if (!location) {
        throw new AppError(AppError.BAD_REQUEST, 'Location not found');
      }

      if (user.coworkUser.coworkAccountId !== location.coworkAccountId) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }
    }

    // Calculate item taxes and item total
    data.items.forEach((item) => {
      let unitTaxAmount = 0;
      let unitTaxOverdueAmount = 0;

      // Calc unit fees and taxes
      if (item.fees && item.unit_price) {
        item.fees.forEach((fee) => {
          let feeAmount = 0;
          let feeCreatedAmount = 0;
          let feeOverdueAmount = 0;

          switch (fee.recurring_type) {
            case RecurringTypeTaxEnum.CREATED:
              feeCreatedAmount = this.calculateTaxValue(fee.method, fee.value, item.unit_price);
              feeAmount = feeCreatedAmount;
              break;
            case RecurringTypeTaxEnum.OVERDUE:
              feeOverdueAmount = this.calculateTaxValue(fee.method, fee.value, item.unit_price);
              feeAmount = feeCreatedAmount;
              break;
          }

          let taxAmount = 0;
          fee.taxes.forEach((tax) => {
            taxAmount += this.calculateTaxValue(tax.method, tax.value, feeAmount);
          });

          if (fee.recurring_type === RecurringTypeTaxEnum.CREATED) {
            feeCreatedAmount += taxAmount;
          } else if (fee.recurring_type === RecurringTypeTaxEnum.OVERDUE) {
            feeOverdueAmount += taxAmount;
          }

          unitTaxAmount += feeCreatedAmount;
          unitTaxOverdueAmount += feeOverdueAmount;
        });
      }

      item.unit_taxes = unitTaxAmount;
      item.unit_taxes_overdue = unitTaxOverdueAmount;
      item.total_taxes = item.quantity * item.unit_taxes;
      item.total_taxes_overdue = item.quantity * item.unit_taxes_overdue;
      item.total_amount = item.quantity * (item.unit_price + item.unit_taxes);
      item.total_without_taxes = item.quantity * item.unit_price;
    });

    //const subtotal = data.items.reduce((acc, curr) => acc + (curr.total_without_taxes || 0), 0);

    const taxes = data.items.reduce((a, c) => a + (c.total_taxes || 0), 0);
    const taxesOverdue = data.items.reduce((a, c) => a + (c.total_taxes_overdue || 0), 0);
    //const total = data.total ? data.total : subtotal + taxes;

    const trx = await Database.transaction();

    let initialFee: number = 0;
    let totalInitialFee: number = 0;
    let fees: number[];

    try {
      //Remove olds invoice items
      await InvoiceItem.query().useTransaction(trx).where('invoice_id', invoice.id).softDelete();
      await InitialFees.query().useTransaction(trx).where('invoice_id', invoice.id).softDelete();

      for (const item of data.items) {
        switch (item.service_type) {
          case ServicesEnum.VIRTUAL_OFFICE:
            const virtualOffice = await VirtualOffice.query()
              .preload('fees')
              .where('id', item.resource_id)
              .first();
            virtualOffice.fees.map(async (fee) => {
              let data = {
                name: fee.name,
                value: fee.amount
              };
              await invoice.related('iniFees').create(data);
            });
            fees = virtualOffice.fees.map((fee) => fee.amount);
            initialFee = fees.reduce((partialSum, a) => partialSum + a, 0);
            break;
          case ServicesEnum.OPEN_DESK:
            const openDesk = await Desk.query()
              .preload('fees')
              .where('id', item.resource_id)
              .first();
            openDesk.fees.map(async (fee) => {
              let data = {
                name: fee.name,
                value: fee.amount
              };
              await invoice.related('iniFees').create(data);
            });
            fees = openDesk.fees.map((fee) => fee.amount);
            initialFee = fees.reduce((partialSum, a) => partialSum + a, 0);
            break;
          case ServicesEnum.PRIVATE_ROOM:
            const room = await Room.query().preload('fees').where('id', item.resource_id).first();
            room.fees.map(async (fee) => {
              let data = {
                name: fee.name,
                value: fee.amount
              };
              await invoice.related('iniFees').create(data);
            });
            fees = room.fees.map((fee) => fee.amount);
            initialFee = fees.reduce((partialSum, a) => partialSum + a, 0);
            break;
          default:
            initialFee = 0;
        }

        const newItem = await new InvoiceItem()
          .merge({
            invoiceId: invoice.id,
            serviceType: item.service_type,
            name: item.name,
            date: item.date,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalTaxes: item.total_taxes,
            unitTaxes: item.unit_taxes,
            unitTaxesOverdue: item.unit_taxes_overdue,
            totalTaxesOverdue: item.total_taxes_overdue,
            totalAmount: item.total_amount,
            resourceId: item.resource_id
          })
          .useTransaction(trx)
          .save();

        totalInitialFee += initialFee;

        for (const fee of item.fees) {
          const newFee = await newItem.related('fees').create(fee);
          await newFee.related('taxes').createMany(fee.taxes);
        }
      }

      let subtotal = data.subtotal
        ? data.subtotal
        : data.items.reduce((acc, curr) => acc + (curr.total_without_taxes || 0), 0);
      subtotal += totalInitialFee;

      let total = subtotal + taxes;

      await invoice
        .merge({
          date: data.date,
          dueDate: data.due_date,
          additionalNotes: data.additional_notes,
          subtotal: subtotal,
          total: total,
          totalTaxes: taxes,
          totalTaxesOverdue: taxesOverdue,
          status: InvoiceStatusEnum.SENT,
          locationId: data.location_id,
          coworkAccountId: user.coworkUser.coworkAccountId,
          userId: userByData.id
        })
        .useTransaction(trx)
        .save();

      await trx.commit();
      Event.emit('invoice:update', { id: invoice.id });

      return invoice;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(uuid: string, user: User) {
    await user.load('coworkUser');

    const invoice = await Invoice.findBy('uuid', uuid);

    if (!invoice || invoice.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invoice not found');
    }

    await invoice.softDelete();
    Event.emit('invoice:delete', { id: invoice.id });
  }

  static async getInvoiceInfo(uuid: string, user: User) {
    await user.load('coworkUser');

    try {
      return await this.getInvoiceDetailedInfos(uuid, user.coworkUser.coworkAccountId);
    } catch (err) {
      throw err;
    }
  }

  static async receivePayment(invoiceUUID: string, user: User, data: ReceivePaymentInterface) {
    await user.load('coworkUser');

    const invoice = await this.getInvoiceDetailedInfos(
      invoiceUUID,
      user.coworkUser.coworkAccountId
    );

    let totalPayment = data.items.reduce((agg, curr) => agg + curr.amount, 0);

    let openAmount = invoice.total - invoice.total_invoice_paid;
    let openAmountAfterP = invoice.total - totalPayment;

    if (invoice.is_invoice_overdue) {
      openAmount += invoice.total_taxes_overdue;
    }

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    let totalPaidAmount: any = 0.0;
    let totalOpenAmount: any = 0;

    totalPaidAmount = totalPayment.toString();

    totalPaidAmount =
      totalPaidAmount.substring(0, totalPaidAmount.length - 2) +
      '.' +
      totalPaidAmount.substring(totalPaidAmount.length - 2);

    totalPaidAmount = dollarUSLocale.format(parseFloat(totalPaidAmount));

    totalOpenAmount = openAmountAfterP.toString();

    totalOpenAmount =
      totalOpenAmount.substring(0, totalOpenAmount.length - 2) +
      '.' +
      totalOpenAmount.substring(totalOpenAmount.length - 2);

    totalOpenAmount = dollarUSLocale.format(parseFloat(totalOpenAmount));

    const client = await User.query().where('id', invoice.user_id).first();
    const location = await Location.query().where('id', invoice.location_id).first();

    if (!client) {
      throw new AppError(AppError.BAD_REQUEST, 'Client not found');
    }

    if (!location) {
      throw new AppError(AppError.BAD_REQUEST, 'Location not found');
    }

    if (totalPayment > openAmount) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'The total received is greater than the open amount'
      );
    }

    let activityType = InvoiceStatusEnum.FULLY_PAID;
    if (totalPayment + invoice.total_invoice_paid < invoice.total) {
      activityType = InvoiceStatusEnum.PARTLY_PAID;
    }

    const trx = await Database.transaction();

    try {
      const payment = await new Payment()
        .merge({
          invoiceId: invoice.id,
          paymentType: PaymentTypesEnum.RECEIVED,
          amount: totalPayment,
          userId: user.id,
          status: PaymentStatusEnum.SUCCEEDED,
          available: totalPayment
        })
        .useTransaction(trx)
        .save();

      const invoicePaymentHistory: Partial<InvoicePaymentHistory>[] = data.items.reduce(
        (agg, curr) => [
          ...agg,
          ...(curr.invoice_item_id
            ? [
                {
                  paymentId: payment.id,
                  invoiceId: invoice.id,
                  invoiceItemId: curr.invoice_item_id,
                  amount: curr.amount
                }
              ]
            : [])
        ],
        []
      );

      await InvoicePaymentHistory.createMany(invoicePaymentHistory, { client: trx });

      // items for initial fees are coming inside items, need to be change
      const initialFeesData: Partial<PaymentHistoryInitialFees>[] = data.items.reduce(
        (agg, curr) => [
          ...agg,
          ...(curr.invoice_ini_fee_id
            ? [
                {
                  invoiceIniFeeId: curr.invoice_ini_fee_id,
                  amount: curr.amount
                }
              ]
            : [])
        ],
        []
      );
      await payment.related('historyInitialFees').createMany(initialFeesData);

      await this.updateInvoiceStatus(invoice.id, activityType, false, trx);
      await trx.commit();

      await this.sendPaymentEmailClient(
        client,
        location.name,
        totalPaidAmount,
        totalOpenAmount,
        invoice.uuid
      );

      await this.sendPaymentEmailCoworking(
        user,
        client,
        location.name,
        totalPaidAmount,
        totalOpenAmount,
        invoice.uuid
      );

      return payment;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async capturePayment(invoiceUUID: string, user: User, data: CapturePaymentInterface) {
    await user.load('coworkUser');

    const invoice = await this.getInvoiceDetailedInfos(
      invoiceUUID,
      user.coworkUser.coworkAccountId
    );

    let applicationFee = 0;
    if (!invoice.application_fee_paid && invoice.application_fee) {
      applicationFee = invoice.application_fee;
    }

    const coworkStripeAccount = await StripeConnectService.createOrGetAccount(
      user.coworkUser.coworkAccountId
    );

    let totalPayment = data.items.reduce((agg, curr) => agg + curr.amount, 0);

    const openAmount = invoice.total - invoice.total_invoice_paid;
    let openAmountAfterP = invoice.total - totalPayment;

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    let totalPaidAmount: any = 0.0;
    let totalOpenAmount: any = 0;

    totalPaidAmount = totalPayment.toString();

    totalPaidAmount =
      totalPaidAmount.substring(0, totalPaidAmount.length - 2) +
      '.' +
      totalPaidAmount.substring(totalPaidAmount.length - 2);

    totalPaidAmount = dollarUSLocale.format(parseFloat(totalPaidAmount));

    totalOpenAmount = openAmountAfterP.toString();

    totalOpenAmount =
      totalOpenAmount.substring(0, totalOpenAmount.length - 2) +
      '.' +
      totalOpenAmount.substring(totalOpenAmount.length - 2);

    totalOpenAmount = dollarUSLocale.format(parseFloat(totalOpenAmount));

    const client = await User.query().where('id', invoice.user_id).first();
    const location = await Location.query().where('id', invoice.location_id).first();

    if (!client) {
      throw new AppError(AppError.BAD_REQUEST, 'Client not found');
    }

    if (!location) {
      throw new AppError(AppError.BAD_REQUEST, 'Location not found');
    }

    if (applicationFee && totalPayment < applicationFee) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'The total payment must be greater than or equal to the application fee'
      );
    }

    if (totalPayment > openAmount) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'The total received is greater than the open amount'
      );
    }

    let activityType = InvoiceStatusEnum.FULLY_PAID;
    if (totalPayment + invoice.total_invoice_paid < invoice.total) {
      activityType = InvoiceStatusEnum.PARTLY_PAID;
    }

    let methodId;
    switch (data.payment_method) {
      case PaymentTypesEnum.BANK_ACCOUNT:
        methodId = data.bank_account_id;
        break;
      case PaymentTypesEnum.CARD:
        methodId = data.card_id;
        break;
    }

    if (!data.card_id && data.card) {
      const addNewCard = await WalletService.store(
        client,
        WalletTypesEnum.CARD,
        data.card.token,
        data.card.nickname
      );
      methodId = addNewCard.id;
    }

    const checkPaymentMethod = await WalletService.userHasPermissionToUsePaymentMethod(
      invoice.user_id,
      data.payment_method,
      methodId
    );

    if (!checkPaymentMethod) {
      await this.sendPaymentIssueEmailClient(
        client,
        user,
        location.name,
        totalOpenAmount,
        invoice.uuid
      );

      throw new AppError(AppError.BAD_REQUEST, 'Invalid payment method');
    }

    const trx = await Database.transaction();

    try {
      const onlinePayment = await WalletService.createCharge(
        invoice.user_id,
        totalPayment,
        data.payment_method,
        methodId,
        coworkStripeAccount.accountId,
        applicationFee
      );

      const newPayment = await new Payment()
        .merge({
          invoiceId: invoice.id,
          paymentType: data.payment_method,
          amount: onlinePayment.amount,
          userId: user.id,
          status: String(onlinePayment.status).toUpperCase(),
          gatewayId: onlinePayment.id,
          integrationService: IntegrationServiceEnum.STRIPE,
          applicationFee: applicationFee ? true : false,
          available: 0
        })
        .useTransaction(trx)
        .save();

      const invoicePaymentHistory: Partial<InvoicePaymentHistory>[] = data.items.reduce(
        (agg, curr) => [
          ...agg,
          ...(curr.invoice_item_id
            ? [
                {
                  paymentId: newPayment.id,
                  invoiceId: invoice.id,
                  invoiceItemId: curr.invoice_item_id,
                  amount: curr.amount
                }
              ]
            : [])
        ],
        []
      );

      await InvoicePaymentHistory.createMany(invoicePaymentHistory, { client: trx });

      // items for initial fees are coming inside items, need to be change
      const initialFeesData: Partial<PaymentHistoryInitialFees>[] = data.items.reduce(
        (agg, curr) => [
          ...agg,
          ...(curr.invoice_ini_fee_id
            ? [
                {
                  invoiceIniFeeId: curr.invoice_ini_fee_id,
                  amount: curr.amount
                }
              ]
            : [])
        ],
        []
      );
      await newPayment.related('historyInitialFees').createMany(initialFeesData);
      await this.updateInvoiceStatus(invoice.id, activityType, false, trx);

      await trx.commit();

      await this.sendPaymentEmailClient(
        client,
        location.name,
        totalPaidAmount,
        totalOpenAmount,
        invoice.uuid
      );

      await this.sendPaymentEmailCoworking(
        user,
        client,
        location.name,
        totalPaidAmount,
        totalOpenAmount,
        invoice.uuid
      );

      return newPayment;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async refundPayment(invoiceUUID: string, user: User, data: RefundPaymentInterface) {
    await user.load('coworkUser');

    const invoice = await this.getInvoiceDetailedInfos(
      invoiceUUID,
      user.coworkUser.coworkAccountId
    );

    const payment = await Payment.query()
      .where('id', data.payment_id)
      .where('invoice_id', invoice.id)
      .first();

    if (!payment) {
      throw new AppError(AppError.NOT_FOUND, 'Payment not found');
    }

    if (
      payment.status === PaymentStatusEnum.FAILED ||
      payment.status === PaymentStatusEnum.PENDING ||
      !payment.available
    ) {
      throw new AppError(AppError.BAD_REQUEST, 'This payment is not available for refund');
    }

    const totalToRefund = data.amount ? data.amount : payment.available;
    const totalPaid = await this.calculatePaymentsInvoices(invoice.id);

    try {
      if (payment.paymentType === PaymentTypesEnum.RECEIVED) {
        if (totalToRefund === payment.available) {
          payment.status = PaymentStatusEnum.REFUNDED;
        } else if (totalToRefund < payment.available) {
          payment.status = PaymentStatusEnum.PARTLY_REFUNDED;
        } else {
          throw new AppError(
            AppError.BAD_REQUEST,
            'It is not possible to reverse an amount greater than the total payment'
          );
        }

        payment.available = payment.available - totalToRefund;

        await payment.save();

        await PaymentHistory.create({
          paymentId: payment.id,
          status: payment.status,
          amount: -1 * totalToRefund
        });

        const newStatus =
          totalToRefund >= totalPaid
            ? InvoiceStatusEnum.FULLY_REFUNDED
            : InvoiceStatusEnum.PARTLY_REFUNDED;

        await InvoiceService.updateInvoiceStatus(invoice.id, newStatus, true);
      } else {
        // If payment is online
        if (!payment.gatewayId) {
          throw new AppError(AppError.LOGIC_ERROR, 'An unexpected error occurred');
        }

        // The payment status update will be done in the StripeWebhook
        await PaymentService.refund({ charge: payment.gatewayId, amount: totalToRefund });
      } // end if else

      const client = await User.query().where('id', invoice.user_id).first();
      const location = await Location.query().where('id', invoice.location_id).first();

      if (!client) {
        throw new AppError(AppError.BAD_REQUEST, 'Client not found');
      }

      if (!location) {
        throw new AppError(AppError.BAD_REQUEST, 'Location not found');
      }

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      let refundAmount: any = 0.0;

      refundAmount = totalToRefund.toString();

      refundAmount =
        refundAmount.substring(0, refundAmount.length - 2) +
        '.' +
        refundAmount.substring(refundAmount.length - 2);

      refundAmount = dollarUSLocale.format(parseFloat(refundAmount));

      await this.sendRefundPaymentEmailClient(
        client,
        user,
        location.name,
        refundAmount,
        invoice.uuid
      );

      return payment;
    } catch (error) {
      throw error;
    }
  }

  static async calculatePaymentsInvoices(invoiceId: number) {
    const payments = await Payment.query()
      .where('invoice_id', invoiceId)
      .whereNotIn('status', [PaymentStatusEnum.REFUNDED, PaymentStatusEnum.FAILED]);

    const subtotal = payments.reduce((acc, curr) => acc + curr.available, 0);

    return subtotal;
  }

  static async updateInvoiceStatus(
    id: number,
    status: InvoiceStatusEnum,
    isRefund: boolean = false,
    trx?: TransactionClientContract
  ) {
    try {
      const invoice = await Invoice.findOrFail(id);
      invoice.status = status;

      const client = await User.find(invoice.userId);
      if (!client) {
        throw new AppError(AppError.BAD_REQUEST, 'Related invoice client not found');
      }

      await InvoiceActivity.create(
        {
          invoiceId: id,
          type: status
        },
        { client: trx }
      );

      if (trx) {
        await invoice.useTransaction(trx).save();
      } else {
        await invoice.save();
      }

      if (
        (invoice.status === InvoiceStatusEnum.FULLY_PAID ||
          invoice.status === InvoiceStatusEnum.PARTLY_PAID) &&
        !isRefund
      ) {
        const user = await User.findOrFail(invoice.userId);
        await MeetroomService.confirmMeetingFromPayment(invoice.id);
        await DayPassService.confirmDayPassFromPayment(invoice.id);

        await NotificationsService.create({
          title: 'Payment received',
          message: `The client ${user.fullName} paid an invoice`,
          type: NotificationTypeEnum.COWORK,
          client_id: invoice.userId,
          cowork_account_id: invoice.coworkAccountId
        });
      }

      const overdueSince = DateTime.now();

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      let openAmount: any = 0.0;

      openAmount = invoice.total.toString();

      openAmount =
        openAmount.substring(0, openAmount.length - 2) +
        '.' +
        openAmount.substring(openAmount.length - 2);

      openAmount = dollarUSLocale.format(parseFloat(openAmount));

      if (status === InvoiceStatusEnum.OVERDUE) {
        this.sendInvoiceOverdueEmailClient(
          client,
          overdueSince.toLocaleString(DateTime.DATE_FULL),
          openAmount,
          invoice.uuid
        );
      } // end if
    } catch (error) {
      throw error;
    } // end try catch
  }

  static async getUserPaymentMethods(userUUID: string, user: User) {
    await user.load('coworkUser');
    const clientUser = await User.findByOrFail('uuid', userUUID);

    const client = await CoworkClient.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', clientUser.id)
      .first();

    if (!client || !clientUser) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid user');
    }

    const paymentMethods = await WalletService.list(clientUser);

    return paymentMethods;
  }

  private static calculateTaxValue(method: string, value: number, total: number): number {
    switch (method) {
      case TaxMethodsEnum.FIXED:
        return value;
      case TaxMethodsEnum.PERCENTAGE:
        return total * (value / 10000);
      default:
        return 0;
    }
  }

  private static async getInvoiceDetailedInfos(
    uuid: string,
    coworkAccountId: number
  ): Promise<DetailedInvoice> {
    const invoice = await Invoice.findBy('uuid', uuid);

    if (!invoice || coworkAccountId !== invoice.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invoice not found');
    }

    return await invoice.getDetailed();
  }

  static async checkInvoiceReminder() {
    try {
      const invoices = await Invoice.query().select('*');

      const currentDate = DateTime.now();

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      let totalOpenAmount: any = 0;

      invoices.map(async (item) => {
        const client = await User.find(item.userId);

        if (!client) {
          throw new AppError(AppError.BAD_REQUEST, 'Related client not found');
        }

        let diff = Math.abs(item.dueDate.toMillis() - currentDate.toMillis());
        let diffDays = Math.ceil(diff / (1000 * 3600 * 24));

        if (diffDays === 1) {
          totalOpenAmount = item.total.toString();

          totalOpenAmount =
            totalOpenAmount.substring(0, totalOpenAmount.length - 2) +
            '.' +
            totalOpenAmount.substring(totalOpenAmount.length - 2);

          totalOpenAmount = dollarUSLocale.format(parseFloat(totalOpenAmount));

          await this.sendPaymentReminderEmailClient(
            client,
            item.dueDate.toLocaleString(DateTime.DATE_FULL),
            totalOpenAmount,
            item.uuid
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendPaymentEmailClient(
    client: User,
    locationName: string,
    totalPaidAmount: number,
    openAmount: number,
    invoiceUUID: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Payment received')
        .htmlView('emails/coworker/invoiceAndPayment/payment_made', {
          clientFirstName: client.firstName,
          locationName: locationName,
          totalPaidAmount: totalPaidAmount,
          invoiceId: ParseUUIDToSmall(invoiceUUID),
          openAmount: openAmount,
          token: `${ApplicationUrls.PUB.INVOICES}` + invoiceUUID + '/pdf'
        });
    });
  }

  static async sendPaymentEmailCoworking(
    manager: User,
    client: User,
    locationName: string,
    totalPaidAmount: number,
    openAmount: number,
    invoiceUUID: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(manager.email, manager.firstName)
        .subject('Payment received')
        .htmlView('emails/coworking/invoiceAndPayment/payment_made', {
          managerFirstName: manager.firstName,
          clientFirstName: client.firstName,
          locationName: locationName,
          totalPaidAmount: totalPaidAmount,
          invoiceId: ParseUUIDToSmall(invoiceUUID),
          openAmount: openAmount,
          token: `${ApplicationUrls.PUB.INVOICES}` + invoiceUUID + '/pdf'
        });
    });
  }

  static async sendInvoiceOverdueEmailClient(
    client: User,
    overdueSince: string,
    openAmount: number,
    invoiceUUID: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Invoice overdue')
        .htmlView('emails/coworker/invoiceAndPayment/payment_overdue', {
          clientFirstName: client.firstName,
          invoiceId: ParseUUIDToSmall(invoiceUUID),
          overdueSince: overdueSince,
          memberPanelToken: `${ApplicationUrls.AUTH.LOGIN}`,
          openAmount: openAmount,
          token: `${ApplicationUrls.PUB.PUBLIC_INVOICE}` + invoiceUUID
        });
    });
  }

  static async sendPaymentIssueEmailClient(
    client: User,
    manager: User,
    locationName: string,
    openAmount: number,
    invoiceUuid: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Payment issue')
        .htmlView('emails/coworker/invoiceAndPayment/declined_payment', {
          clientFirstName: client.firstName,
          managerFirstName: manager.firstName,
          locationName: locationName,
          memberPanelToken: `${ApplicationUrls.AUTH.LOGIN}`,
          openAmount: openAmount,
          token: `${ApplicationUrls.PUB.INVOICES}` + invoiceUuid + '/pdf'
        });
    });
  }

  static async sendInvoiceEmailClient(
    client: User,
    manager: User,
    locationName: string,
    openAmount: number,
    invoiceUuid: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject(`New invoice from ${locationName}`)
        .htmlView('emails/coworker/invoiceAndPayment/new_invoice', {
          clientFirstName: client.firstName,
          managerFirstName: manager.firstName,
          locationName: locationName,
          openAmount: openAmount,
          menberPanelToken: `${ApplicationUrls.AUTH.LOGIN}`,
          token: `${ApplicationUrls.PUB.PUBLIC_INVOICE}` + invoiceUuid
        });
    });
  }

  static async sendRefundPaymentEmailClient(
    client: User,
    manager: User,
    locationName: string,
    refundAmount: number,
    invoiceUUID: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Payment Refund')
        .htmlView('emails/coworker/invoiceAndPayment/refund_made', {
          managerFirstName: manager.firstName,
          clientFirstName: client.firstName,
          locationName: locationName,
          refundAmount: refundAmount,
          invoiceId: ParseUUIDToSmall(invoiceUUID)
        });
    });
  }

  static async sendPaymentReminderEmailClient(
    client: User,
    dueDate: string,
    openBalance: number,
    invoiceUUID: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Payment Reminder')
        .htmlView('emails/coworker/invoiceAndPayment/payment_reminder', {
          clientFirstName: client.firstName,
          invoiceId: ParseUUIDToSmall(invoiceUUID),
          dueDate: dueDate,
          openBalance: openBalance,
          token: `${ApplicationUrls.PUB.PUBLIC_INVOICE}` + invoiceUUID
        });
    });
  }
}
