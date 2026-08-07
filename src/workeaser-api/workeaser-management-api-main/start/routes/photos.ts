import Route from '@ioc:Adonis/Core/Route';

// 1B: GET photos/* ahora requiere auth (antes era público).
Route.group(() => {
  Route.get('/*', 'PhotosController.show');
})
  .prefix('api/photos')
  .middleware('auth');

Route.group(() => {
  Route.post('/', 'PhotosController.store');
})
  .prefix('api/photos')
  .middleware('auth');
// Note: silentAuth removido del POST. Auth completo requerido.

Route.group(() => {
  Route.delete('/*', 'PhotosController.delete');
})
  .prefix('api/photos')
  .middleware('auth');
