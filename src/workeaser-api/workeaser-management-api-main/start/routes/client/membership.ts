import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Client/MyMembershipController.list');
  Route.get('/:id', 'Client/MyMembershipController.show');
  Route.get('/:id/services', 'Client/MyMembershipController.services');
  Route.get('/:id/bookings', 'Client/MyMembershipController.bookings');
  Route.get('/:id/mailbox', 'Client/MyMembershipController.mailbox');
  Route.get('/:id/invoices', 'Client/MyMembershipController.invoices');
})
  .prefix('api/client/membership')
  .middleware(['auth', `clientAuthorization`]);
