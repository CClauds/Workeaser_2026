/**
 * Routes — Admin Discounts (HF-SPRINT-H-04).
 */
import Route from '@ioc:Adonis/Core/Route';

// Admin endpoints (gerenciar cupons)
Route.group(() => {
  Route.get('/', 'Admin/DiscountsController.index');
  Route.post('/', 'Admin/DiscountsController.store');
  Route.post('/:id/deactivate', 'Admin/DiscountsController.deactivate');
})
  .prefix('api/admin/discounts')
  .middleware(['auth', 'adminAuthorization']);

// Cliente endpoint (validar cupom antes de subscribe)
Route.group(() => {
  Route.get('/validate-discount', 'Admin/DiscountsController.validatePublic');
})
  .prefix('api/cowork/subscriptions')
  .middleware(['auth']);
