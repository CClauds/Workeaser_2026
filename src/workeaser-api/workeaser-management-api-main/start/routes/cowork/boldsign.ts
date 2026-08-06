import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.post('/identities', 'Cowork/BoldSignsController.CreateIdentity');
  Route.post('/identities/resend', 'Cowork/BoldSignsController.ResendIdentity');
  Route.post('/identities/resend-revoked', 'Cowork/BoldSignsController.ResendRevokedIdentity');
  Route.get('/identities/me', 'Cowork/BoldSignsController.GetIdentity');
})
  .prefix('api/cowork/boldsign')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.ACCOUNT_SETTINGS}`]);
