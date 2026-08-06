import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class LostPasswordConfirmationValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    token: schema.string(),
    password: schema.string({}, [rules.minLength(8), rules.confirmed()])
  });

  public messages = {
    'token.required': 'The token is required',
    'password.required': 'The password is required',
    'password.minLength': 'The password must be at least 8 characters',
    'password_confirmation.confirmed': 'The passwords are different'
  };
}
