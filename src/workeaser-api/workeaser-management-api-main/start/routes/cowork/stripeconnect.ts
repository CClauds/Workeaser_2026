import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/onboardingurl', 'Cowork/StripeConnectController.getOnboardingUrl');
  Route.get('/externalaccount', 'Cowork/StripeConnectController.listExternalAccount');
  Route.get('/externalaccount/:id', 'Cowork/StripeConnectController.showExternalAccount');
  Route.post('/externalaccount', 'Cowork/StripeConnectController.createExternalAccount');
  Route.post(
    '/externalaccount/:id/setdefault',
    'Cowork/StripeConnectController.changeDefaultExternalAccount'
  );
  Route.delete('/externalaccount/:id', 'Cowork/StripeConnectController.deleteExternalAccount');
})
  .prefix('api/cowork/stripe')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.FINANCES}`]);
