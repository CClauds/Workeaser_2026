import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { LeadStatusEnum } from 'Contracts/enums';

export default class UpdateSalePipelineValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum.optional([
      LeadStatusEnum.OPPORTUNITY,
      LeadStatusEnum.CONTACTED,
      LeadStatusEnum.QUOTED,
      LeadStatusEnum.CONVERTED,
      LeadStatusEnum.REQUESTED
    ] as const),
    notes: schema.string.optional()
  });

  public messages = {
    required: 'The {{ field }} is required'
  };
}
