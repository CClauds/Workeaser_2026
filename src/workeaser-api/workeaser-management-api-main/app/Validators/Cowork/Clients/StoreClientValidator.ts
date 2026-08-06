import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';

export default class StoreClientValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    first_name: schema.string({ trim: true }, [rules.minLength(2)]),
    middle_name: schema.string.optional({ trim: true }, [rules.minLength(1)]),
    last_name: schema.string({ trim: true }, [rules.minLength(2)]),
    email: schema.string({}, [rules.email()]),
    personal_phone: schema.string.optional({}, [rules.maxLength(15), rules.minLength(10)]),
    phone: schema.string.optional({}, [rules.maxLength(15), rules.minLength(10)]),
    photo_id: schema.number.optional([rules.exists({ table: 'photos', column: 'id' })]),
    personal_address: schema.object.optional().members({
      fulltext: schema.string.optional({ trim: true }),
      fulltext2: schema.string.optional({ trim: true }),
      latitude: schema.number.optional(),
      longitude: schema.number.optional(),
      country: schema.string.optional({ trim: true }),
      state: schema.string.optional(),
      city: schema.string.optional(),   
      zipcode: schema.number.optional()
    }),
    client: schema.object.optional().members({
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
    'email.unique': 'User with email address already exists'
  };
}
