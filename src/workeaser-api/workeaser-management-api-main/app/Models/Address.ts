import { afterFetch, BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class Address extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public fulltext: string;

  @column()
  public fulltext2: string;

  @column()
  public latitude: number | null;

  @column()
  public longitude: number | null;

  @column()
  public country: string | null;

  @column()
  public city: string | null;

  @column()
  public state: string | null;

  @column()
  public zipcode: number | null;

  @column()
  public short_address: string | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @afterFetch()
  public static async get_short_address(address: Address[]) {
    await Promise.all(
      address.map((address) => {
        if (!address.city || !address.state || !address.country) {
          return;
        }
        address.short_address = `${address.city}, ${address.state}, ${address.country}`;
        return address;
      })
    );
  }

  static get fillable() {
    return ['fulltext', 'latitude', 'longitude', 'short_address'];
  }

  @beforeCreate()
  public static async generateUUID(model: Address) {
    model.uuid = uuidv4();
  }
}
