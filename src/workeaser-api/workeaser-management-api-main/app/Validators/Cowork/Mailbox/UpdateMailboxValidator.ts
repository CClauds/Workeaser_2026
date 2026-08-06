import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { MailboxCoworkingEnum } from 'Contracts/enums';

export default class UpdateMailboxValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum([
      MailboxCoworkingEnum.HOLDING,
      MailboxCoworkingEnum.COLLECTED,
      MailboxCoworkingEnum.TRASHED,
      MailboxCoworkingEnum.FORWARDED
    ] as const)
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
