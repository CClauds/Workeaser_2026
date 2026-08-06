import Route from '@ioc:Adonis/Core/Route';

Route.get('api/wallet/token_link', 'WalletController.generateTokenLink').middleware('silentAuth');

Route.group(() => {
  Route.get('/', 'WalletController.index');
  Route.get('/:payment_type/:id', 'WalletController.show');
  Route.post('/:payment_type', 'WalletController.store');
  Route.put('/:payment_type/:id', 'WalletController.update');
  Route.delete('/:payment_type/:id', 'WalletController.delete');
})
  .prefix('api/wallet')
  .middleware('auth');
