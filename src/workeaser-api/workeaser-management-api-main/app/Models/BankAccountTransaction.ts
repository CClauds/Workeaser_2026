import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import LinkedBankAccount from 'App/Models/LinkedBankAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import {
  TransactionExpensesCategories,
  TransactionIncomeCategories,
  TransactionStatus
} from 'Contracts/enums';

export default class BankAccountTransaction extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public linkedBankAccountId: number;

  @belongsTo(() => LinkedBankAccount)
  public linkedBankAccount: BelongsTo<typeof LinkedBankAccount>;

  @column()
  public transactionId: string;

  @column.dateTime()
  public date?: DateTime | null;

  @column()
  public description: string;

  @column()
  public customer?: string | null;

  @column()
  public categoryPlaid?: string | null;

  @column()
  public category: string;

  @column()
  public spent: number;

  @column()
  public received: number;

  @column()
  public status: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public static getStatusFormatted(status: string) {
    switch (status) {
      case TransactionStatus.RECORDED:
        return 'Recorded';
      case TransactionStatus.VOIDED:
        return 'Voided';
      case TransactionStatus.NEW:
        return 'New';
      default:
        return '';
    }
  }

  public static getCategoryFormatted(status: string) {
    switch (status) {
      case TransactionExpensesCategories.ADVERTISING:
        return 'Advertising & Marketing';
      case TransactionExpensesCategories.BANK:
        return 'Bank Charges & Fees';
      case TransactionExpensesCategories.CAR:
        return 'Car & Gas Station';
      case TransactionExpensesCategories.CONTRACTORS:
        return 'Contractors';
      case TransactionExpensesCategories.INSURANCE:
        return 'Insurance';
      case TransactionExpensesCategories.LEGAL:
        return 'Legal & Professional Services';
      case TransactionExpensesCategories.MEALS:
        return 'Meals & Entertainment';
      case TransactionExpensesCategories.OFFICE:
        return 'Office Supplies & Software';
      case TransactionExpensesCategories.OTHER:
        return 'Other Business Expenses';
      case TransactionExpensesCategories.RENT:
        return 'Rent & Lease';
      case TransactionExpensesCategories.REPAIRS:
        return 'Repairs & Maintenance';
      case TransactionExpensesCategories.SCHOOL:
        return 'School and Courses';
      case TransactionExpensesCategories.TAXES:
        return 'Taxes & Licenses';
      case TransactionExpensesCategories.TRAVEL:
        return 'Travel';
      case TransactionExpensesCategories.UNCATEGORIZED:
        return 'Uncategorized Expense';
      case TransactionExpensesCategories.UTILITIES:
        return 'Utilities';
      case TransactionIncomeCategories.VIRTUAL_OFFICE:
        return 'Virtual Offce';
      case TransactionIncomeCategories.MEETING_ROOM:
        return 'Meeting Room';
      case TransactionIncomeCategories.SHARED_PRIVATE_DESK:
        return 'Shared & Private Desk';
      case TransactionIncomeCategories.SHARED_PRIVATE_ROOM:
        return 'Shared & Private Room';
      case TransactionIncomeCategories.OTHERS:
        return 'Others';
      default:
        return '';
    }
  }
}
