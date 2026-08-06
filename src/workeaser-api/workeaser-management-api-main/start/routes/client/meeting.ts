import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Client/MeetingController.list');
  Route.get('/:id', 'Client/MeetingController.show');
  Route.post('/request', 'Client/MeetingController.request');
  Route.post('/:id/cancel', 'Client/MeetingController.cancel');
})
  .prefix('api/client/meeting')
  .middleware(['auth', `clientAuthorization`]);
