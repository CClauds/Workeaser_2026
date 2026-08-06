import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/subscriptions', 'Cowork/SettingsController.subscriptions');
  Route.get('/global', 'Cowork/SettingsController.index');
})
  .prefix('api/cowork/settings')
  .middleware(['auth']);

Route.group(() => {
  Route.put('/global', 'Cowork/SettingsController.update');

  Route.get('/banking', 'Cowork/SettingsController.bankingList');
  Route.get('/banking/token', 'Cowork/SettingsController.generateLinkToken');
  Route.post('/banking', 'Cowork/SettingsController.storeBanking');
  Route.delete('/banking/:id', 'Cowork/SettingsController.deleteBanking');
})
  .prefix('api/cowork/settings')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.ACCOUNT_SETTINGS}`]);
