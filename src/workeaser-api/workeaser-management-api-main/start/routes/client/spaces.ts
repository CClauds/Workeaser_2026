import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/tours', 'Client/ToursController.store');
  Route.post('/reserve', 'Client/SpacesController.reserveNow');
})
  .prefix('api/client/spaces')
  .middleware(['auth', `clientAuthorization`]);
