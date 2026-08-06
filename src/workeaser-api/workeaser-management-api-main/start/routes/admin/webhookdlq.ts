/**
 * Routes — Admin Webhook DLQ (HF-SPRINT-J-04).
 */
import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/stats', 'Admin/WebhookDLQController.stats');
  Route.get('/:id', 'Admin/WebhookDLQController.show');
  Route.post('/:id/retry', 'Admin/WebhookDLQController.retry');
  Route.post('/:id/discard', 'Admin/WebhookDLQController.discard');
  Route.get('/', 'Admin/WebhookDLQController.index');
})
  .prefix('api/admin/webhook-dlq')
  .middleware(['auth', 'adminAuthorization']);
