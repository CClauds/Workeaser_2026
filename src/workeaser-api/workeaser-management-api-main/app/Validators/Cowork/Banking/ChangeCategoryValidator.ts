import { schema } from '@ioc:Adonis/Core/Validator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { TransactionExpensesCategories, TransactionIncomeCategories } from 'Contracts/enums';

export default class ChangeCategoryValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    category: schema.enum([
      TransactionExpensesCategories.ADVERTISING,
      TransactionExpensesCategories.BANK,
      TransactionExpensesCategories.CAR,
      TransactionExpensesCategories.CONTRACTORS,
      TransactionExpensesCategories.INSURANCE,
      TransactionExpensesCategories.LEGAL,
      TransactionExpensesCategories.MEALS,
      TransactionExpensesCategories.OFFICE,
      TransactionExpensesCategories.OTHER,
      TransactionExpensesCategories.RENT,
      TransactionExpensesCategories.REPAIRS,
      TransactionExpensesCategories.SCHOOL,
      TransactionExpensesCategories.TAXES,
      TransactionExpensesCategories.TRAVEL,
      TransactionExpensesCategories.UNCATEGORIZED,
      TransactionExpensesCategories.UTILITIES,
      TransactionIncomeCategories.MEETING_ROOM,
      TransactionIncomeCategories.OTHERS,
      TransactionIncomeCategories.SHARED_PRIVATE_DESK,
      TransactionIncomeCategories.SHARED_PRIVATE_ROOM,
      TransactionIncomeCategories.VIRTUAL_OFFICE
    ] as const)
  });

  public messages = {};
}
