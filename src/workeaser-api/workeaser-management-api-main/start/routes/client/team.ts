import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Client/TeamMembersController.listInvites');
  Route.post('/', 'Client/TeamMembersController.sendInvite');
  Route.delete('/:id', 'Client/TeamMembersController.cancelInvite');
})
  .prefix('api/client/teams/invites')
  .middleware(['auth', `clientAuthorization`]);

Route.get('api/client/teams/invites/:token', 'Client/TeamMembersController.showInvite');
Route.post('api/client/teams/invites/:token', 'Client/TeamMembersController.acceptInvite');

Route.group(() => {
  Route.get('/', 'Client/TeamMembersController.index');
})
  .prefix('api/client/teams')
  .middleware(['auth', `clientAuthorization`]);
