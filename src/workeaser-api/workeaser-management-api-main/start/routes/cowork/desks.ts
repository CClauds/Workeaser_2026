import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/DesksController.index');
  Route.get('/export', 'Cowork/DesksController.export');
  Route.post('/', 'Cowork/DesksController.store');
  Route.get('/:id', 'Cowork/DesksController.show');
  Route.put('/:id', 'Cowork/DesksController.update');
  Route.delete('/:id', 'Cowork/DesksController.delete');
  Route.post('/import', 'Cowork/DesksController.import');
  Route.post('/:id/changeavailability', 'Cowork/DesksController.changeSearchAvailability');
})
  .prefix('api/cowork/desks')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.LOCATIONS}`]);
