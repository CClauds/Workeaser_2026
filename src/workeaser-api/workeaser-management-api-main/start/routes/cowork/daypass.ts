import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/DayPassController.index');
  Route.post('/', 'Cowork/DayPassController.store');
  Route.get('/:id', 'Cowork/DayPassController.show');
  Route.delete('/:id', 'Cowork/DayPassController.delete');
  Route.post('/:id/approve', 'Cowork/DayPassController.approve');
  Route.post('/:id/reject', 'Cowork/DayPassController.reject');
})
  .prefix('api/cowork/relationship/daypass')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
