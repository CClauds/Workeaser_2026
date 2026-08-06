/**
 * LinkedBankAccount — armazena vínculo com conta bancária via Plaid.
 *
 * HF-SPRINT-B-12: `gatewayId` (Plaid access_token ou item_id) agora cifrado at rest
 * via SecretCipher. Compatível com registros antigos em plaintext.
 */
import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import CoworkAccount from 'App/Models/CoworkAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import BankAccountTransaction from './BankAccountTransaction';
import { encrypt, decrypt } from 'App/Utils/SecretCipher';

export default class LinkedBankAccount extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column({
    serializeAs: null,
    prepare: (v: string | null | undefined) => encrypt(v),
    consume: (v: string | null | undefined) => decrypt(v),
  })
  public gatewayId: string;

  @column({ serializeAs: null })
  public integrationService: string;

  @column()
  public nickname: string;

  @column()
  public bankName: string;

  @column()
  public lastDigits: string;

  @column()
  public isMainAccount: boolean;

  @column()
  public nextCursor: string;

  @hasMany(() => BankAccountTransaction)
  public transactions: HasMany<typeof BankAccountTransaction>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
