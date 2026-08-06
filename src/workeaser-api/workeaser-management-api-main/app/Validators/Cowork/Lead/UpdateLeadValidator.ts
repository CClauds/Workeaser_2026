import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class UpdateLeadValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    client_account: schema.object().members({
      company_name: schema.string.optional({ trim: true }),
      company_email: schema.string.optional({}, [rules.email()]),
      company_phone: schema.string.optional({}, [rules.maxLength(14), rules.minLength(10)]),
      company_address: schema.object.optional().members({
        fulltext: schema.string.optional({ trim: true }),
        latitude: schema.number.optional(),
        longitude: schema.number.optional(),
        country: schema.string.optional({ trim: true })
      }),
      personal_address: schema.object.optional().members({
        fulltext: schema.string.optional({ trim: true }),
        latitude: schema.number.optional(),
        longitude: schema.number.optional(),
        country: schema.string.optional({ trim: true })
      }),
      user: schema.object().members({
        first_name: schema.string({ trim: true }),
        last_name: schema.string({ trim: true }),
        personal_phone: schema.string.optional({}, [rules.maxLength(14), rules.minLength(10)])
      })
    }),
    last_contact: schema.string.optional()
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    date: 'The {{ field }} must be a date',
    afterField: 'The {{ field }} must be greater than date_start'
  };
}
