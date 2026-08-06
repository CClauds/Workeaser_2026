import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DayPassPaymentMethodEnum, ServicesEnum } from 'Contracts/enums';

export default class StoreDayPassRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    payment_method: schema.enum([
      DayPassPaymentMethodEnum.BENEFIT,
      DayPassPaymentMethodEnum.CAPTURE,
      DayPassPaymentMethodEnum.PAY_SPACE,
      DayPassPaymentMethodEnum.WORKEASER_CREDIT
    ] as const),
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    date: schema.date({ format: 'yyyy-MM-dd' }),
    space: schema.enum([ServicesEnum.OPEN_DESK, ServicesEnum.PRIVATE_ROOM] as const),
    resource_id: schema.number([rules.unsigned()])
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    date: 'The {{ field }} must be a date',
    afterField: 'The {{ field }} must be greater than date_start'
  };
}
