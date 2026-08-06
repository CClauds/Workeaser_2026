import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import {
  MeetingDiscountTypesEnum,
  MeetingPaymentMethodEnum,
  RecurringTypeTaxEnum,
  TaxMethodsEnum,
  TaxTypesEnum
} from 'Contracts/enums';

export default class BookMeetingValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    client_uuid: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'uuid' })]),
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    meetroom_id: schema.number([rules.exists({ table: 'meetrooms', column: 'id' })]),
    discount_type: schema.enum([
      MeetingDiscountTypesEnum.FIXED,
      MeetingDiscountTypesEnum.NONE,
      MeetingDiscountTypesEnum.PERCENTAGE
    ] as const),
    discount_value: schema.number.optional([
      rules.unsigned(),
      rules.requiredWhen('discount_type', '!=', MeetingDiscountTypesEnum.NONE)
    ]),
    additional_information: schema.string.optional({ trim: true }),
    date_start: schema.date({ format: 'sql' }),
    date_end: schema.date({ format: 'sql' }, [rules.afterField('date_start')]),
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
        recurring_type: schema.enum([
          RecurringTypeTaxEnum.CREATED,
          RecurringTypeTaxEnum.OVERDUE
        ] as const),
        method: schema.enum([TaxMethodsEnum.FIXED, TaxMethodsEnum.PERCENTAGE] as const)
      })
    ),
    payment_method: schema.enum([
      MeetingPaymentMethodEnum.BENEFIT,
      MeetingPaymentMethodEnum.BILLING,
      MeetingPaymentMethodEnum.CAPTURE,
      MeetingPaymentMethodEnum.COURTESY,
      MeetingPaymentMethodEnum.PAY_SPACE
    ] as const)
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    date: 'The {{field}} must be a date'
  };
}
