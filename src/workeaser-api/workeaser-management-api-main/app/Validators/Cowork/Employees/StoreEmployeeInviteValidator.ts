import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StoreEmployeeInviteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    invitee_first_name: schema.string(),
    email: schema.string({}, [rules.email()]),
    locations: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'locations', column: 'id' })])
      })
    ),
    capabilities: schema.array().members(
      schema.object().members({
        id: schema.number([
          rules.unsigned(),
          rules.exists({ table: 'client_modules', column: 'id' })
        ])
      })
    )
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid'
  };
}
