import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StoreExternalAccountValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    token: schema.string({ trim: true }),
    default_for_currency: schema.boolean()
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
