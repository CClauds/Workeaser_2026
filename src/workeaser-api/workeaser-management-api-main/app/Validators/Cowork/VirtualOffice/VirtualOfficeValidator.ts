import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import { ContractTermEnum } from 'Contracts/enums';

export default class VirtualOfficeValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    location_id: schema.number.optional([rules.exists({ table: 'locations', column: 'id' })]),
    name: schema.string({ trim: true }),
    description: schema.string({ trim: true }),
    has_dir_listing: schema.boolean(),
    has_mailing: schema.boolean(),
    has_phone_answer: schema.boolean(),
    has_voip: schema.boolean(),
    coworking_usage_mo: schema.number([rules.unsigned()]),
    meetroom_usage_mo: schema.number([rules.unsigned()]),
    renewal_tax: schema.number.optional([rules.unsigned()]),
    searchable: schema.boolean(),
    photos: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'photos', column: 'id' })])
      })
    ),
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
        // Lote final: bloquear valores negativos em precos (Lote 5b/HF36).
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
    )
  });
}
