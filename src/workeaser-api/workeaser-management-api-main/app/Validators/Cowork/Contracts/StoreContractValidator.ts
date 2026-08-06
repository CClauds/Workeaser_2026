import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import { ContractPaymentStyleEnum, ContractTermEnum, ServicesEnum } from 'Contracts/enums';

export default class StoreContractValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    client_uuid: schema.string.optional({ trim: true }, [
      rules.requiredIfNotExists('client'),
      rules.exists({ table: 'users', column: 'uuid' })
    ]),
    client: schema.object.optional([rules.requiredIfNotExists('client_uuid')]).members({
      first_name: schema.string({ trim: true }, [rules.minLength(2)]),
      middle_name: schema.string({ trim: true }, [rules.minLength(2)]),
      last_name: schema.string({ trim: true }, [rules.minLength(2)]),
      email: schema.string({}, [rules.email()]),
      personal_phone: schema.string({}, [rules.maxLength(14), rules.minLength(10)]),
      phone: schema.string({}, [rules.maxLength(14), rules.minLength(10)]),
      personal_address: schema.object.optional().members({
        fulltext: schema.string.optional({ trim: true }),
        latitude: schema.number.optional(),
        longitude: schema.number.optional(),
        country: schema.string.optional({ trim: true })
      }),
      company_name: schema.string({ trim: true })
    }),
    location_id: schema.number([rules.exists({ table: 'locations', column: 'id' })]),
    documents: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned(), rules.exists({ table: 'documents', column: 'id' })])
      })
    ),
    service_type: schema.enum([
      ServicesEnum.OPEN_DESK,
      ServicesEnum.PRIVATE_ROOM,
      ServicesEnum.VIRTUAL_OFFICE
    ] as const),
    resource_id: schema.number([rules.unsigned()]),
    term_size: schema.enum([
      ContractTermEnum.MONTH_1,
      ContractTermEnum.MONTH_3,
      ContractTermEnum.MONTH_6,
      ContractTermEnum.YEAR_1,
      ContractTermEnum.YEAR_2,
      ContractTermEnum.YEAR_3
    ] as const),
    auto_renewal: schema.boolean(),
    due_date: schema.date({ format: 'yyyy-MM-dd' }),
    amount: schema.number([rules.unsigned()]),
    payment_recurring_style: schema.enum([
      ContractPaymentStyleEnum.MONTHLY,
      ContractPaymentStyleEnum.TOTAL
    ] as const),
    cowork_usage_per_month: schema.number([rules.unsigned()]),
    meeting_room_per_month: schema.number([rules.unsigned()]),
    contract_document_id: schema.number([
      rules.unsigned(),
      rules.exists({ table: 'documents', column: 'id' })
    ]),
    additional_notes: schema.string.optional({ trim: true }),
    request_sign: schema.boolean(),
    service_started_date: schema.date({ format: 'yyyy-MM-dd' })
  });

  public messages = {
    required: 'The {{ field }} is required',
    exists: 'The {{ field }} is invalid',
    afterField: 'The {{ field }} must be greater than date_start',
    requiredWhen: 'The {{ field }} must be sent',
    range: 'The value of {{ field }} is invalid'
  };
}
