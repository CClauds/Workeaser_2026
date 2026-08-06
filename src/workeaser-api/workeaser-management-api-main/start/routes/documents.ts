import Route from '@ioc:Adonis/Core/Route';

Route.get('api/documents/*', 'DocumentsController.show');

Route.group(() => {
  Route.post('/', 'DocumentsController.store');
  Route.delete('/*', 'DocumentsController.delete');
})
  .prefix('api/documents')
  .middleware('auth');
