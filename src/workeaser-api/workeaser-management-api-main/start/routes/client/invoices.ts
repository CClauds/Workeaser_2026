import Route from '@ioc:Adonis/Core/Route';
import { ClientModulesEnum } from 'Contracts/enums';
Route.group(() => {
  Route.get('/', 'Client/InvoicesController.index');
  Route.get('/:id', 'Client/InvoicesController.show');
})
  .prefix('api/client/finance/invoices')
  .middleware(['auth', `clientAuthorization:${ClientModulesEnum.PAYMENT_INVOICES}`]);
