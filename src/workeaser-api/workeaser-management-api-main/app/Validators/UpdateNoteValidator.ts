import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class UpdateNoteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    note: schema.string()
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
