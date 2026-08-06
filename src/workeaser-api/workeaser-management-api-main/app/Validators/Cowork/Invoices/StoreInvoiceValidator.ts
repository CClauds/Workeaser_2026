import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { RecurringTypeTaxEnum, ServicesEnum, TaxMethodsEnum, TaxTypesEnum } from 'Contracts/enums';

export default class StoreInvoiceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    location_id: schema.number.optional([rules.exists({ table: 'locations', column: 'id' })]),
    client_uuid: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'uuid' })]),
    date: schema.date(),
    // HF-SPRINT-M-02: due_date must be >= invoice date (antes aceitava qualquer ordem,
    //   permitia fatura "vencida antes de existir" e quebrava cálculos de overdue downstream)
    due_date: schema.date({}, [rules.afterOrEqualToField('date')]),
    additional_notes: schema.string.optional({ trim: true }),
    items: schema.array().members(
      schema.object().members({
        service_type: schema.enum.optional([
          ServicesEnum.VIRTUAL_OFFICE,
          ServicesEnum.MEETING_ROOM,
          ServicesEnum.PRIVATE_ROOM,
          ServicesEnum.OPEN_DESK
        ] as const),
        name: schema.string({ trim: true }),
        date: schema.date(),
        description: schema.string.optional({ trim: true }),
        // HF-SPRINT-M-03: quantity e unit_price > 0 (antes unsigned() aceitava 0 e podia
        //   ser bypass via type coercion → fatura negativa = contabilidade corrompida)
        quantity: schema.number([rules.unsigned(), rules.range(1, 999999)]),
        unit_price: schema.number([rules.unsigned(), rules.range(0.01, 999999999)]),
        fees: schema.array.optional().members(
          schema.object().members({
            name: schema.string({ trim: true }),
            description: schema.string.optional({ trim: true }),
            value: schema.number([rules.unsigned()]),
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
            taxes: schema.array().members(
              schema.object().members({
                name: schema.string({ trim: true }),
                value: schema.number([rules.unsigned()]),
                type: schema.enum([
                  TaxTypesEnum.CITY_TAX,
                  TaxTypesEnum.COMPANY_FEE,
                  TaxTypesEnum.FEDERAL_TAX,
                  TaxTypesEnum.STATE_TAX,
                  TaxTypesEnum.OTHERS
                ] as const),
                method: schema.enum([TaxMethodsEnum.FIXED, TaxMethodsEnum.PERCENTAGE] as const)
              })
            )
          })
        ),
        resource_id: schema.number.optional([rules.unsigned()])
      })
    )
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    date: 'The {{field}} must be a date',
    boolean: 'The {{field}} must be a boolean'
  };
}
