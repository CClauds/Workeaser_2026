import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';

export default class ChatValidatorCowork {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    cowork_account_id: schema.number([rules.exists({ table: 'cowork_accounts', column: 'id' })])
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid'
  };
}
