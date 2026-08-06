/**
 * CalendarIntegration — armazena tokens OAuth de Google Calendar / Exchange.
 *
 * HF-SPRINT-B-11: tokens (access + refresh) agora são CIFRADOS at rest via
 * SecretCipher (AES-256-GCM, chave derivada de APP_KEY).
 *
 * Compatibilidade: registros antigos com token em plaintext continuam funcionando
 * (decrypt() devolve plaintext quando não tem prefixo enc:v1:). No próximo save,
 * o setter cifra automaticamente.
 *
 * Migração gradual sem downtime nem migration de dados.
 */
import CoworkAccount from 'App/Models/CoworkAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import { encrypt, decrypt } from 'App/Utils/SecretCipher';

export default class CalendarIntegration extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public service: string;

  @column({
    prepare: (v: string | null | undefined) => encrypt(v),
    consume: (v: string | null | undefined) => decrypt(v),
  })
  public token: string;

  @column({
    prepare: (v: string | null | undefined) => encrypt(v),
    consume: (v: string | null | undefined) => decrypt(v),
  })
  public refreshToken: string;

  @column.dateTime()
  public expiredAt: DateTime;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
