import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { LeadStatusEnum } from 'Contracts/enums';

export default class UpdateSalePipelineStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum([
      LeadStatusEnum.OPPORTUNITY,
      LeadStatusEnum.CONTACTED,
      LeadStatusEnum.QUOTED,
      LeadStatusEnum.CONVERTED,
      LeadStatusEnum.REQUESTED
    ] as const)
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
