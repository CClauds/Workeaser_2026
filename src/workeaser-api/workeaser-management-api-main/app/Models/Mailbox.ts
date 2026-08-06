import { DateTime } from 'luxon';
import {
  afterSave,
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import Photo from 'App/Models/Photo';
import Location from 'App/Models/Location';
import MailboxHistory from 'App/Models/MailboxHistory';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import User from './User';
import { v4 as uuidv4 } from 'uuid';
import ClientAccount from './ClientAccount';

export default class Mailbox extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public deliveryId: string;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public clientAccountId: number;

  @belongsTo(() => ClientAccount)
  public clientAccount: BelongsTo<typeof ClientAccount>;

  @column.date()
  public deliveryDate: DateTime;

  @column()
  public requestedAction: string;

  @column()
  public status: string;

  @column()
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column()
  public additionalInformation: string;

  @column()
  public forwardObservation: string | null;

  @manyToMany(() => Photo, {
    pivotTable: 'mailbox_photos'
  })
  public photos: ManyToMany<typeof Photo>;

  @hasMany(() => MailboxHistory)
  public historic: HasMany<typeof MailboxHistory>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @afterSave()
  public static async generateDeliveryId(mailBox: Mailbox) {
    if (mailBox.id) {
      const sumWithId = mailBox.id.toString().padStart(7, '0');
      const deliveryId = `MB-${sumWithId}`;
      mailBox.merge({ deliveryId });
      await mailBox.save();
    }
  }

  public static get fillable() {
    return [
      'delivery_id',
      'delivery_date',
      'requested_action',
      'status',
      'location_id',
      'additional_information'
    ];
  }

  @beforeCreate()
  public static async generateUUID(model: Mailbox) {
    model.uuid = uuidv4();
  }
}
