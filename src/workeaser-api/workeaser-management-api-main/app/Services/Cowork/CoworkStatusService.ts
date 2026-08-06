import Database from '@ioc:Adonis/Lucid/Database';
import CoworkStripeAccount from 'App/Models/CoworkStripeAccount';
import User from 'App/Models/User';
import StripeConnectService from 'App/Services/Cowork/StripeConnectService';
import AppError from 'App/Utils/AppError';

export default class CoworkStatusService {
  static async index(user: User) {
    await user.load('coworkUser');

    const stripeAccount = await StripeConnectService.createOrGetAccount(
      user.coworkUser.coworkAccountId
    );

    return {
      inReview: stripeAccount.inReview,
      needUpdate: stripeAccount.needUpdate,
      needExternalAccount: stripeAccount.needExternalAccount,
      status: stripeAccount.status
    };
  }

  static async update(
    user: User,
    data: {
      status: string;
    }
  ) {
    await user.load('coworkUser');
    const coworkStripeAccount = await CoworkStripeAccount.findBy(
      'cowork_account_id',
      user.coworkUser.coworkAccountId
    );

    if (!coworkStripeAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Stripe cowork account not found');
    }

    const trx = await Database.transaction();

    try {
      const coworkStripeAccountUpdated = await coworkStripeAccount
        .merge({
          status: data.status
        })
        .useTransaction(trx)
        .save();

      await trx.commit();
      return coworkStripeAccountUpdated;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
