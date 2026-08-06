import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';

export default class StoreMailboxValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    delivery_date: schema.date({ format: 'yyyy-MM-dd' }),
    client_uuid: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'uuid' })]),
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    photos: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'photos', column: 'id' })])
      })
    ),
    additional_information: schema.string.optional({ trim: true })
  });
  public messages = {
    required: 'The {{ field }} is required'
  };
}
