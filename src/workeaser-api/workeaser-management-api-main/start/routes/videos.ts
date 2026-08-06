import Route from '@ioc:Adonis/Core/Route';

Route.get('api/videos/*', 'VideosController.show');
Route.group(() => {
  Route.post('/', 'VideosController.store');
})
  .prefix('api/videos')
  .middleware('silentAuth');

Route.group(() => {
  Route.delete('/*', 'VideosController.delete');
})
  .prefix('api/videos')
  .middleware('auth');
