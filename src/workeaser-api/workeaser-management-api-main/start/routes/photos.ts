import Route from '@ioc:Adonis/Core/Route';

Route.get('api/photos/*', 'PhotosController.show');
Route.group(() => {
  Route.post('/', 'PhotosController.store');
})
  .prefix('api/photos')
  .middleware('silentAuth');

Route.group(() => {
  Route.delete('/*', 'PhotosController.delete');
})
  .prefix('api/photos')
  .middleware('auth');
