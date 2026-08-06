import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class AddNoteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    note: schema.string({ trim: true })
  });

  public messages = {};
}
