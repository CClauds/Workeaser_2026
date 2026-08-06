import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import { PaymentTypesEnum } from 'Contracts/enums';

export default class PaymentCaptureValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    payment_method: schema.enum([PaymentTypesEnum.CARD, PaymentTypesEnum.BANK_ACCOUNT] as const),

    bank_account_id: schema.number.optional([
      rules.requiredWhen('payment_method', '=', PaymentTypesEnum.BANK_ACCOUNT)
      //rules.exists({ table: 'bank_accounts', column: 'id' })
    ]),

    card_id: schema.number.optional([
      rules.requiredIfNotExists('card')
      // rules.requiredWhen('payment_method', '=', PaymentTypesEnum.CARD)
      //rules.exists({ table: 'cards', column: 'id' })
    ]),
    card: schema.object.optional([rules.requiredIfNotExists('card_id')]).members({
      nickname: schema.string({ trim: true }),
      token: schema.string({ trim: true })
    }),
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
