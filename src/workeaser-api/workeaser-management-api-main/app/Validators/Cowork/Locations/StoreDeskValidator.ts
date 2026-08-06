import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import { ContractTermEnum } from 'Contracts/enums';

export default class StoreDeskValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    name: schema.string({ trim: true }, [rules.minLength(3)]),
    description: schema.string({ trim: true }, [rules.minLength(2)]),
    shareable: schema.boolean(),
    searchable: schema.boolean(),
    quantity: schema.number([rules.unsigned()]),
    renewal_tax: schema.number.optional([rules.unsigned()]),
    minimum_rental_period: schema.number([rules.unsigned()]),
    day_price: schema.number.optional([rules.unsigned()]),
    is_daypass_enabled: schema.boolean(),
    prices: schema.array().members(
      schema.object().members({
        id: schema.number.optional([rules.unsigned()]),
        duration: schema.enum([
          ContractTermEnum.MONTH_1,
          ContractTermEnum.MONTH_3,
          ContractTermEnum.MONTH_6,
          ContractTermEnum.YEAR_1,
          ContractTermEnum.YEAR_2,
          ContractTermEnum.YEAR_3
        ] as const),
        monthly_price: schema.number([rules.unsigned()]),
        full_price: schema.number([rules.unsigned()])
      })
    ),
    fees: schema.array().members(
      schema.object().members({
        id: schema.number.optional([rules.unsigned()]),
        name: schema.string({ trim: true }),
        description: schema.string({ trim: true }),
        amount: schema.number([rules.unsigned()])
      })
    ),
    photos: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'photos', column: 'id' })])
      })
    )
  });

  public messages = {
    minLength: 'The {{ field }} must be at least {{ options.minLength }} characters',
    required: 'The {{ field }} is required'
  };
}
