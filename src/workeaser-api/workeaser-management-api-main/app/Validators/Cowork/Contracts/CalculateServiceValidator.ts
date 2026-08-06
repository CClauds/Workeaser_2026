import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { ContractPaymentStyleEnum, ContractTermEnum, ServicesEnum } from 'Contracts/enums';

export default class CalculateServiceValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    id: schema.number([rules.unsigned()]),
    service_type: schema.enum([
      ServicesEnum.OPEN_DESK,
      ServicesEnum.PRIVATE_ROOM,
      ServicesEnum.VIRTUAL_OFFICE
    ] as const),
    term_size: schema.enum([
      ContractTermEnum.MONTH_1,
      ContractTermEnum.MONTH_3,
      ContractTermEnum.MONTH_6,
      ContractTermEnum.YEAR_1,
      ContractTermEnum.YEAR_2,
      ContractTermEnum.YEAR_3
    ] as const),
    payment_recurring_style: schema.enum([
      ContractPaymentStyleEnum.MONTHLY,
      ContractPaymentStyleEnum.TOTAL
    ] as const)
  });
  public messages = {};
}
