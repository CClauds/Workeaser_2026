import Route from '@ioc:Adonis/Core/Route';

// 1B: GET documents/* ahora requiere auth (antes era público sin verificación de propiedad).
Route.group(() => {
  Route.get('/*', 'DocumentsController.show');
})
  .prefix('api/documents')
  .middleware('auth');

Route.group(() => {
  Route.post('/', 'DocumentsController.store');
  Route.delete('/*', 'DocumentsController.delete');
})
  .prefix('api/documents')
  .middleware('auth');
