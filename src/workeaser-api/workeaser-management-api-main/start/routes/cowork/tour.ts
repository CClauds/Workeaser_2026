import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/ToursController.index');
  Route.post('/', 'Cowork/ToursController.store');
  Route.get('/:id', 'Cowork/ToursController.show');
  Route.put('/:id', 'Cowork/ToursController.update');
  Route.delete('/:id', 'Cowork/ToursController.delete');
  Route.post('/:id/approve', 'Cowork/ToursController.approve');
  Route.post('/:id/reject', 'Cowork/ToursController.reject');
})
  .prefix('api/cowork/relationship/tours')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
