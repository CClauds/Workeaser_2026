import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class ChangeSearchAvailabilityValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    searchable: schema.boolean()
  });

  public messages = {};
}
