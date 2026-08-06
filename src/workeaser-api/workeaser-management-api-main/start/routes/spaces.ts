import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'SpacesController.list');
  Route.get('/:id', 'SpacesController.showLocation');
  Route.get('/:serviceType/:id', 'SpacesController.show');
}).prefix('api/spaces');

Route.group(() => {
  Route.get('/vo/:slug', 'SpacesController.showVoBySlug');
  Route.get('/mr/:slug', 'SpacesController.showMrBySlug');
  Route.get('/od/:slug', 'SpacesController.showOdBySlug');
  Route.get('/pr/:slug', 'SpacesController.showPrBySlug');
}).prefix('api/space');
