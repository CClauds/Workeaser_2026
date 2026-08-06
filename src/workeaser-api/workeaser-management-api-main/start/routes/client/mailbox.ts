import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Client/MailboxesController.index');
  Route.get('/:id', 'Client/MailboxesController.show');
  Route.put('/:id', 'Client/MailboxesController.update');
})
  .prefix('api/client/mailbox')
  .middleware(['auth', `clientAuthorization`]);
