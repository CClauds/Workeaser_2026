import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { MailboxClientEnum } from 'Contracts/enums';

export default class UpdateMailboxClientValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    requested_action: schema.enum([
      MailboxClientEnum.HOLD_LOCATION,
      MailboxClientEnum.PICK_UP,
      MailboxClientEnum.TRASH,
      MailboxClientEnum.FORWARD
    ] as const),
    forward_observation: schema.string.optional({ trim: true }, [
      rules.requiredWhen('status', '=', MailboxClientEnum.FORWARD)
    ])
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
