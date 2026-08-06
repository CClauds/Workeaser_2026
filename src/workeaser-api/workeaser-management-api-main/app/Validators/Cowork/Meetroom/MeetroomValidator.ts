import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
  MeasurementTypeEnum,
  MeetroomMinimumRentalEnum,
  MeetroomRentalTimeframeEnum,
  MeetroomTypesEnum
} from 'Contracts/enums';

export default class MeetroomValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    description: schema.string.optional({ trim: true }),
    type: schema.enum([
      MeetroomTypesEnum.AUDITORIUM,
      MeetroomTypesEnum.CALL,
      MeetroomTypesEnum.CONFERENCE,
      MeetroomTypesEnum.DESK,
      MeetroomTypesEnum.MEETING,
      MeetroomTypesEnum.PRIVATE
    ] as const),
    measure_unit: schema.enum.optional(
      [MeasurementTypeEnum.FEETS, MeasurementTypeEnum.METERS],
      [rules.requiredWhen('type', '!=', MeetroomTypesEnum.DESK)]
    ),
    measure_size: schema.number.optional([
      rules.unsigned(),
      rules.requiredWhen('type', '!=', MeetroomTypesEnum.DESK)
    ]),
    measure_occupancy: schema.number([rules.unsigned()]),
    rental_timeframe: schema.enum([
      MeetroomRentalTimeframeEnum.MINUTES_15,
      MeetroomRentalTimeframeEnum.MINUTES_30,
      MeetroomRentalTimeframeEnum.HOURS_1
    ] as const),
    minimum_rental: schema.enum([
      MeetroomMinimumRentalEnum.MINUTES_30,
      MeetroomMinimumRentalEnum.HOURS_1,
      MeetroomMinimumRentalEnum.HOURS_2,
      MeetroomMinimumRentalEnum.HOURS_3,
      MeetroomMinimumRentalEnum.DAYS_1
    ] as const),
    price: schema.number([rules.unsigned()]),
    cancelation_full: schema.number([rules.unsigned()]),
    cancelation_half: schema.number([rules.unsigned()]),
    cancelation_no: schema.number([rules.unsigned()]),
    discount_three: schema.number([rules.unsigned()]),
    discount_half: schema.number([rules.unsigned()]),
    discount_full: schema.number([rules.unsigned()]),
    searchable: schema.boolean(),

    location_id: schema.number([
      rules.unsigned(),
      rules.exists({ table: 'locations', column: 'id' })
    ]),

    photos: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'photos', column: 'id' })])
      })
    ),

    space_rules: schema.array().members(
      schema.object().members({
        meetroom_question_id: schema.number([
          rules.unsigned(),
          rules.exists({ table: 'meetroom_questions', column: 'id' })
        ]),
        answer: schema.boolean()
      })
    )
  });

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {};
}
