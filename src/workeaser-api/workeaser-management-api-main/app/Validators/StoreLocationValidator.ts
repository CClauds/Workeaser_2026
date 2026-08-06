import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StoreLocationValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(3)]),
    description: schema.string({ trim: true }, [rules.minLength(2)]),
    phone: schema.string({ trim: true }, [rules.maxLength(14), rules.minLength(10)]),
    email: schema.string({ trim: true }, [rules.email()]),
    address: schema.object().members({
      fulltext: schema.string({ trim: true }),
      latitude: schema.number(),
      longitude: schema.number(),
      city: schema.string(),
      state: schema.string(),
      country: schema.string.optional({ trim: true })
    }),
    amenities: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'amenities', column: 'id' })])
      })
    ),
    photos: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'photos', column: 'id' })])
      })
    ),
    services: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'services', column: 'id' })])
      })
    )
  });

  public messages = {
    'minLength': 'The {{ field }} must be at least {{ options.minLength }} characters',
    'name.required': 'The name is required',
    'description.required': 'The description is required',
    'address.required': 'The address is required',
    'address.fulltext.required': 'The address is required',
    'address.latitude.required': 'The latitude is required',
    'address.latitude.number': 'The latitude must be a number',
    'address.longitude.required': 'The longitude is required',
    'address.longitude.number': 'The longitude must be a number'
  };
}
