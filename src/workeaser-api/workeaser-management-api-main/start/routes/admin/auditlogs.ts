/**
 * Routes — Admin Audit Logs (HF-SPRINT-G-01).
 */
import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/stats', 'Admin/AuditLogController.stats');
  Route.get('/:id', 'Admin/AuditLogController.show');
  Route.get('/', 'Admin/AuditLogController.index');
})
  .prefix('api/admin/audit-logs')
  .middleware(['auth', 'adminAuthorization']);
