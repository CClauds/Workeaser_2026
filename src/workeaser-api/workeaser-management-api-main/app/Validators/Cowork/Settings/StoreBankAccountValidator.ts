import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StoreBankAccountValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    token: schema.string({ trim: true }),
    nickname: schema.string({ trim: true }),
    account_id: schema.string({ trim: true }),
    is_main_account: schema.boolean()
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
