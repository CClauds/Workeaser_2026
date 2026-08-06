import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Cowork/CoworkStatusController.index');
  Route.put('/', 'Cowork/CoworkStatusController.update');
})
  .prefix('api/cowork/status')
  .middleware(['auth']);
