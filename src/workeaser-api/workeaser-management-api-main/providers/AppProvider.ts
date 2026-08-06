import { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    const DocusignService = (
      await import('App/Integrations/ESignature/Implementation/DocusignImplementation')
    ).default;
    const StripeService = (
      await import('App/Integrations/Payments/Implementation/StripeImplementation')
    ).default;
    const PlaidService = (
      await import('App/Integrations/BankReconciliation/Implementation/PlaidImplementation')
    ).default;

    this.app.container.singleton('Workeaser/Integrations/ESiganture', () => new DocusignService());
    this.app.container.singleton('Workeaser/Integrations/Payments', () => new StripeService());
    this.app.container.singleton(
      'Workeaser/Integrations/BankReconciliation',
      () => new PlaidService()
    );
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
