/**
 * DiscountRedemption — registro de uso de cupom.
 * Sprint H (HF-SPRINT-H-02).
 */
import { BaseModel, BelongsTo, belongsTo, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';
import DiscountCode from './DiscountCode';

export default class DiscountRedemption extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'discount_redemptions';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public discountCodeId: number;

  @column()
  public userId: number;

  @column()
  public subscriptionId: number | null;

  @column()
  public currency: string;

  @column()
  public amountOffCents: number;

  @column.dateTime()
  public redeemedAt: DateTime;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @belongsTo(() => DiscountCode, { foreignKey: 'discountCodeId' })
  public code: BelongsTo<typeof DiscountCode>;
}
