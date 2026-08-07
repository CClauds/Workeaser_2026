import Route from '@ioc:Adonis/Core/Route';

// 1B: GET videos/* ahora requiere auth (antes era público).
Route.group(() => {
  Route.get('/*', 'VideosController.show');
})
  .prefix('api/videos')
  .middleware('auth');

Route.group(() => {
  Route.post('/', 'VideosController.store');
})
  .prefix('api/videos')
  .middleware('auth');

Route.group(() => {
  Route.delete('/*', 'VideosController.delete');
})
  .prefix('api/videos')
  .middleware('auth');
