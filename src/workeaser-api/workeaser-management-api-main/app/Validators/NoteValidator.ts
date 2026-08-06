import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class NoteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    chat_id: schema.number(),
    note: schema.string()
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
