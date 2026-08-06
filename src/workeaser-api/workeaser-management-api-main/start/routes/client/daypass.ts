import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/request', 'Client/DayPassController.request');
  Route.post('/visit', 'Client/DayPassController.requestVisit');
})
  .prefix('api/client/daypass')
  .middleware(['auth', `clientAuthorization`]);
