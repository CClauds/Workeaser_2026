import Stripe from 'stripe';

export interface Customer {
  email: string;
  name: string;
}

export interface CardInterface {
  id: string;
  cardholderName: string;
  brand: string;
  country?: string;
  expMonth: number;
  expYear: number;
  lastDigits: string;
  funding: string;
}

export interface UpdateCardInterface {
  name?: string;
  expMonth?: string;
  expYear?: string;
}

export interface BankAccountInterface {
  id: string;
  holderName: string;
  holderType: string;
  bankName: string;
  country?: string;
  currency: string;
  lastDigits: string;
  routingNumber: string;
}

export interface UpdateBankAccountInterface {
  accountHolderName?: string;
}

export interface ChargeInterface {
  amount: number;
  customerId: string;
  source: string;
  currency: string;
  description?: string;
}

export interface PublicChargeInterface {
  amount: number;
  source: string;
  currency: string;
  description?: string;
}

export interface ChargeResponseInterface {
  id: string;
  status: string;
  amount: number;
  currency: string;
  disputed: boolean;
  paid: boolean;
  refunded: boolean;
  failureCode?: string | null;
  failureMessage?: string | null;
}

export interface RefundInterface {
  charge: string;
  amount?: number;
}

export interface RefundResponseInterface {
  id: string;
  amount: number;
  status: string | null;
}

export interface AccountDataInterface {
  country: string;
  email: string;
}

export default interface PaymentsInterface {
  createCustomer(data: Customer): Promise<string>;

  listCards(customerId: string): Promise<CardInterface[]>;
  getCard(customerId: string, cardId: string): Promise<CardInterface>;
  createCard(customerId: string, token: string): Promise<CardInterface>;
  deleteCard(customerId: string, cardId: string): Promise<void>;
  updateCard(customerId: string, cardId: string, data: UpdateCardInterface): Promise<CardInterface>;

  listBankAccounts(customerId: string): Promise<BankAccountInterface[]>;
  createBankAccount(customerId: string, token: string): Promise<BankAccountInterface>;
  deleteBankAccount(customerId: string, bankAccountId: string): Promise<void>;
  getBankAccount(customerId: string, bankAccountId: string): Promise<BankAccountInterface>;
  updateBankAccount(
    customerId: string,
    bankAccountId: string,
    data: UpdateBankAccountInterface
  ): Promise<BankAccountInterface>;

  createCharge(
    data: ChargeInterface,
    destinationAccount: string,
    feeAmount?: number
  ): Promise<ChargeResponseInterface>;
  createPublicCharge(
    data: PublicChargeInterface,
    destinationAccount: string,
    feeAmount?: number
  ): Promise<ChargeResponseInterface>;
  getCharge(chargeId: string): Promise<ChargeResponseInterface>;
  refund(data: RefundInterface): Promise<RefundResponseInterface>;

  // Stripe Connect
  createAccount(data: AccountDataInterface): Promise<string>;
  getOnboardingUrl(accountId: string): Promise<string>;
  createExternalAccount(
    accountId: string,
    externalAccountToken: string,
    defaultForCurrency?: boolean
  ): Promise<Stripe.Card | Stripe.BankAccount>;
  changeDefaultExternalAccount(accountId: string, externalAccountId: string);
  deleteExternalAccount(accountId: string, externalAccountId: string);
}
