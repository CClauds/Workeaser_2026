import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/', 'Client/ToursController.store');
})
  .prefix('api/client/spaces/tours')
  .middleware(['auth', `clientAuthorization`]);
