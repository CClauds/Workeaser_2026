import { BaseModel, BelongsTo, belongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import BankAccount from 'App/Models/BankAccount';
import Card from 'App/Models/Card';
import Invoice from 'App/Models/Invoice';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
import PaymentHistoryInitialFees from './PaymentHistoryInitialFees';

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public invoiceId: number;

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>;

  @column()
  public userId?: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public paymentType: string;

  @column()
  public integrationService?: string;

  @column()
  public gatewayId?: string;

  @column()
  public amount: number;

  @column()
  public available: number;

  @column()
  public status: string;

  @column()
  public cardId?: number;

  @belongsTo(() => Card)
  public card: BelongsTo<typeof Card>;

  @column()
  public bankAccountId?: number;

  @belongsTo(() => BankAccount)
  public bankAccount: BelongsTo<typeof BankAccount>;

  @column()
  public applicationFee: boolean;

  @hasMany(() => PaymentHistoryInitialFees)
  public historyInitialFees: HasMany<typeof PaymentHistoryInitialFees>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
