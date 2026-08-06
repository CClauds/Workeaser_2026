import Env from '@ioc:Adonis/Core/Env';
import BankReconciliationInterface, {
  LinkTokenInterface,
  StripeBankAccountTokenInterface,
  TokenExchangeInterface,
  TransactionData,
  UserLinkTokenInterface
} from 'App/Integrations/BankReconciliation/BankReconciliation.interface';
import AppError from 'App/Utils/AppError';
import {
  AccountsGetResponse,
  Configuration,
  CountryCode,
  InstitutionsGetByIdResponse,
  PlaidApi,
  PlaidEnvironments,
  ProcessorStripeBankAccountTokenCreateRequest,
  Products,
  RemovedTransaction,
  Transaction
} from 'plaid';

export default class PlaidImplementation implements BankReconciliationInterface {
  private plaidInstance: PlaidApi;

  /**
   * Create Plaid API instance
   */
  constructor() {
    const configuration = new Configuration({
      basePath:
        Env.get('NODE_ENV') !== 'development'
          ? PlaidEnvironments['production']
          : PlaidEnvironments['sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': Env.get('PLAID_CLIENT_ID'),
          'PLAID-SECRET': Env.get('PLAID_SECRET_KEY')
        }
      }
    });

    if (!this.plaidInstance) {
      this.plaidInstance = new PlaidApi(configuration);
    }
  }

  async createLinkToken(user: UserLinkTokenInterface): Promise<LinkTokenInterface> {
    try {
      const linkToken = await this.plaidInstance.linkTokenCreate({
        user: {
          client_user_id: user.userId,
          email_address: user.userEmail,
          legal_name: user.userName
        },
        client_name: Env.get('PLAID_CLIENT_NAME'),
        products: [Products.Auth],
        country_codes: [CountryCode.Us],
        language: 'en'
      });

      return { token: linkToken.data.link_token };
    } catch (error) {
      console.log(error);
      throw new AppError(error.response.status, 'There was an error communicating with Plaid ');
    }
  }

  async exchangePublicTokenToAccessToken(publicToken: string): Promise<TokenExchangeInterface> {
    try {
      const token = await this.plaidInstance.itemPublicTokenExchange({
        public_token: publicToken
      });

      const tokenExchangeResponse: TokenExchangeInterface = {
        accessToken: token.data.access_token,
        requestId: token.data.request_id,
        itemId: token.data.item_id
      };

      return tokenExchangeResponse;
    } catch (error) {
      console.log(error);
      throw new AppError(error.response.status, 'There was an error communicating with Plaid ');
    }
  }

  async invalidateAccessToken(accessToken: string): Promise<void> {
    try {
      await this.plaidInstance.itemAccessTokenInvalidate({
        access_token: accessToken
      });
    } catch (error) {
      console.log(error);
      throw new AppError(error.response.status, 'There was an error communicating with Plaid ');
    }
  }

  async createStripeToken(
    accountId: string,
    publicToken: string
  ): Promise<StripeBankAccountTokenInterface> {
    try {
      const token = await this.plaidInstance.itemPublicTokenExchange({
        public_token: publicToken
      });

      const accessToken = token.data.access_token;

      const request: ProcessorStripeBankAccountTokenCreateRequest = {
        access_token: accessToken,
        account_id: accountId
      };

      const stripeTokenResponse = await this.plaidInstance.processorStripeBankAccountTokenCreate(
        request
      );
      const bankAccountToken = stripeTokenResponse.data.stripe_bank_account_token;

      return { token: bankAccountToken };
    } catch (error) {
      console.log(error);
      throw new AppError(error.response.status, 'There was an error communicating with Plaid ');
    }
  }

  async getAccountInfo(accessToken: string): Promise<AccountsGetResponse> {
    try {
      const info = await this.plaidInstance.accountsGet({
        access_token: accessToken
      });

      return info.data;
    } catch (error) {
      console.log(error);
      throw new AppError(error.response.status, 'There was an error communicating with Plaid ');
    }
  }

  async getBankInfo(insitutionID: string): Promise<InstitutionsGetByIdResponse> {
    try {
      const info = await this.plaidInstance.institutionsGetById({
        institution_id: insitutionID,
        country_codes: [CountryCode.Us]
      });

      return info.data;
    } catch (error) {
      console.log(error);
      throw new AppError(error.response.status, 'There was an error communicating with Plaid ');
    }
  }

  async syncTransactions(accessToken: string, cursor: string): Promise<TransactionData> {
    let added: Transaction[] = [];
    let modified: Transaction[] = [];
    let removed: RemovedTransaction[] = [];
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await this.plaidInstance.transactionsSync({
          access_token: accessToken,
          cursor: cursor !== '' ? cursor : undefined
        });

        added = added.concat(response.data.added);
        modified = modified.concat(response.data.modified);
        removed = removed.concat(response.data.removed);
        hasMore = response.data.hasMore;
        cursor = response.data.next_cursor;
      }

      return {
        added,
        modified,
        removed,
        nextCursor: cursor
      };
    } catch (error) {
      console.log(error);
      throw new AppError(error.response.status, 'There was an error communicating with Plaid ');
    }
  }
}
