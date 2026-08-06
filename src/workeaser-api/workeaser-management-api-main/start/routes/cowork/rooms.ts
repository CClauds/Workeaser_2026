import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/RoomsController.index');
  Route.get('/export', 'Cowork/RoomsController.export');
  Route.post('/', 'Cowork/RoomsController.store');
  Route.get('/:id', 'Cowork/RoomsController.show');
  Route.put('/:id', 'Cowork/RoomsController.update');
  Route.delete('/:id', 'Cowork/RoomsController.delete');
  Route.post('/import', 'Cowork/RoomsController.import');
  Route.post('/:id/changeavailability', 'Cowork/RoomsController.changeSearchAvailability');
})
  .prefix('api/cowork/rooms')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.LOCATIONS}`]);
