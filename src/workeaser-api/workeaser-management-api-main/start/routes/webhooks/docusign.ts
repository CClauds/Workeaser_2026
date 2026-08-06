import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/', 'Webhooks/DocusignController.store');
}).prefix('api/webhooks/docusign');
