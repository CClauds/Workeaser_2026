import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
export default class UpdateMeValidator {
  public schema;

  constructor(protected ctx: HttpContextContract) {
    this.schema = schema.create({
      first_name: schema.string({ trim: true }, [rules.minLength(2)]),
      last_name: schema.string({ trim: true }, [rules.minLength(2)]),
      //email: schema.string({}, [
      //  rules.email(),
      // rules.unique({
      //   table: 'users',
      //   column: 'email',
      //   where: { deleted_at: null },
      //   whereNot: { id: ctx.auth.user?.id },
      //  }),
      //]),
      photo_id: schema.number.optional([rules.exists({ table: 'photos', column: 'id' })]),
      personal_address: schema.object.optional().members({
        fulltext: schema.string.optional({ trim: true }),
        latitude: schema.number.optional(),
        longitude: schema.number.optional(),
        country: schema.string.optional({ trim: true }),
        city: schema.string.optional({ trim: true }),
        state: schema.string.optional({ trim: true })
      }),
      personal_phone: schema.string({}, [rules.maxLength(14), rules.minLength(10)]),
      cowork: schema.object.optional().members({
        name: schema.string({ trim: true }),
        email: schema.string.optional({}, [rules.email()]),
        phone: schema.string.optional({}, [rules.maxLength(14), rules.minLength(10)]),
        photo_id: schema.number.optional([rules.exists({ table: 'photos', column: 'id' })])
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
  }

  public messages = {
    'minLength': 'The {{ field }} must be at least {{ options.minLength }} characters',
    'maxLength': 'The {{ field }} must have at most {{ options.maxLength }} characters',
    'required': 'The {{ field }} is required',

    'email.email': 'The email is not valid',
    'email.unique': 'User with email address already exists',
    'cowork.email.email': 'The email is not valid',
    'cowork.email.unique': 'Company with email address already exists'
  };
}
