import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'NotificationsController.show');
  Route.get('/count', 'NotificationsController.count');
  // HF-SPRINT-H-05: mark as read
  Route.post('/read-all', 'NotificationsController.markAllAsRead');
  Route.post('/:id/read', 'NotificationsController.markAsRead');
  Route.delete('/:id', 'NotificationsController.delete');
})
  .prefix('api/notifications')
  .middleware(['auth']);
