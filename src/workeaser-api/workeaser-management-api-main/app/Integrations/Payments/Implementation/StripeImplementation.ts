import Env from '@ioc:Adonis/Core/Env';
import Stripe from 'stripe';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import PaymentsInterface, {
  AccountDataInterface,
  BankAccountInterface,
  CardInterface,
  ChargeInterface,
  ChargeResponseInterface,
  Customer,
  PublicChargeInterface,
  RefundInterface,
  RefundResponseInterface,
  UpdateBankAccountInterface,
  UpdateCardInterface
} from 'App/Integrations/Payments/Payments.interface';

export default class StripeImplementation implements PaymentsInterface {
  private stripeInstance: Stripe;

  /**
   * Create Stripe API instance
   */
  constructor() {
    if (!this.stripeInstance) {
      this.stripeInstance = new Stripe(Env.get('STRIPE_SECRET_KEY'), {
        apiVersion: '2020-08-27'
      });
    }
  }

  /**
   * Customers
   */
  async createCustomer(data: Customer): Promise<string> {
    try {
      const customer = await this.stripeInstance.customers.create({
        name: data.name,
        email: data.email
      });

      return customer.id;
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  /**
   * Cards
   */
  async listCards(customerId: string): Promise<CardInterface[]> {
    try {
      const cards = await this.stripeInstance.customers.listSources(customerId, {
        object: 'card'
      });

      const returnCards: CardInterface[] = [];

      cards.data.forEach((card: any) => {
        returnCards.push(this.adaptStripeResponseToCard(card));
      });

      return returnCards;
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async getCard(customerId: string, cardId: string): Promise<CardInterface> {
    try {
      const searchCard: any = await this.stripeInstance.customers.retrieveSource(
        customerId,
        cardId
      );

      return this.adaptStripeResponseToCard(searchCard);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async createCard(customerId: string, token: string): Promise<CardInterface> {
    try {
      const newCard: any = await this.stripeInstance.customers.createSource(customerId, {
        source: token
      });

      return this.adaptStripeResponseToCard(newCard);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async updateCard(
    customerId: string,
    cardId: string,
    data: UpdateCardInterface
  ): Promise<CardInterface> {
    try {
      const updateCard = await this.stripeInstance.customers.updateSource(customerId, cardId, {
        name: data.name,
        exp_month: data.expMonth,
        exp_year: data.expYear
      });

      return this.adaptStripeResponseToCard(updateCard);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async deleteCard(customerId: string, cardId: string): Promise<void> {
    try {
      await this.stripeInstance.customers.deleteSource(customerId, cardId);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  private adaptStripeResponseToCard(data: any): CardInterface {
    return {
      id: data.id,
      cardholderName: data.name,
      brand: data.brand,
      country: data.country,
      expMonth: data.exp_month,
      expYear: data.exp_year,
      lastDigits: data.last4,
      funding: data.funding
    };
  }

  /**
   * Bank accounts
   */
  async listBankAccounts(customerId: string): Promise<BankAccountInterface[]> {
    try {
      const accounts = await this.stripeInstance.customers.listSources(customerId, {
        object: 'bank_account'
      });

      const returnAccounts: BankAccountInterface[] = [];

      accounts.data.forEach((account: any) => {
        returnAccounts.push(this.adaptStripeResponseToBankAccount(account));
      });

      return returnAccounts;
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async createBankAccount(customerId: string, token: string): Promise<BankAccountInterface> {
    try {
      const newAccount = await this.stripeInstance.customers.createSource(customerId, {
        source: token
      });

      return this.adaptStripeResponseToBankAccount(newAccount);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async deleteBankAccount(customerId: string, bankAccountId: string): Promise<void> {
    try {
      await this.stripeInstance.customers.deleteSource(customerId, bankAccountId);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async getBankAccount(customerId: string, bankAccountId: string): Promise<BankAccountInterface> {
    try {
      const searchAccount: any = await this.stripeInstance.customers.retrieveSource(
        customerId,
        bankAccountId
      );

      return this.adaptStripeResponseToBankAccount(searchAccount);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async updateBankAccount(
    customerId: string,
    bankAccountId: string,
    data: UpdateBankAccountInterface
  ): Promise<BankAccountInterface> {
    try {
      const updateAccount = await this.stripeInstance.customers.updateSource(
        customerId,
        bankAccountId,
        {
          account_holder_name: data.accountHolderName
        }
      );

      return this.adaptStripeResponseToBankAccount(updateAccount);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  private adaptStripeResponseToBankAccount(data: any): BankAccountInterface {
    return {
      id: data.id,
      holderName: data.account_holder_name,
      holderType: data.account_holder_type,
      bankName: data.bank_name,
      country: data.country,
      currency: data.currency,
      lastDigits: data.last4,
      routingNumber: data.routing_number
    };
  }

  /**
   * Charges
   */
  async createCharge(
    data: ChargeInterface,
    destinationAccount: string,
    feeAmount?: number
  ): Promise<ChargeResponseInterface> {
    try {
      const newCharge = await this.stripeInstance.charges.create({
        amount: data.amount,
        currency: data.currency,
        source: data.source,
        customer: data.customerId,
        description: data.description,
        destination: {
          account: destinationAccount
        },
        application_fee_amount: feeAmount
      });

      return this.adaptStripeChargeResponse(newCharge);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async createPublicCharge(
    data: PublicChargeInterface,
    destinationAccount: string,
    feeAmount?: number
  ): Promise<ChargeResponseInterface> {
    try {
      const newCharge = await this.stripeInstance.charges.create({
        amount: data.amount,
        currency: data.currency,
        source: data.source,
        description: data.description,
        destination: {
          account: destinationAccount
        },
        application_fee_amount: feeAmount
      });

      return this.adaptStripeChargeResponse(newCharge);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async getCharge(chargeId: string): Promise<ChargeResponseInterface> {
    try {
      const charge = await this.stripeInstance.charges.retrieve(chargeId);
      return this.adaptStripeChargeResponse(charge);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async refund(data: RefundInterface): Promise<RefundResponseInterface> {
    try {
      const refund = await this.stripeInstance.refunds.create({
        amount: data.amount,
        charge: data.charge,
        refund_application_fee: true,
        reverse_transfer: true
      });

      const result: RefundResponseInterface = {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      };

      return result;
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  private adaptStripeChargeResponse(data: Stripe.Charge): ChargeResponseInterface {
    return {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      disputed: data.disputed,
      paid: data.paid,
      refunded: data.refunded,
      failureCode: data.failure_code,
      failureMessage: data.failure_code
    };
  }

  /**
   * Stripe Connect
   */
  async createAccount(data: AccountDataInterface): Promise<string> {
    try {
      const account = await this.stripeInstance.accounts.create({
        type: 'custom',
        country: data.country,
        email: data.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });

      return account.id;
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async getOnboardingUrl(accountId: string): Promise<string> {
    try {
      const onboarding = await this.stripeInstance.accountLinks.create({
        account: accountId,
        refresh_url: ApplicationUrls.STRIPE.REFRESH_URL,
        return_url: ApplicationUrls.STRIPE.RETURN_URL,
        type: 'account_onboarding'
      });

      return onboarding.url;
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async createExternalAccount(
    accountId: string,
    externalAccountToken: string,
    defaultForCurrency?: boolean
  ): Promise<Stripe.Card | Stripe.BankAccount> {
    try {
      const external = await this.stripeInstance.accounts.createExternalAccount(accountId, {
        external_account: externalAccountToken,
        default_for_currency: defaultForCurrency
      });

      return external;
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async changeDefaultExternalAccount(accountId: string, externalAccountId: string) {
    try {
      await this.stripeInstance.accounts.updateExternalAccount(accountId, externalAccountId, {
        default_for_currency: true
      });
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }

  async deleteExternalAccount(accountId: string, externalAccountId: string) {
    try {
      await this.stripeInstance.accounts.deleteExternalAccount(accountId, externalAccountId);
    } catch (error) {
      throw new AppError(error.statusCode, error.message);
    }
  }
}
