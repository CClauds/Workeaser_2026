import { DateTime } from 'luxon';
import { ContractStatusEnum, ServicesEnum } from 'Contracts/enums';
import {
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  computed,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import User from 'App/Models/User';
import Invoice from 'App/Models/Invoice';
import Document from 'App/Models/Document';
import Location from 'App/Models/Location';
import ContractUsage from 'App/Models/ContractUsage';
import CoworkAccount from 'App/Models/CoworkAccount';
import ContractRenewal from 'App/Models/ContractRenewal';
import ContractActivity from 'App/Models/ContractActivity';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import ContractNotification from 'App/Models/ContractNotification';
import { v4 as uuidv4 } from 'uuid';

export default class Contract extends SoftDeleteBaseModel {
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

  @column()
  public serviceType: string;

  @column()
  public envelopeId: string;

  @column()
  public resourceId: number;

  @column()
  public termSize: string;

  @column()
  public autoRenewal: boolean;

  @column()
  public paymentRecurringStyle: string;

  @column()
  public amount: number;

  @column()
  public firstInvoiceAmount: number;

  @column()
  public coworkUsagePerMonth: number;

  @column()
  public meetingRoomUsagePerMonth: number;

  @column()
  public status: string;

  @column.date()
  public dateStart: DateTime;

  @column.date()
  public dateEnd: DateTime;

  @column()
  public contractDocumentId: number;

  @belongsTo(() => Document, {
    foreignKey: 'contractDocumentId'
  })
  public contractDocument: BelongsTo<typeof Document>;

  @manyToMany(() => Document, {
    pivotTable: 'contract_documents'
  })
  public documents: ManyToMany<typeof Document>;

  @hasMany(() => ContractActivity)
  public activities: HasMany<typeof ContractActivity>;

  @hasMany(() => ContractRenewal)
  public renewals: HasMany<typeof ContractRenewal>;

  @manyToMany(() => Invoice, {
    pivotTable: 'invoice_contracts'
  })
  public invoices: ManyToMany<typeof Invoice>;

  @hasMany(() => ContractUsage)
  public usages: HasMany<typeof ContractUsage>;

  @hasMany(() => ContractNotification)
  public notifications: HasMany<typeof ContractNotification>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public request_sign: boolean;

  @column.date()
  public service_started_date: DateTime;

  @column.date()
  public service_renew_cancel_date: DateTime;

  @computed()
  public get renew_date() {
    return this.autoRenewal && this.status === ContractStatusEnum.ACTIVE
      ? this.dateEnd.toFormat('yyyy-MM-dd')
      : null;
  }

  public get getServiceCategory() {
    switch (this.serviceType) {
      case ServicesEnum.VIRTUAL_OFFICE:
        return 'Virtual Office';
      case ServicesEnum.OPEN_DESK:
        return 'Open Desk';
      case ServicesEnum.PRIVATE_ROOM:
        return 'Private Room';
      default:
        return '';
    }
  }

  @beforeCreate()
  public static async generateUUID(model: Contract) {
    model.uuid = uuidv4();
  }
}
