import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { MeetingPaymentMethodEnum } from 'Contracts/enums';

export default class StoreMeetingRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    meetroom_id: schema.number([rules.exists({ table: 'meetrooms', column: 'id' })]),
    additional_information: schema.string.optional({ trim: true }),
    date_start: schema.date({ format: 'sql' }),
    date_end: schema.date({ format: 'sql' }, [rules.afterField('date_start')]),
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
    date: 'The {{ field }} must be a date',
    afterField: 'The {{ field }} must be greater than date_start'
  };
}
