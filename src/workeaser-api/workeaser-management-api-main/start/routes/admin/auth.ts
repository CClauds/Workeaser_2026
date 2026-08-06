import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/admin', 'Admin/AuthController.login');
}).prefix('api/auth');
