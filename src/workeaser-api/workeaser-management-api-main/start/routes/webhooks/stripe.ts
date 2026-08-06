import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/', 'Webhooks/StripeController.store');
}).prefix('api/webhooks/stripe');
