import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { WalletTypesEnum } from 'Contracts/enums';

export default class StoreWalletValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    nickname: schema.string({ trim: true }),
    payment_method: schema.enum([WalletTypesEnum.BANK_ACCOUNT, WalletTypesEnum.CARD] as const),
    token: schema.string({ trim: true }),
    account_id: schema.string.optional({ trim: true }, [
      rules.requiredWhen('payment_method', '=', WalletTypesEnum.BANK_ACCOUNT)
    ])
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
