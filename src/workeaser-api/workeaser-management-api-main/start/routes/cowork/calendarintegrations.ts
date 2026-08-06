import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/google/redirect', 'Cowork/AuthGoogleController.redirect');
  Route.get('/exchange/redirect', 'Cowork/AuthExchangeController.redirect');

  Route.get('/', 'Cowork/CalendarIntegrationsController.list');
  Route.delete('/:id', 'Cowork/CalendarIntegrationsController.delete');
})
  .prefix('api/cowork/settings/calendar')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.ACCOUNT_SETTINGS}`]);
