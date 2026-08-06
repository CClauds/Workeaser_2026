import Database from '@ioc:Adonis/Lucid/Database';
import Payments from '@ioc:Workeaser/Integrations/Payments';
import CoworkExternalAccount from 'App/Models/CoworkExternalAccount';
import CoworkStripeAccount from 'App/Models/CoworkStripeAccount';
import User from 'App/Models/User';
import CoworkService from 'App/Services/Cowork/CoworkService';
import AppError from 'App/Utils/AppError';
import { StripeExternalAccountTypes } from 'Contracts/enums';

enum StatusStripeAccount {
  VALIDATION_REQUIRED = 'VALIDATION_REQUIRED',
  VALID = 'VALID'
}

export default class StripeConnectService {
  static async createOrGetAccount(coworkAccountId: number) {
    let stripeAccount = await CoworkStripeAccount.query()
      .where('cowork_account_id', coworkAccountId)
      .first();

    if (stripeAccount) {
      return stripeAccount;
    }

    const coworkManager = await CoworkService.getCoworkManagers(coworkAccountId);

    if (!coworkManager[0]) {
      throw new AppError(AppError.UNAUTHORIZED, 'Cowork manager not found');
    }

    const accountId = await Payments.createAccount({
      country: 'US',
      email: coworkManager[0].email
    });

    stripeAccount = await CoworkStripeAccount.create({
      coworkAccountId: coworkAccountId,
      accountId: accountId,
      inReview: false,
      needUpdate: false,
      needExternalAccount: true,
      status: StatusStripeAccount.VALIDATION_REQUIRED
    });

    return stripeAccount;
  }

  static async getOnboardingUrl(user: User) {
    await user.load('coworkUser');

    const stripeAccount = await this.createOrGetAccount(user.coworkUser.coworkAccountId);
    const onboardingUrl = await Payments.getOnboardingUrl(stripeAccount.accountId);

    return onboardingUrl;
  }

  static async listExternalAccount(coworkAccountId: number) {
    const coworkStripeAccount = await CoworkStripeAccount.query()
      .where('cowork_account_id', coworkAccountId)
      .first();

    if (!coworkStripeAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Stripe account not found');
    }

    const externalAccount = await CoworkExternalAccount.query().where(
      'cowork_stripe_account_id',
      coworkStripeAccount.id
    );

    return externalAccount;
  }

  static async showExternalAccount(coworkAccountId: number, externalAccountId: number) {
    const coworkStripeAccount = await CoworkStripeAccount.query()
      .where('cowork_account_id', coworkAccountId)
      .first();

    if (!coworkStripeAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Stripe account not found');
    }

    const externalAccount = await CoworkExternalAccount.query()
      .where('cowork_stripe_account_id', coworkStripeAccount.id)
      .where('id', externalAccountId)
      .first();

    if (!externalAccount) {
      throw new AppError(AppError.NOT_FOUND, 'External Account not found');
    }

    return externalAccount;
  }

  static async createExternalAccount(
    coworkAccountId: number,
    token: string,
    defaultForCurrency?: boolean
  ) {
    const trx = await Database.transaction();

    try {
      const account = await this.createOrGetAccount(coworkAccountId);

      const searchExternalAccounts = await CoworkExternalAccount.query({ client: trx })
        .where('cowork_stripe_account_id', account.id)
        .where('default_for_currency', true)
        .first();

      if (!defaultForCurrency) {
        defaultForCurrency = undefined;
      }

      if (!searchExternalAccounts) {
        defaultForCurrency = true;
      }

      if (defaultForCurrency) {
        await CoworkExternalAccount.query({ client: trx })
          .where('cowork_stripe_account_id', account.id)
          .where('default_for_currency', true)
          .update({ defaultForCurrency: false });
      }

      const externalAccount = await Payments.createExternalAccount(
        account.accountId,
        token,
        defaultForCurrency
      );

      const coworkExternalAccount = new CoworkExternalAccount();
      coworkExternalAccount.coworkStripeAccountId = account.id;
      coworkExternalAccount.stripeId = externalAccount.id;

      if (defaultForCurrency) {
        coworkExternalAccount.defaultForCurrency = true;
      }

      switch (externalAccount.object) {
        case 'card':
          coworkExternalAccount.type = StripeExternalAccountTypes.CARD;
          coworkExternalAccount.brand = externalAccount.brand;
          coworkExternalAccount.country = externalAccount.country;
          coworkExternalAccount.expMonth = externalAccount.exp_month;
          coworkExternalAccount.expYear = externalAccount.exp_year;
          coworkExternalAccount.lastDigits = externalAccount.last4;
          break;
        case 'bank_account':
          coworkExternalAccount.type = StripeExternalAccountTypes.BANK_ACCOUNT;
          coworkExternalAccount.holderName = externalAccount.account_holder_name;
          coworkExternalAccount.holderType = externalAccount.account_holder_type;
          coworkExternalAccount.bankName = externalAccount.bank_name;
          coworkExternalAccount.country = externalAccount.country;
          coworkExternalAccount.lastDigits = externalAccount.last4;
          coworkExternalAccount.routingNumber = externalAccount.routing_number;
          break;
      }

      await coworkExternalAccount.useTransaction(trx).save();
      account.needExternalAccount = false;
      await account.useTransaction(trx).save();
      await trx.commit();

      return coworkExternalAccount;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async changeDefaultExternalAccount(coworkAccountId: number, externalAccountId: number) {
    const coworkStripeAccount = await CoworkStripeAccount.query()
      .where('cowork_account_id', coworkAccountId)
      .first();

    if (!coworkStripeAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Stripe account not found');
    }

    const externalAccount = await CoworkExternalAccount.query()
      .where('cowork_stripe_account_id', coworkStripeAccount.id)
      .where('id', externalAccountId)
      .first();

    if (!externalAccount) {
      throw new AppError(AppError.NOT_FOUND, 'External Account not found');
    }

    const trx = await Database.transaction();

    try {
      await Payments.changeDefaultExternalAccount(
        coworkStripeAccount.accountId,
        externalAccount.stripeId
      );

      await CoworkExternalAccount.query({ client: trx })
        .where('cowork_stripe_account_id', coworkStripeAccount.id)
        .where('default_for_currency', true)
        .update({ defaultForCurrency: false });

      externalAccount.defaultForCurrency = true;
      await externalAccount.useTransaction(trx).save();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async deleteExternalAccount(coworkAccountId: number, externalAccountId: number) {
    const coworkStripeAccount = await CoworkStripeAccount.query()
      .where('cowork_account_id', coworkAccountId)
      .first();

    if (!coworkStripeAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Stripe account not found');
    }

    const externalAccount = await CoworkExternalAccount.query()
      .where('cowork_stripe_account_id', coworkStripeAccount.id)
      .where('id', externalAccountId)
      .first();

    if (!externalAccount) {
      throw new AppError(AppError.NOT_FOUND, 'External Account not found');
    }

    if (externalAccount.defaultForCurrency) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'It is not possible to delete an external account that defaults to payouts. Register a new account or set another account as default.'
      );
    }

    const trx = await Database.transaction();

    try {
      await Payments.deleteExternalAccount(coworkStripeAccount.accountId, externalAccount.stripeId);
      await externalAccount.softDelete();
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
