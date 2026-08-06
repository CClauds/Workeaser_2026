/**
 * Routes — Cowork Subscriptions.
 *
 * Sprint A (HF-SPRINT-A-07):
 *  GET    /api/cowork/subscriptions/plans         → lista planos
 *  GET    /api/cowork/subscriptions               → minhas subscriptions
 *  POST   /api/cowork/subscriptions               → criar
 *  POST   /api/cowork/subscriptions/:id/cancel    → cancelar
 *  POST   /api/cowork/subscriptions/:id/sync      → sync com Stripe
 *
 * Sprint F (HF-SPRINT-F-02 / F-05):
 *  POST   /api/cowork/subscriptions/portal-session   → Stripe Customer Portal URL
 *  POST   /api/cowork/subscriptions/:id/change-plan  → mudar plano (proration)
 */
import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/plans', 'Cowork/SubscriptionsController.listPlans');
  Route.get('/', 'Cowork/SubscriptionsController.index');
  Route.post('/', 'Cowork/SubscriptionsController.store');
  // HF-SPRINT-F-02: Customer Portal (path estático antes do /:id pra não conflitar)
  Route.post('/portal-session', 'Cowork/SubscriptionsController.portalSession');
  Route.post('/:id/cancel', 'Cowork/SubscriptionsController.cancel');
  Route.post('/:id/sync', 'Cowork/SubscriptionsController.sync');
  // HF-SPRINT-F-05: mudar plano com proration
  Route.post('/:id/change-plan', 'Cowork/SubscriptionsController.changePlan');
  // HF-SPRINT-H-07: self-service trial extension
  Route.post('/:id/extend-trial-self-service', 'Cowork/SubscriptionsController.extendTrialSelfService');
})
  .prefix('api/cowork/subscriptions')
  .middleware(['auth']);
