import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Cowork/SearchController.searchUser');
  Route.get('/client/:id', 'Cowork/SearchController.getClientDetails');
  Route.get('/lead/:id', 'Cowork/SearchController.getLeadDetails');
})
  .prefix('api/cowork/search')
  .middleware(['auth']);
