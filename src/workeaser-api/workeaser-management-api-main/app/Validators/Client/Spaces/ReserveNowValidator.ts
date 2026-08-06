import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { ContractPaymentStyleEnum, ContractTermEnum, ServicesEnum } from 'Contracts/enums';

export default class ReserveNowValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    service_type: schema.enum([
      ServicesEnum.VIRTUAL_OFFICE,
      ServicesEnum.OPEN_DESK,
      ServicesEnum.PRIVATE_ROOM
    ] as const),
    location_id: schema.number(),
    resource_id: schema.number(),
    term_size: schema.enum([
      ContractTermEnum.MONTH_1,
      ContractTermEnum.MONTH_3,
      ContractTermEnum.MONTH_6,
      ContractTermEnum.YEAR_1,
      ContractTermEnum.YEAR_2,
      ContractTermEnum.YEAR_3
    ] as const),
    auto_renewal: schema.boolean(),
    payment_recurring_style: schema.enum([
      ContractPaymentStyleEnum.MONTHLY,
      ContractPaymentStyleEnum.TOTAL
    ] as const)
  });

  public messages = {};
}
