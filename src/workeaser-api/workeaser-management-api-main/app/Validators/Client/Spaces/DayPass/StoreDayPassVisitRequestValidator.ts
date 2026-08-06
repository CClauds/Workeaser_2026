import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { ServicesEnum } from 'Contracts/enums';

export default class StoreDayPassVisitRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    resource_id: schema.number([rules.unsigned()]),
    date: schema.date({ format: 'yyyy-MM-dd' }),
    space: schema.enum([ServicesEnum.OPEN_DESK, ServicesEnum.PRIVATE_ROOM] as const)
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    date: 'The {{ field }} must be a date',
    afterField: 'The {{ field }} must be greater than date_start'
  };
}
