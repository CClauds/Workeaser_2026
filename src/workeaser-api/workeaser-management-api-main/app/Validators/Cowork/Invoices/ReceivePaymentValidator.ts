import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class ReceivePaymentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    items: schema.array().members(
      schema.object().members({
        invoice_item_id: schema.number.optional([
          rules.exists({ table: 'invoice_items', column: 'id' })
        ]),
        invoice_ini_fee_id: schema.number.optional([
          rules.exists({ table: 'initial_fees', column: 'id' })
        ]),
        amount: schema.number([rules.unsigned()])
      })
    )
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid'
  };
}
