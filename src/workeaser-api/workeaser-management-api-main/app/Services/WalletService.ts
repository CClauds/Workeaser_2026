import BankReconciliation from '@ioc:Workeaser/Integrations/BankReconciliation';
import PaymentsService from '@ioc:Workeaser/Integrations/Payments';
import BankAccount from 'App/Models/BankAccount';
import Card from 'App/Models/Card';
import User from 'App/Models/User';
import UserIntegration from 'App/Models/UserIntegration';
import AppError from 'App/Utils/AppError';
import {
  IntegrationServiceEnum,
  PaymentTypesEnum,
  StripeIntegrationEnum,
  WalletTypesEnum
} from 'Contracts/enums';
import { v4 as uuidv4 } from 'uuid';

export default class WalletService {
  static async list(user: User) {
    try {
      const cards = await Card.query()
        .where('user_id', user.id)
        .where('integration_service', IntegrationServiceEnum.STRIPE);

      const bankAccounts = await BankAccount.query()
        .where('user_id', user.id)
        .where('integration_service', IntegrationServiceEnum.STRIPE);

      return { cards: cards, bank_accounts: bankAccounts };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.log(error);

      throw new AppError(AppError.LOGIC_ERROR, 'An error occurred while fetching the wallet');
    }
  }

  static async store(
    user: User,
    method: WalletTypesEnum,
    token: string,
    nickname: string,
    accountId?: string
  ) {
    const customerId = await this.getOrCreateCustomerId(user.id);

    switch (method) {
      case WalletTypesEnum.BANK_ACCOUNT:
        if (!accountId) {
          throw new Error('Plaid error');
        }

        const generateStripeToken = await BankReconciliation.createStripeToken(accountId, token);

        const gatewayAccountBank = await PaymentsService.createBankAccount(
          customerId,
          generateStripeToken.token
        );

        const newBankAccount = await BankAccount.create({
          userId: user.id,
          gatewayId: gatewayAccountBank.id,
          integrationService: IntegrationServiceEnum.STRIPE,
          nickname: nickname,
          holderName: gatewayAccountBank.holderName,
          holderType: gatewayAccountBank.holderType,
          bankName: gatewayAccountBank.bankName,
          country: gatewayAccountBank.country,
          currency: gatewayAccountBank.currency,
          lastDigits: gatewayAccountBank.lastDigits,
          routingNumber: gatewayAccountBank.routingNumber
        });

        return newBankAccount;

      case WalletTypesEnum.CARD:
        const gatewayCard = await PaymentsService.createCard(customerId, token);
        const newCard = await Card.create({
          userId: user.id,
          gatewayId: gatewayCard.id,
          integrationService: IntegrationServiceEnum.STRIPE,
          nickname: nickname,
          expMonth: gatewayCard.expMonth,
          expYear: gatewayCard.expYear,
          lastDigits: gatewayCard.lastDigits,
          cardholderName: gatewayCard.cardholderName,
          country: gatewayCard.country,
          brand: gatewayCard.brand,
          funding: gatewayCard.funding
        });

        return newCard;
    }
  }

  static async update(user: User, method: WalletTypesEnum, id: number, data: any) {
    const customerId = await this.getOrCreateCustomerId(user.id);

    switch (method) {
      case WalletTypesEnum.BANK_ACCOUNT:
        const bankAccount = await BankAccount.findOrFail(id);
        const updateStripe = await PaymentsService.updateBankAccount(
          customerId,
          bankAccount.gatewayId,
          {
            accountHolderName: data.holder_name
          }
        );

        const updateBankAccount = await bankAccount
          .merge({
            nickname: data.nickname,
            holderName: updateStripe.holderName
          })
          .save();

        return updateBankAccount;
      case WalletTypesEnum.CARD:
        const card = await Card.findOrFail(id);
        const gatewayCard = await PaymentsService.updateCard(customerId, card.gatewayId, {
          name: data.cardholder_name,
          expMonth: data.exp_month,
          expYear: data.exp_year
        });

        const updateCard = await card
          .merge({
            nickname: data.nickname,
            expMonth: gatewayCard.expMonth,
            expYear: gatewayCard.expYear,
            cardholderName: gatewayCard.cardholderName
          })
          .save();

        return updateCard;
    }
  }

  static async show(user: User, method: WalletTypesEnum, id: number) {
    switch (method) {
      case WalletTypesEnum.BANK_ACCOUNT:
        const bankAccount = await BankAccount.query()
          .where('user_id', user.id)
          .where('id', id)
          .first();

        if (!bankAccount) {
          throw new AppError(AppError.NOT_FOUND, 'Bank account not found');
        }

        return bankAccount;
      case WalletTypesEnum.CARD:
        const card = await Card.query().where('user_id', user.id).where('id', id).first();

        if (!card) {
          throw new AppError(AppError.NOT_FOUND, 'Card not found');
        }

        return card;
    }
  }

  static async delete(user: User, method: WalletTypesEnum, id: number) {
    const customerId = await this.getOrCreateCustomerId(user.id);

    switch (method) {
      case WalletTypesEnum.BANK_ACCOUNT:
        const bankAccount = await BankAccount.find(id);

        if (!bankAccount) {
          throw new AppError(AppError.NOT_FOUND, 'Bank Account not found');
        }

        await PaymentsService.deleteBankAccount(customerId, bankAccount.gatewayId);
        await bankAccount.softDelete();

        break;
      case WalletTypesEnum.CARD:
        const card = await Card.find(id);

        if (!card) {
          throw new AppError(AppError.NOT_FOUND, 'Card not found');
        }

        await PaymentsService.deleteCard(customerId, card.gatewayId);
        await card.softDelete();

        break;
    }
  }

  static async generateTokenLink(user?: User) {
    const tempUser = uuidv4();

    return await BankReconciliation.createLinkToken({
      userId: user ? String(user.id) : `TEMP_USER_${tempUser}`,
      userName: user ? user.fullName : 'Anon Payment',
      userEmail: user ? user.email : `${tempUser}@workeaser.com`
    });
  }

  static async getOrCreateCustomerId(userId: number) {
    const userIntegration = await UserIntegration.query()
      .where('user_id', userId)
      .where('service', IntegrationServiceEnum.STRIPE)
      .where('key', StripeIntegrationEnum.CUSTOMER_ID)
      .first();

    if (!userIntegration) {
      const user = await User.findOrFail(userId);

      const customerId = await PaymentsService.createCustomer({
        email: user.email,
        name: user.fullName
      });

      const newUserIntegration = await UserIntegration.create({
        userId: userId,
        service: IntegrationServiceEnum.STRIPE,
        key: StripeIntegrationEnum.CUSTOMER_ID,
        value: customerId
      });

      return newUserIntegration.value;
    }

    return userIntegration.value;
  }

  static async createCharge(
    userId: number,
    amount: number,
    method: PaymentTypesEnum,
    methodId: number,
    destinationAccount: string,
    feeAmount?: number
  ) {
    const customerId = await this.getOrCreateCustomerId(userId);
    let source;

    switch (method) {
      case PaymentTypesEnum.BANK_ACCOUNT:
        const bankAccount: BankAccount = await BankAccount.query()
          .where('user_id', userId)
          .where('id', methodId)
          .first();

        if (!bankAccount) {
          throw new AppError(AppError.BAD_REQUEST, 'Bank account not found');
        }

        source = bankAccount.gatewayId;
        break;
      case PaymentTypesEnum.CARD:
        const card: BankAccount = await Card.query()
          .where('user_id', userId)
          .where('id', methodId)
          .first();

        if (!card) {
          console.log('error');
          throw new AppError(AppError.BAD_REQUEST, 'Card not found');
        }

        source = card.gatewayId;
        break;
      default:
        throw new AppError(AppError.BAD_REQUEST, 'Payment method not valid');
    }

    const payment = await PaymentsService.createCharge(
      {
        amount: amount,
        customerId: customerId,
        source: source,
        currency: 'usd'
      },
      destinationAccount,
      feeAmount
    );

    return payment;
  }

  static async createPublicChargeCard(
    amount: number,
    token: string,
    destinationAccount: string,
    feeAmount?: number
  ) {
    const payment = await PaymentsService.createPublicCharge(
      {
        amount: amount,
        source: token,
        currency: 'usd'
      },
      destinationAccount,
      feeAmount
    );

    return payment;
  }

  static async createPublicChargeBank(
    amount: number,
    publicToken: string,
    accountId: string,
    destinationAccount: string,
    feeAmount?: number
  ) {
    const generateStripeToken = await BankReconciliation.createStripeToken(accountId, publicToken);

    const payment = await PaymentsService.createPublicCharge(
      {
        amount: amount,
        source: generateStripeToken.token,
        currency: 'usd'
      },
      destinationAccount,
      feeAmount
    );

    return payment;
  }

  static async userHasPermissionToUsePaymentMethod(
    userId: number,
    paymentMethod: string,
    methodId: number
  ) {
    switch (paymentMethod) {
      case PaymentTypesEnum.BANK_ACCOUNT:
        const bankAccount = await BankAccount.query()
          .where('id', methodId)
          .where('user_id', userId)
          .first();

        if (bankAccount) {
          return true;
        }

        break;
      case PaymentTypesEnum.CARD:
        const card = await Card.query().where('id', methodId).where('user_id', userId).first();

        if (card) {
          return true;
        }

        break;
    }

    return false;
  }
}
