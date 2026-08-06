import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/EmployeesController.listInvites');
  Route.post('/', 'Cowork/EmployeesController.sendInvite');
  Route.delete('/:id', 'Cowork/EmployeesController.cancelInvite');
})
  .prefix('api/cowork/employees/invites')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.ACCOUNT_SETTINGS}`]);

Route.get('api/cowork/employees/invites/:token', 'Cowork/EmployeesController.showInvite');
Route.post('api/cowork/employees/invites/:token', 'Cowork/EmployeesController.acceptInvite');

Route.group(() => {
  Route.get('/', 'Cowork/EmployeesController.index');
  Route.get('/:id', 'Cowork/EmployeesController.show');
  Route.delete('/:id', 'Cowork/EmployeesController.delete');
})
  .prefix('api/cowork/employees')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.ACCOUNT_SETTINGS}`]);
