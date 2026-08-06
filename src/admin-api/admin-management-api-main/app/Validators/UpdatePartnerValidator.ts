import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PartnerRoleEnum } from 'Contracts/enums'

export default class UpdatePartnerValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    partnerId: this.ctx.params.id,
  })

  public schema = schema.create({
    first_name: schema.string.optional({ trim: true }, [rules.minLength(2), rules.maxLength(120)]),
    last_name: schema.string.optional({ trim: true }, [rules.minLength(2), rules.maxLength(120)]),
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      rules.unique({
        table: 'partners',
        column: 'email',
        whereNot: { id: this.refs.partnerId },
      }),
    ]),
    password: schema.string.optional({}, [rules.minLength(8), rules.maxLength(256)]),
    role: schema.enum.optional([
      PartnerRoleEnum.SYSTEM_DIRECTOR,
      PartnerRoleEnum.SYSTEM_MANAGER,
    ] as const),
    profile_image_url: schema.string.optional({ trim: true }, [rules.url()]),
  })

  public messages = {
    'email.email': 'Please provide a valid email',
    'email.unique': 'A partner with this email already exists',
    'password.minLength': 'Password must be at least 8 characters',
  }
}
