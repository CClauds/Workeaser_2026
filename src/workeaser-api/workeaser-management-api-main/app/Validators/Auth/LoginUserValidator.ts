import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class LoginUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    password: schema.string(),
    remember_me: schema.boolean.optional()
  });

  public messages = {
    'required': 'The {{ field }} is required',
    'email.email': 'The email is not valid',
    'remember_me.boolean': 'Remember me must be a boolean value'
  };
}
