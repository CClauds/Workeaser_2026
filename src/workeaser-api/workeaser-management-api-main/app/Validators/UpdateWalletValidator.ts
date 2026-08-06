import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class UpdateWalletValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    nickname: schema.string({ trim: true }),
    holder_name: schema.string.optional({ trim: true }),

    cardholder_name: schema.string.optional({ trim: true }),
    exp_month: schema.number.optional(),
    exp_year: schema.number.optional()
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
