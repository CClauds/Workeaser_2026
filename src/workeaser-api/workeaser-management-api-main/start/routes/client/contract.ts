import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/:id/url', 'Client/ContractController.contractUrlClient');
})
  .prefix('api/client/contracts')
  .middleware(['auth', `clientAuthorization`]);
