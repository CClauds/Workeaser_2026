import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/callback', 'Cowork/AuthGoogleController.callback');
}).prefix('api/google');
