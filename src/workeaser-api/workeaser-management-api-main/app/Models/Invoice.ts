import {
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import Contract from 'App/Models/Contract';
import CoworkAccount from 'App/Models/CoworkAccount';
import InitialFees from 'App/Models/InitialFees';
import InvoiceActivity from 'App/Models/InvoiceActivity';
import InvoiceItem from 'App/Models/InvoiceItem';
import InvoicePaymentHistory from 'App/Models/InvoicePaymentHistory';
import Location from 'App/Models/Location';
import Payment from 'App/Models/Payment';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import User from 'App/Models/User';
import { InvoiceStatusEnum, PaymentStatusEnum } from 'Contracts/enums';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export interface HistoricInterface {
  payment_id: number;
  amount: number;
  status: string;
  payment_available: number;
  created_at: string;
}

export interface ItemInterface {
  id: number;
  invoice_id: number;
  service_type: string;
  name: string;
  date: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit_taxes: number;
  total_taxes: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  unit_taxes_overdue: number;
  total_taxes_overdue: number;
}

export interface IniFeesInterface {
  id: number;
  invoice_id: number;
  name: string;
  value: number;
}

export interface DetailedInvoice {
  id: number;
  cowork_account_id: number;
  location_id?: number;
  date: string;
  due_date: string;
  additional_notes?: string;
  subtotal: number;
  total: number;
  total_taxes: number;
  status: string;
  created_at: string;
  updated_at: string;
  total_taxes_overdue: number;
  application_fee: number;
  application_fee_paid: boolean;
  user_id: number;
  uuid: string;
  historic: HistoricInterface[];
  payments: LightPayment[];
  items: ItemInterface[];
  iniFees: IniFeesInterface[];
  is_invoice_overdue: boolean;
  total_invoice_paid: number;
  open_amount: number;
  user: User;
  location: Location;
}

export interface LightPayment {
  id: number;
  amount: number;
  status: string;
  payment_available: number;
  created_at: string;
}

export default class Invoice extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column.date()
  public date: DateTime;

  @column.date()
  public dueDate: DateTime;

  @column()
  public additionalNotes: string;

  @column()
  public subtotal: number;

  @column()
  public total: number;

  @column()
  public totalTaxes: number;

  @column()
  public totalTaxesOverdue: number;

  @column()
  public applicationFee: number;

  @column()
  public applicationFeePaid: boolean;

  @column()
  public status: string;

  @hasMany(() => InvoiceItem)
  public items: HasMany<typeof InvoiceItem>;

  @hasMany(() => InvoiceActivity)
  public activities: HasMany<typeof InvoiceActivity>;

  @hasMany(() => InvoicePaymentHistory)
  public historic: HasMany<typeof InvoicePaymentHistory>;

  @manyToMany(() => Contract, {
    pivotTable: 'invoice_contracts'
  })
  public contracts: ManyToMany<typeof Contract>;

  @hasMany(() => Payment)
  public payments: HasMany<typeof Payment>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static generateUuid(invoice: Invoice) {
    invoice.uuid = uuidv4();
  }

  @column()
  invoice_local_account_id: number;

  @hasMany(() => InitialFees)
  public iniFees: HasMany<typeof InitialFees>;

  public get getInvoiceTotal(): number {
    let total = this.total;

    if (DateTime.now().startOf('day') > this.dueDate.startOf('day')) {
      total += this.totalTaxesOverdue;
    }

    return total;
  }

  public async isOverdue(this: Invoice): Promise<boolean> {
    if (
      this.status === InvoiceStatusEnum.FULLY_PAID ||
      this.status === InvoiceStatusEnum.DEPOSITED
    ) {
      const lastFullyPaidActivity = await this.related('activities')
        .query()
        .where('type', InvoiceStatusEnum.FULLY_PAID)
        .orderBy('created_at', 'desc')
        .first();

      if (!lastFullyPaidActivity) {
        return true;
      }

      return lastFullyPaidActivity.createdAt.startOf('day') > this.dueDate.startOf('day');
    }

    return DateTime.now().startOf('day') > this.dueDate.startOf('day');
  }

  public getStatus(this: Invoice): string {
    if (
      this.status === InvoiceStatusEnum.FULLY_PAID ||
      this.status === InvoiceStatusEnum.DEPOSITED ||
      this.status === InvoiceStatusEnum.FULLY_REFUNDED ||
      this.status === InvoiceStatusEnum.PARTLY_REFUNDED
    ) {
      return this.status;
    }

    if (DateTime.now().startOf('day') > this.dueDate.startOf('day')) {
      return InvoiceStatusEnum.OVERDUE;
    }

    return this.status;
  }

  public async getDetailed(this: Invoice): Promise<DetailedInvoice> {
    await this.load('items', (q) => {
      q.preload('fees', (f) => {
        f.preload('taxes');
      });
      q.whereNull('deleted_at');
    });
    await this.load('user', (u) => {
      u.preload('personalAddress');
    });
    await this.load('location', (c) => {
      c.preload('address');
    });
    await this.load('historic', (historicQuery) => {
      historicQuery.preload('payment');
    });
    await this.load('payments', (query) => {
      query.whereIn('status', [PaymentStatusEnum.SUCCEEDED, PaymentStatusEnum.PARTLY_REFUNDED]);
    });
    await this.load('iniFees');

    const isInvoiceOverdue = await this.isOverdue();
    const invoiceStatus = this.getStatus();
    const invoiceJson = this.toJSON();

    if (isInvoiceOverdue) {
      invoiceJson.total += invoiceJson.total_taxes_overdue;
      invoiceJson.items.forEach((item) => {
        item.total_amount += item.total_taxes_overdue;
      });
    }

    invoiceJson.status = invoiceStatus;

    let totalInvoicePaid = 0;

    const paymentHistoric: HistoricInterface[] = [];

    invoiceJson.historic.forEach((historic) => {
      const search = paymentHistoric.find((h) => h.payment_id === historic.payment_id);

      if (!search) {
        paymentHistoric.push({
          payment_id: historic.payment_id,
          amount: historic.payment.amount,
          status: historic.payment.status,
          payment_available: historic.payment.available,
          created_at: historic.payment.created_at
        });

        if (
          [PaymentStatusEnum.SUCCEEDED, PaymentStatusEnum.PARTLY_REFUNDED].includes(
            historic.payment.status
          )
        ) {
          totalInvoicePaid += historic.payment.available;
        }
      }
    });

    invoiceJson.historic = paymentHistoric;

    return {
      id: invoiceJson.id,
      uuid: invoiceJson.uuid,
      cowork_account_id: invoiceJson.cowork_account_id,
      location_id: invoiceJson.location_id,
      date: invoiceJson.date,
      due_date: invoiceJson.due_date,
      additional_notes: invoiceJson.additional_notes,
      subtotal: invoiceJson.subtotal,
      total: invoiceJson.total,
      total_taxes: invoiceJson.total_taxes,
      status: invoiceJson.status,
      total_taxes_overdue: invoiceJson.total_taxes_overdue,
      application_fee: invoiceJson.application_fee,
      application_fee_paid: invoiceJson.application_fee_paid,
      user_id: invoiceJson.user_id,
      historic: invoiceJson.historic,
      payments: invoiceJson.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        payment_available: payment.available,
        created_at: payment.created_at
      })) as LightPayment[],
      items: invoiceJson.items,
      iniFees: invoiceJson.iniFees,
      is_invoice_overdue: isInvoiceOverdue,
      total_invoice_paid: totalInvoicePaid,
      open_amount: invoiceJson.total - totalInvoicePaid,
      user: invoiceJson.user,
      location: invoiceJson.location,
      created_at: invoiceJson.created_at,
      updated_at: invoiceJson.updated_at
    };
  }

  public static getInvoiceStatusFormatted(status: string) {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'SENT':
        return 'Sent';
      case 'VIEWED':
        return 'Viewed';
      case 'PARTLY_PAID':
        return 'Partly Paid';
      case 'FULLY_PAID':
        return 'Fully Paid';
      case 'DEPOSITED':
        return 'Deposited';
      case 'PARTLY_REFUNDED':
        return 'Partly Refunded';
      case 'FULLY_REFUNDED':
        return 'Fully Refunded';
      case 'OVERDUE':
        return 'Overdue';
      default:
        return status;
    }
  }
}
