import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { PaymentTypesEnum } from 'Contracts/enums';

export default class PayPublicInvoiceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    payment_method: schema.enum([PaymentTypesEnum.CARD, PaymentTypesEnum.BANK_ACCOUNT] as const),

    token: schema.string.optional({ trim: true }),
    public_token: schema.string.optional({ trim: true }),
    account_id: schema.string.optional({ trim: true }),
    bank_account_id: schema.number.optional([
      rules.exists({ table: 'bank_accounts', column: 'id' })
    ]),
    card_id: schema.number.optional([rules.exists({ table: 'cards', column: 'id' })]),

    items: schema.array().members(
      schema.object().members({
        invoice_item_id: schema.number([rules.exists({ table: 'invoice_items', column: 'id' })]),
        amount: schema.number([rules.unsigned()])
      })
    )
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid'
  };
}
