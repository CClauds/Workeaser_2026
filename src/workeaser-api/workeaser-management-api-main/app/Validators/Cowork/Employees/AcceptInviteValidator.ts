import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class AcceptInviteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    first_name: schema.string({ trim: true }, [rules.minLength(2)]),
    last_name: schema.string({ trim: true }, [rules.minLength(2)]),
    password: schema.string.optional({}, [rules.minLength(8), rules.confirmed()])
  });

  public messages = {
    'minLength': 'The {{ field }} must be at least {{ options.minLength }} characters',
    'password_confirmation.confirmed': 'The passwords are different'
  };
}
