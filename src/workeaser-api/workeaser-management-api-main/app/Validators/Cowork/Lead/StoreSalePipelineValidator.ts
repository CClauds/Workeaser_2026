import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StoreSalePipelineValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    lead_id: schema.number(),
    service: schema.string({ trim: true })
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
