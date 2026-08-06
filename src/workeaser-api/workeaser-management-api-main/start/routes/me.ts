import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'MeController.show');
  Route.put('/', 'MeController.update');

  // HF-SPRINT-B-03: LGPD direitos do titular
  Route.post('/delete-account', 'Me/AccountDeletionController.createRequest');
  Route.get('/delete-account', 'Me/AccountDeletionController.listRequests');
  Route.delete('/delete-account/:id', 'Me/AccountDeletionController.cancelRequest');
  Route.get('/export-data', 'Me/AccountDeletionController.exportData');

  // HF-SPRINT-D-06: 2FA TOTP
  Route.get('/2fa', 'Me/TwoFactorController.status');
  Route.post('/2fa/setup', 'Me/TwoFactorController.setup');
  Route.post('/2fa/verify', 'Me/TwoFactorController.verify');
  Route.post('/2fa/disable', 'Me/TwoFactorController.disable');
})
  .prefix('api/me')
  .middleware('auth');
