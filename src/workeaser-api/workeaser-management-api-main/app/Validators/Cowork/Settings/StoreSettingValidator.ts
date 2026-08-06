import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StoreSettingValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    recurring_invoice_creation: schema.number([rules.range(1, 28)]),
    recurring_invoice_due_date: schema.number([rules.range(1, 28)])
  });

  public messages = {};
}
