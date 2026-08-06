import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { TaxMethodsEnum, TaxTypesEnum, RecurringTypeTaxEnum } from 'Contracts/enums';

export default class StoreTaxValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    type: schema.enum([
      TaxTypesEnum.CITY_TAX,
      TaxTypesEnum.COMPANY_FEE,
      TaxTypesEnum.FEDERAL_TAX,
      TaxTypesEnum.STATE_TAX,
      TaxTypesEnum.OTHERS
    ] as const),
    recurring_type: schema.enum([
      RecurringTypeTaxEnum.CREATED,
      RecurringTypeTaxEnum.OVERDUE
    ] as const),
    method: schema.enum([TaxMethodsEnum.FIXED, TaxMethodsEnum.PERCENTAGE] as const),
    value: schema.number([rules.unsigned()]),
    services: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'services', column: 'id' })])
      })
    )
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid'
  };
}
