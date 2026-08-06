import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/checkinvoices', 'PublicInvoicesController.checkInvoices');
  Route.get('/:uuid', 'PublicInvoicesController.show');
  Route.post('/:uuid', 'PublicInvoicesController.pay');
  Route.get('/:uuid/pdf', 'PublicInvoicesController.generatePdf');
})
  .prefix('api/invoice')
  .middleware(['silentAuth']);
