import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  // HF-SPRINT-D-09 + G-03: paths estáticos antes de /:cowork_account_id pra não conflitar
  Route.get('/metrics', 'Admin/SubscriptionsController.metrics');
  Route.get('/cohorts', 'Admin/SubscriptionsController.cohorts'); // HF-SPRINT-G-03
  Route.post('/:id/extend-trial', 'Admin/SubscriptionsController.extendTrial'); // HF-SPRINT-G-05
  Route.get('/:cowork_account_id', 'Admin/SubscriptionsController.show');
})
  .prefix('api/admin/subscriptions')
  .middleware(['auth', `adminAuthorization`]);
