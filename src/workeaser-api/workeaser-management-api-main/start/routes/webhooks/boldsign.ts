import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/', 'Webhooks/BoldSignController.index');
})
  .prefix('api/webhooks/boldsign')
  .middleware(['boldsignValidation']);
