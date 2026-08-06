import {
  AccountsGetResponse,
  InstitutionsGetByIdResponse,
  RemovedTransaction,
  Transaction
} from 'plaid';

export interface UserLinkTokenInterface {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface LinkTokenInterface {
  token: string;
}

export interface StripeBankAccountTokenInterface {
  token: string;
}

export interface TokenExchangeInterface {
  accessToken: string;
  itemId: string;
  requestId: string;
}

export interface TransactionData {
  added: Transaction[];
  modified: Transaction[];
  removed: RemovedTransaction[];
  nextCursor: string;
}

export default interface BankReconciliationInterface {
  createLinkToken(user: UserLinkTokenInterface): Promise<LinkTokenInterface>;
  createStripeToken(
    accountId: string,
    publicToken: string
  ): Promise<StripeBankAccountTokenInterface>;
  exchangePublicTokenToAccessToken(publicToken: string): Promise<TokenExchangeInterface>;
  invalidateAccessToken(publicToken: string): Promise<void>;
  getAccountInfo(accessToken: string): Promise<AccountsGetResponse>;
  getBankInfo(insitutionID: string): Promise<InstitutionsGetByIdResponse>;
  syncTransactions(accessToken: string, cursor: string): Promise<TransactionData>;
}
