import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DayPassPaymentMethodEnum, DayPassUserTypeEnum, ServicesEnum } from 'Contracts/enums';

export default class StoreDayPassValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    user_type: schema.enum([DayPassUserTypeEnum.CLIENT] as const),
    client_uuid: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'uuid' })]),
    payment_method: schema.enum.optional(
      [
        DayPassPaymentMethodEnum.BENEFIT,
        DayPassPaymentMethodEnum.CAPTURE,
        DayPassPaymentMethodEnum.COURTESY,
        DayPassPaymentMethodEnum.PAY_SPACE
      ] as const,
      [rules.requiredWhen('user_type', '=', DayPassUserTypeEnum.CLIENT)]
    ),
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    date: schema.date({ format: 'yyyy-MM-dd' }),
    space: schema.enum([ServicesEnum.OPEN_DESK, ServicesEnum.PRIVATE_ROOM] as const),
    resource_id: schema.number()
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    date: 'The {{ field }} must be a date',
    afterField: 'The {{ field }} must be greater than date_start'
  };
}
