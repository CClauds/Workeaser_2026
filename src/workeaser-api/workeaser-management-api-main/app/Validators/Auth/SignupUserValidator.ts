import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { UserRoleEnum } from 'Contracts/enums';

export default class SignupUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    first_name: schema.string({ trim: true }, [rules.minLength(2)]),
    last_name: schema.string({ trim: true }, [rules.minLength(2)]),
    password: schema.string({}, [rules.minLength(8), rules.confirmed()]),
    email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
    role: schema.enum([UserRoleEnum.CLIENT, UserRoleEnum.COWORKING] as const),
    photo_id: schema.number.optional([rules.exists({ table: 'photos', column: 'id' })]),
    personal_address: schema.object.optional().members({
      fulltext: schema.string.optional({ trim: true }),
      latitude: schema.number.optional(),
      longitude: schema.number.optional(),
      city: schema.string.optional(),
      state: schema.string.optional(),
      country: schema.string.optional({ trim: true })
    }),
    personal_phone: schema.string({}, [rules.maxLength(14), rules.minLength(10)]),
    cowork: schema.object
      .optional([rules.requiredWhen('role', '=', UserRoleEnum.COWORKING)])
      .members({
        name: schema.string({ trim: true }),
        email: schema.string.optional({}, [
          rules.email(),
          rules.unique({ table: 'cowork_accounts', column: 'email' })
        ]),
        phone: schema.string.optional({}, [rules.maxLength(14), rules.minLength(10)]),
        photo_id: schema.number.optional([rules.exists({ table: 'photos', column: 'id' })])
      }),
    client: schema.object.optional([rules.requiredWhen('role', '=', UserRoleEnum.CLIENT)]).members({
      company_name: schema.string.optional({ trim: true }),
      company_email: schema.string.optional({}, [rules.email()]),
      company_phone: schema.string.optional({}, [rules.maxLength(14), rules.minLength(10)]),
      company_address: schema.object.optional().members({
        fulltext: schema.string.optional({ trim: true }),
        latitude: schema.number.optional(),
        longitude: schema.number.optional(),
        country: schema.string.optional({ trim: true })
      }),
      company_photo_id: schema.number.optional([rules.exists({ table: 'photos', column: 'id' })])
    })
  });

  public messages = {
    'minLength': 'The {{ field }} must be at least {{ options.minLength }} characters',
    'maxLength': 'The {{ field }} must have at most {{ options.maxLength }} characters',
    'required': 'The {{ field }} is required',
    'exists': 'The {{ field }} is invalid',
    'number': 'The {{ field }} must be a number',
    'string': 'The {{ string }} must be a string',

    'password_confirmation.confirmed': 'The passwords are different',
    'email.email': 'The email is not valid',
    'email.unique': 'User with email address already exists',
    'cowork.requiredWhen': 'The cowork object must be sent when the user is a coworking',
    'cowork.email.email': 'The email is not valid',
    'cowork.email.unique': 'Company with email address already exists',
    'client.requiredWhen': 'The client object must be sent when the user is a client'
  };
}
