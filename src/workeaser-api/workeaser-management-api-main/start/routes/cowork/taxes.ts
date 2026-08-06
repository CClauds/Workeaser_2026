import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/TaxesController.index');
  Route.post('/', 'Cowork/TaxesController.store');
  Route.get('/:id', 'Cowork/TaxesController.show');
  Route.put('/:id', 'Cowork/TaxesController.update');
  Route.delete('/:id', 'Cowork/TaxesController.delete');
})
  .prefix('api/cowork/finance/taxes')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.FINANCES}`]);
