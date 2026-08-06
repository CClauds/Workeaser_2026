import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/ClientsController.index');
  Route.post('/', 'Cowork/ClientsController.store');
  Route.post('/search', 'Cowork/ClientsController.searchClientByEmail');
  Route.get('/export', 'Cowork/ClientsController.export');
  Route.post('/import', 'Cowork/ClientsController.import');
  Route.post('/import-simple', 'Cowork/ClientsController.importSimple'); // HF-SPRINT-L-01

  Route.get('/:id', 'Cowork/ClientsController.show');
  Route.put('/:id', 'Cowork/ClientsController.update');
  Route.delete('/:id', 'Cowork/ClientsController.delete');
  Route.get('/:id/members', 'Cowork/ClientsController.accountMembers');
  Route.get('/:id/overview', 'Cowork/ClientsController.overview');
  Route.get('/:id/products', 'Cowork/ClientsController.productsAndServices');
  Route.get('/:id/benefits', 'Cowork/ClientsController.benefits');
  Route.get('/:id/bookings', 'Cowork/ClientsController.bookings');
  Route.get('/:id/invoices', 'Cowork/ClientsController.invoices');
  Route.get('/:id/mailbox', 'Cowork/ClientsController.mailbox');
})
  .prefix('api/cowork/clients')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
