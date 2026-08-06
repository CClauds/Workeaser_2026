import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StoreTourRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    services: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'services', column: 'id' })])
      })
    ),
    date_start: schema.date({
      format: 'sql'
    }),
    date_end: schema.date(
      {
        format: 'sql'
      },
      [rules.afterField('date_start')]
    )
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    date: 'The {{ field }} must be a date',
    afterField: 'The {{ field }} must be greater than date_start'
  };
}
