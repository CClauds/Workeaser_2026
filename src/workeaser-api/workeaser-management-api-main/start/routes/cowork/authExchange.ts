import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/callback', 'Cowork/AuthExchangeController.callback');
}).prefix('api/exchange');
