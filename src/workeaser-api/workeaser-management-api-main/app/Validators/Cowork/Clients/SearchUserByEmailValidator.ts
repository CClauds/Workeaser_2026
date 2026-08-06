import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class SearchUserByEmailValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()])
  });

  public messages = {
    'required': 'The {{ field }} is required',
    'email.email': 'The email is not valid'
  };
}
