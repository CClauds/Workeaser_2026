import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class AcceptInviteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    first_name: schema.string({ trim: true }, [rules.minLength(2)]),
    last_name: schema.string({ trim: true }, [rules.minLength(2)]),
    password: schema.string({}, [rules.minLength(8), rules.confirmed()]),
    photo_id: schema.number.optional([rules.exists({ table: 'photos', column: 'id' })]),
    personal_phone: schema.string({ trim: true }, [rules.maxLength(14), rules.minLength(10)]),
    personal_address: schema.object.optional().members({
      fulltext: schema.string.optional({ trim: true }),
      latitude: schema.number.optional(),
      longitude: schema.number.optional(),
      country: schema.string.optional({ trim: true })
    })
  });

  public messages = {
    'minLength': 'The {{ field }} must be at least {{ options.minLength }} characters',
    'maxLength': 'The {{ field }} must have at most {{ options.maxLength }} characters',
    'required': 'The {{ field }} is required',
    'exists': 'The {{ field }} is invalid',
    'number': 'The {{ field }} must be a number',
    'string': 'The {{ string }} must be a string',
    'password_confirmation.confirmed': 'The passwords are different'
  };
}
