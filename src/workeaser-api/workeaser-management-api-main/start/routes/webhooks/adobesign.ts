import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Webhooks/AdobeSignController.validation');
  Route.post('/', 'Webhooks/AdobeSignController.store');
}).prefix('api/webhooks/adobesign');
