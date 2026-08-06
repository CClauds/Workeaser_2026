import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ListClientsValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    page: schema.number.optional([rules.unsigned()]),
    per_page: schema.number.optional([rules.unsigned(), rules.range(1, 100)]),
    search: schema.string.optional({ trim: true }, [rules.maxLength(120)]),
    type: schema.enum.optional(['COWORKING', 'CLIENT'] as const),
    sort: schema.enum.optional(['name', 'createdAt', 'email'] as const),
    order: schema.enum.optional(['asc', 'desc'] as const),
  })
}
