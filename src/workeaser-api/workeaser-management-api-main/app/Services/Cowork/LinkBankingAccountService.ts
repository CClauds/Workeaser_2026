import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import Database from '@ioc:Adonis/Lucid/Database';
import LinkedBankAccount from 'App/Models/LinkedBankAccount';
import BankReconciliation from '@ioc:Workeaser/Integrations/BankReconciliation';
import { IntegrationServiceEnum, TransactionStatus } from 'Contracts/enums';
import { DateTime } from 'luxon';
import BankAccountTransaction from 'App/Models/BankAccountTransaction';

interface BankingAccount {
  id: number;
  banking_name: string;
  nickname: string;
  last_digits: string;
  is_main_account: boolean;
}

interface CreateBankingAccountRequest {
  token: string;
  nickname: string;
  account_id: string;
  is_main_account: boolean;
}

interface BankingTransaction {
  transactionId: string;
  date?: DateTime | null;
  customer?: string | null;
  categoryPlaid?: string | null;
  received?: number;
  spent?: number;
  status?: string;
}

interface ListTransactionFilters {
  date_start?: DateTime;
  date_end?: DateTime;
  status?: string;
}

interface AddNoteTransaction {
  note: string;
}

interface ChangeCategoryTransaction {
  category: string;
}

export default class LinkBankingAccountService {
  static async bankingAccounts(coworkAccountId: number) {
    const result: BankingAccount[] = [];

    const accounts: LinkedBankAccount[] = await LinkedBankAccount.query().where(
      'cowork_account_id',
      coworkAccountId
    );

    accounts.forEach((account) => {
      result.push({
        id: account.id,
        nickname: account.nickname,
        banking_name: account.bankName,
        last_digits: account.lastDigits,
        is_main_account: account.isMainAccount
      });
    });

    return result;
  }

  static async generateTokenLink(user: User) {
    return await BankReconciliation.createLinkToken({
      userId: String(user.id),
      userName: user.fullName,
      userEmail: user.email
    });
  }

  static async storeBanking(user: User, data: CreateBankingAccountRequest) {
    await user.load('coworkUser');
    const accessToken = await BankReconciliation.exchangePublicTokenToAccessToken(data.token);

    const info = await BankReconciliation.getAccountInfo(accessToken.accessToken);
    const account = info.accounts.filter((a) => a.account_id === data.account_id)[0];
    const checkIfExist = await LinkedBankAccount.findBy('gateway_id', account.account_id);

    if (!account) {
      throw new AppError(AppError.BAD_REQUEST, 'Plaid Account not found');
    }

    if (checkIfExist) {
      throw new AppError(AppError.BAD_REQUEST, 'Bank account has already been linked');
    }

    if (!info.item.institution_id) {
      throw new AppError(AppError.BAD_REQUEST, 'Plaid integrationfailed. Try Again');
    }

    const bank = await BankReconciliation.getBankInfo(info.item.institution_id);
    const trx = await Database.transaction();

    try {
      if (data.is_main_account) {
        await LinkedBankAccount.query({ client: trx })
          .where('cowork_account_id', user.coworkUser.coworkAccountId)
          .update('is_main_account', false);
      }

      const countAccounts = await LinkedBankAccount.query({ client: trx })
        .count('*', 'total')
        .where('cowork_account_id', user.coworkUser.coworkAccountId);

      if (!countAccounts[0].$extras.total) {
        data.is_main_account = true;
      }

      const newAccount = await LinkedBankAccount.create(
        {
          coworkAccountId: user.coworkUser.coworkAccountId,
          gatewayId: accessToken.accessToken,
          integrationService: IntegrationServiceEnum.PLAID,
          nickname: data.nickname,
          bankName: bank.institution.name,
          lastDigits: account.mask || '',
          isMainAccount: data.is_main_account
        },
        { client: trx }
      );

      await trx.commit();
      return newAccount;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async deleteBankingAccount(user: User, bankingAccountId: number) {
    await user.load('coworkUser');

    const bankAccount = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!bankAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Banking Account not found');
    }

    await bankAccount.softDelete();
  }

  static async listTransactions(
    user: User,
    bankingAccountId: number,
    filters: ListTransactionFilters,
    page = 1
  ) {
    await user.load('coworkUser');

    const linkedBank = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!linkedBank) {
      throw new AppError(AppError.NOT_FOUND, 'Bank Account not found');
    }

    const query = BankAccountTransaction.query().where('linked_bank_account_id', bankingAccountId);

    if (filters.status) {
      query.where('status', filters.status);
    }

    if (filters.date_start && filters.date_end) {
      query.whereRaw('DATE(date) BETWEEN ? AND ?', [filters.date_start, filters.date_end]);
    } else if (filters.date_start) {
      query.whereRaw('DATE(date) = ?', [filters.date_start]);
    } else if (filters.date_end) {
      query.whereRaw('DATE(date) = ?', [filters.date_end]);
    }

    return await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
  }

  static async showTransaction(user: User, bankingAccountId: number, bankTransactionId: number) {
    await user.load('coworkUser');

    const linkedBank = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!linkedBank) {
      throw new AppError(AppError.NOT_FOUND, 'Bank Account not found');
    }

    const transaction: BankAccountTransaction = await BankAccountTransaction.query()
      .where('linked_bank_account_id', bankingAccountId)
      .where('id', bankTransactionId)
      .first();

    if (!transaction) {
      throw new AppError(AppError.NOT_FOUND, 'Transaction not found');
    }

    return transaction;
  }

  static async recordTransaction(user: User, bankingAccountId: number, bankTransactionId: number) {
    await user.load('coworkUser');

    const linkedBank = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!linkedBank) {
      throw new AppError(AppError.NOT_FOUND, 'Bank Account not found');
    }

    const transaction: BankAccountTransaction = await BankAccountTransaction.query()
      .where('linked_bank_account_id', bankingAccountId)
      .where('id', bankTransactionId)
      .first();

    if (!transaction) {
      throw new AppError(AppError.NOT_FOUND, 'Transaction not found');
    }

    transaction.status = TransactionStatus.RECORDED;
    await transaction.save();

    return transaction;
  }

  static async voidTransaction(user: User, bankingAccountId: number, bankTransactionId: number) {
    await user.load('coworkUser');

    const linkedBank = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!linkedBank) {
      throw new AppError(AppError.NOT_FOUND, 'Bank Account not found');
    }

    const transaction: BankAccountTransaction = await BankAccountTransaction.query()
      .where('linked_bank_account_id', bankingAccountId)
      .where('id', bankTransactionId)
      .first();

    if (!transaction) {
      throw new AppError(AppError.NOT_FOUND, 'Transaction not found');
    }

    transaction.status = TransactionStatus.VOIDED;
    await transaction.save();

    return transaction;
  }

  static async addNote(
    user: User,
    data: AddNoteTransaction,
    bankingAccountId: number,
    bankTransactionId: number
  ) {
    await user.load('coworkUser');

    const linkedBank = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!linkedBank) {
      throw new AppError(AppError.NOT_FOUND, 'Bank Account not found');
    }

    const transaction: BankAccountTransaction = await BankAccountTransaction.query()
      .where('linked_bank_account_id', bankingAccountId)
      .where('id', bankTransactionId)
      .first();

    if (!transaction) {
      throw new AppError(AppError.NOT_FOUND, 'Transaction not found');
    }

    transaction.description = data.note;
    await transaction.save();

    return transaction;
  }

  static async changeCategory(
    user: User,
    data: ChangeCategoryTransaction,
    bankingAccountId: number,
    bankTransactionId: number
  ) {
    await user.load('coworkUser');

    const linkedBank = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!linkedBank) {
      throw new AppError(AppError.NOT_FOUND, 'Bank Account not found');
    }

    const transaction: BankAccountTransaction = await BankAccountTransaction.query()
      .where('linked_bank_account_id', bankingAccountId)
      .where('id', bankTransactionId)
      .first();

    if (!transaction) {
      throw new AppError(AppError.NOT_FOUND, 'Transaction not found');
    }

    transaction.category = data.category;
    await transaction.save();

    return transaction;
  }

  static async syncTransactions(user: User, bankingAccountId: number) {
    await user.load('coworkUser');

    const bankAccount: LinkedBankAccount = await LinkedBankAccount.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('id', bankingAccountId)
      .first();

    if (!bankAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Banking Account not found');
    }

    const transactions = await BankReconciliation.syncTransactions(
      bankAccount.gatewayId,
      bankAccount.nextCursor
    );

    const newTransactions: BankingTransaction[] = [];
    const updateTransactions: BankingTransaction[] = [];
    const deleteTransactions: string[] = [];
    const trx = await Database.transaction();

    try {
      // Create transactions
      transactions.added.forEach((t) => {
        let spent;
        let received;

        if (t.amount < 0) {
          received = Math.abs(t.amount) * 100;
        } else {
          spent = t.amount * 100;
        }

        newTransactions.push({
          transactionId: t.transaction_id,
          date: t.authorized_datetime ? DateTime.fromISO(t.authorized_datetime) : null,
          customer: t.merchant_name,
          categoryPlaid: t.category?.pop(),
          received: received,
          spent: spent,
          status: TransactionStatus.NEW
        });
      });

      // Update transactions
      transactions.modified.forEach((t) => {
        let spent;
        let received;

        if (t.amount < 0) {
          received = Math.abs(t.amount) * 100;
        } else {
          spent = t.amount * 100;
        }

        updateTransactions.push({
          transactionId: t.transaction_id,
          date: t.datetime ? DateTime.fromISO(t.datetime) : null,
          customer: t.merchant_name,
          categoryPlaid: t.category?.pop(),
          received: received,
          spent: spent
        });
      });

      // Remove transactions
      transactions.removed.forEach((t) => {
        if (t.transaction_id) {
          deleteTransactions.push(t.transaction_id);
        }
      });

      await bankAccount.useTransaction(trx).related('transactions').createMany(newTransactions);

      for (const update of updateTransactions) {
        await BankAccountTransaction.query({ client: trx })
          .where('transaction_id', update.transactionId)
          .update(update);
      }

      for (const remove of deleteTransactions) {
        await BankAccountTransaction.query({ client: trx })
          .where('transaction_id', remove)
          .softDelete();
      }

      bankAccount.nextCursor = transactions.nextCursor;
      await bankAccount.useTransaction(trx).save();

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }
}
